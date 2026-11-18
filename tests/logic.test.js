/*
 * Tes logika Sinyal. Jalankan: node --test tests/
 * Mensimulasikan beberapa gaya bermain dan memastikan ketiga ending bisa dicapai.
 */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function load() {
  const ctx = { console };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const f of ['config.js', 'data.js', 'logic.js']) {
    const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', f), 'utf8');
    vm.runInContext(code, ctx, { filename: f });
  }
  return ctx.SINYAL;
}

const S = load();
const L = S.logic;
const noLuck = () => 0.99; // nongkrong tidak pernah dapat lowongan

/**
 * Mainkan satu run penuh.
 * pickAction(s) -> id aksi; answer(s, call) -> true/false;
 * pulang(s) -> true/false; bab2(s) -> {tiket, bawaan}; travel(s, node) -> idx pilihan
 */
function play(strategy) {
  const s = L.newState();
  let guard = 0;
  while (s.chapter === 'bab1' && guard++ < 100) {
    if (L.offerPulangCepat(s)) {
      L.pilihPulangCepat(s, strategy.pulang(s));
      if (s.chapter !== 'bab1') break;
    }
    let id = strategy.pickAction(s);
    if (!L.canDo(s, id).ok) id = 'istirahat';
    const call = L.callDuring(s, id);
    const ctx = { rng: noLuck, minigameBonus: 36 };
    if (call) ctx.call = strategy.answer(s, call) ? 'angkat' : 'abaikan';
    L.applyAction(s, id, ctx);
    L.advance(s, id);
  }
  assert.strictEqual(s.chapter, 'bab2', 'Bab 1 harus berakhir di Bab 2');
  const b = strategy.bab2(s);
  const r = L.berangkat(s, b.tiket, b.bawaan);
  assert.ok(r.ok, 'berangkat gagal: ' + r.alasan);
  while (s.chapter === 'bab3') {
    const node = S.data.perjalanan[s.travelStep];
    let idx = strategy.travel(s, node);
    let res = L.pilihPerjalanan(s, idx);
    if (!res.ok) res = L.pilihPerjalanan(s, idx === 0 ? 1 : 0);
    assert.ok(res.ok);
  }
  L.finish(s);
  return s;
}

const cheapest = (s) => {
  const t = S.config.tiket.filter((x) => x.harga <= s.uang).sort((a, b) => b.harga - a.harga)[0];
  return { tiket: t.id, bawaan: [] };
};

test('Ending 1: selalu kerja, abaikan semua telepon', () => {
  const s = play({
    pickAction: (s) => (s.energi < 25 ? 'istirahat' : 'kerja'),
    answer: () => false,
    pulang: () => false,
    bab2: cheapest,
    travel: (s, node) => (node.id === 'revisi' ? 0 : 1)
  });
  assert.strictEqual(s.ending, 1, JSON.stringify({ ikatan: s.ikatan, info: s.infoIbu, skor: s.bab3Skor }));
});

test('Ending 2: angkat telepon masuk tapi tidak pulang cepat', () => {
  const s = play({
    pickAction: (s) => (s.energi < 25 ? 'istirahat' : 'kerja'),
    answer: () => true,
    pulang: () => false,
    bab2: cheapest,
    travel: () => 0
  });
  assert.strictEqual(s.ending, 2, JSON.stringify({ ikatan: s.ikatan, info: s.infoIbu, skor: s.bab3Skor }));
});

test('Ending 3: rutin telepon ibu dan pulang lebih cepat', () => {
  const s = play({
    pickAction: (s) => (s.slot === 3 ? 'telepon' : s.energi < 25 ? 'istirahat' : 'kerja'),
    answer: () => true,
    pulang: () => true,
    bab2: (s) => ({ tiket: S.config.tiket.filter((x) => x.harga <= s.uang)[0].id, bawaan: [] }),
    travel: () => 0
  });
  assert.strictEqual(s.pulangCepat, true);
  assert.strictEqual(s.ending, 3, JSON.stringify({ ikatan: s.ikatan, info: s.infoIbu, skor: s.bab3Skor }));
});

test('Pilihan buruk di Bab 3 menurunkan ending', () => {
  const s = play({
    pickAction: (s) => (s.energi < 25 ? 'istirahat' : 'kerja'),
    answer: () => true,
    pulang: () => false,
    bab2: () => ({ tiket: 'numpang', bawaan: [] }),
    travel: (s, node) => (node.id === 'revisi' ? 0 : 1)
  });
  assert.strictEqual(s.ending, 1);
});

test('Telepon Pak RT di hari 7 selalu memicu Bab 2', () => {
  const s = L.newState();
  s.day = 7; s.slot = 2;
  const call = L.callDuring(s, 'istirahat');
  assert.ok(call && call.from === 'pakrt');
  L.applyAction(s, 'istirahat', { call: 'abaikan' });
  assert.strictEqual(s.chapter, 'bab2');
  assert.strictEqual(s.kabarDiterima, true);
});

test('Telepon masuk saat kerja: angkat = bonus hilang', () => {
  const a = L.newState(); a.slot = 2; // hari 1, telepon di slot 2
  const b = L.newState(); b.slot = 2;
  L.applyAction(a, 'kerja', { minigameBonus: 50, call: 'angkat' });
  L.applyAction(b, 'kerja', { minigameBonus: 50, call: 'abaikan' });
  assert.ok(b.uang > a.uang, 'abaikan harus menghasilkan uang lebih');
  assert.ok(a.ikatan > b.ikatan, 'angkat harus menaikkan ikatan');
});

test('Stat tetap dalam batas 0-100 dan uang tidak negatif', () => {
  const s = L.newState();
  for (let i = 0; i < 30 && s.chapter === 'bab1'; i++) {
    const id = L.canDo(s, 'freelance').ok ? 'freelance' : 'istirahat';
    L.applyAction(s, id, { call: 'abaikan', rng: noLuck });
    L.advance(s, id);
    for (const k of ['energi', 'mood', 'ikatan', 'kesehatanIbu']) {
      assert.ok(s[k] >= 0 && s[k] <= 100, k + '=' + s[k]);
    }
    assert.ok(s.uang >= 0);
  }
});

test('Selalu ada tiket yang bisa dibeli (numpang gratis)', () => {
  const s = L.newState(); s.uang = 0; s.chapter = 'bab2';
  assert.ok(L.berangkat(s, 'numpang', []).ok);
});
