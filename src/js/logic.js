/*
 * SINYAL — logic.js
 * Aturan permainan murni (tanpa DOM). Dipakai oleh UI dan oleh tes otomatis.
 */
(function (root) {
  'use strict';
  var S = (root.SINYAL = root.SINYAL || {});
  var C = S.config;
  var D = S.data;

  var STAT_0_100 = { energi: 1, mood: 1, ikatan: 1, kesehatanIbu: 1 };

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function newState() {
    var s = {
      chapter: 'bab1',
      day: 1,
      slot: 1,
      infoIbu: 0,            // berapa kali Raka mendapat info kondisi ibu
      panggilanTerjawab: 0,
      panggilanTakTerjawab: 0,
      kontakHariIni: false,
      lowonganBonus: 0,
      callsHandled: {},      // { hari: true }
      tawaranDitolak: {},    // { hari: true }
      pulangCepat: false,
      hariPulang: null,
      kabarDiterima: false,
      tiket: null,
      bawaan: [],
      jamPerjalanan: 0,
      bab3Skor: 0,
      travelStep: 0,
      pilihanPerjalanan: {},
      ending: null
    };
    for (var k in C.start) s[k] = C.start[k];
    return s;
  }

  /** Ubah stat dengan batas, catat perubahan di objek deltas. */
  function change(s, key, amount, deltas) {
    if (!amount) return;
    var before = s[key];
    var after = before + amount;
    if (STAT_0_100[key]) after = clamp(after, 0, 100);
    if (key === 'uang') after = Math.max(0, after);
    after = Math.round(after);
    s[key] = after;
    if (deltas) deltas[key] = (deltas[key] || 0) + (after - before);
  }

  function tier(s) {
    if (s.kesehatanIbu >= C.healthTier.sehat) return 'sehat';
    if (s.kesehatanIbu >= C.healthTier.lemah) return 'lemah';
    return 'kritis';
  }

  function isLow(s) { return s.energi < C.lowThreshold || s.mood < C.lowThreshold; }

  function slotsLeft(s) { return C.slotsPerDay - s.slot + 1; }

  /** Cek apakah aksi bisa dipilih. Mengembalikan { ok, alasan }. */
  function canDo(s, id) {
    var a = C.actions[id];
    if (!a) return { ok: false, alasan: 'Aksi tidak dikenal.' };
    if (s.chapter !== 'bab1') return { ok: false, alasan: 'Bukan waktunya.' };
    if (a.slots > slotsLeft(s)) return { ok: false, alasan: 'Waktunya tidak cukup hari ini.' };
    if (a.uang < 0 && s.uang < -a.uang) return { ok: false, alasan: 'Uangnya tidak cukup.' };
    if (id !== 'istirahat' && id !== 'telepon' && s.energi <= 0) return { ok: false, alasan: 'Raka terlalu lelah. Istirahat dulu.' };
    return { ok: true };
  }

  /** Telepon masuk yang terjadi selama aksi ini (kalau ada). */
  function callDuring(s, id) {
    var day = D.days[s.day];
    if (!day || !day.call || s.callsHandled[s.day]) return null;
    var a = C.actions[id];
    var from = s.slot, to = s.slot + (a ? a.slots : 1) - 1;
    if (day.call.slot >= from && day.call.slot <= to) return day.call;
    return null;
  }

  /** Dialog telepon ibu sesuai hari & kondisi. */
  function dialogIbu(s) {
    var t = tier(s);
    var d = D.teleponIbu[s.day] || D.teleponIbu[7];
    return { teks: d[t], petunjuk: D.petunjuk[t], tier: t };
  }

  /** Selesaikan telepon masuk. answered = true/false. */
  function resolveCall(s, call, answered, deltas) {
    deltas = deltas || {};
    s.callsHandled[s.day] = true;
    var out = { answered: answered, from: call.from, deltas: deltas };
    if (call.from === 'pakrt') {
      s.kabarDiterima = true;
      s.chapter = 'bab2';
      out.teks = answered ? D.pakRT.angkat : D.pakRT.abaikan;
      if (!answered) { change(s, 'ikatan', -5, deltas); s.panggilanTakTerjawab++; }
      else s.panggilanTerjawab++;
      return out;
    }
    var e = answered ? C.call.angkat : C.call.abaikan;
    change(s, 'ikatan', e.ikatan, deltas);
    change(s, 'kesehatanIbu', e.kesehatanIbu, deltas);
    if (answered) {
      s.panggilanTerjawab++;
      s.infoIbu++;
      s.kontakHariIni = true;
      var dlg = dialogIbu(s);
      out.teks = dlg.teks;
      out.petunjuk = dlg.petunjuk;
    } else {
      s.panggilanTakTerjawab++;
      out.teks = '1 panggilan tak terjawab dari Ibu.';
    }
    return out;
  }

  /**
   * Jalankan aksi harian.
   * ctx.call: null | 'angkat' | 'abaikan' (keputusan atas telepon masuk selama aksi)
   * ctx.minigameBonus: bonus dari minigame kerja
   * ctx.rng: fungsi acak (default Math.random)
   */
  function applyAction(s, id, ctx) {
    ctx = ctx || {};
    var rng = ctx.rng || Math.random;
    var a = C.actions[id];
    var deltas = {};
    var res = { id: id, deltas: deltas, catatan: [], call: null };
    var low = isLow(s);
    var mult = low ? C.lowMultiplier : 1;
    if (low && (a.uang > 0 || a.mood > 0)) res.catatan.push('Raka lelah atau malas. Hasilnya kurang maksimal.');

    // Telepon masuk selama aksi
    var call = callDuring(s, id);
    if (call) {
      if (id === 'telepon' && call.from === 'ibu') {
        // Raka menelepon tepat saat ibu juga menelepon: dianggap diangkat
        res.call = resolveCall(s, call, true, deltas);
        res.catatan.push('Ternyata ibu juga sedang menelepon.');
      } else {
        res.call = resolveCall(s, call, ctx.call !== 'abaikan', deltas);
      }
    }
    var angkat = res.call && res.call.answered;

    if (id === 'kerja') {
      var bonus = angkat ? 0 : (ctx.minigameBonus || 0) + s.lowonganBonus;
      if (s.lowonganBonus && !angkat) res.catatan.push('Bonus info lowongan dipakai.');
      if (angkat && (ctx.minigameBonus || s.lowonganBonus)) res.catatan.push('Kerja terganggu telepon. Bonus hilang.');
      if (!angkat) s.lowonganBonus = 0;
      change(s, 'uang', (a.uang + bonus) * mult, deltas);
      change(s, 'energi', a.energi, deltas);
      change(s, 'mood', a.mood, deltas);
    } else if (id === 'freelance') {
      var pay = a.uang * mult * (angkat ? C.call.freelancePenalty : 1);
      if (angkat) res.catatan.push('Fokus terpecah. Bayaran berkurang.');
      change(s, 'uang', pay, deltas);
      change(s, 'energi', a.energi, deltas);
      change(s, 'mood', a.mood, deltas);
    } else if (id === 'nongkrong') {
      change(s, 'uang', a.uang, deltas);
      change(s, 'energi', a.energi, deltas);
      change(s, 'mood', a.mood * mult, deltas);
      if (rng() < a.lowonganChance) {
        s.lowonganBonus = a.lowonganBonus;
        res.catatan.push(D.lowongan);
      }
    } else if (id === 'istirahat') {
      change(s, 'energi', a.energi, deltas);
      change(s, 'mood', a.mood, deltas);
    } else if (id === 'telepon') {
      change(s, 'ikatan', a.ikatan, deltas);
      change(s, 'mood', a.mood, deltas);
      change(s, 'kesehatanIbu', a.kesehatanIbu, deltas);
      s.infoIbu++;
      s.kontakHariIni = true;
      res.dialog = dialogIbu(s);
    }
    return res;
  }

  /** Majukan slot waktu. Mengembalikan { dayEnded, chapterEnded }. */
  function advance(s, id) {
    if (s.chapter !== 'bab1') return { dayEnded: false, chapterEnded: true };
    s.slot += C.actions[id] ? C.actions[id].slots : 1;
    if (s.slot > C.slotsPerDay) return endDay(s);
    return { dayEnded: false, chapterEnded: false };
  }

  function endDay(s) {
    var deltas = {};
    change(s, 'kesehatanIbu', C.daily.kesehatanIbu, deltas);
    if (!s.kontakHariIni) {
      change(s, 'ikatan', C.daily.tanpaKontakIkatan, deltas);
      change(s, 'kesehatanIbu', C.daily.tanpaKontakKesehatan, deltas);
    }
    change(s, 'energi', C.daily.tidurEnergi, deltas);
    var summaryDay = s.day;
    s.day++;
    s.slot = 1;
    s.kontakHariIni = false;
    if (s.day > C.totalDays) {
      // Pengaman: kalau entah bagaimana kabar belum diterima
      s.kabarDiterima = true;
      s.chapter = 'bab2';
    }
    return { dayEnded: true, chapterEnded: s.chapter !== 'bab1', hari: summaryDay, deltas: deltas };
  }

  /** Apakah tawaran "pulang sekarang" muncul di awal hari ini? */
  function offerPulangCepat(s) {
    return s.chapter === 'bab1' && s.slot === 1 &&
      s.day >= C.pulangCepat.mulaiHari && s.day < C.totalDays &&
      s.infoIbu >= C.pulangCepat.minInfo && !s.tawaranDitolak[s.day];
  }

  function pilihPulangCepat(s, setuju) {
    if (setuju) {
      s.pulangCepat = true;
      s.hariPulang = s.day;
      s.chapter = 'bab2';
    } else {
      s.tawaranDitolak[s.day] = true;
    }
  }

  /** Bab 2: hitung total belanja dan validasi. */
  function totalBab2(tiketId, bawaanIds) {
    var t = C.tiket.filter(function (x) { return x.id === tiketId; })[0];
    var total = t ? t.harga : 0;
    (bawaanIds || []).forEach(function (id) {
      var b = C.bawaan.filter(function (x) { return x.id === id; })[0];
      if (b) total += b.harga;
    });
    return total;
  }

  function berangkat(s, tiketId, bawaanIds) {
    var t = C.tiket.filter(function (x) { return x.id === tiketId; })[0];
    if (!t) return { ok: false, alasan: 'Pilih cara pulang dulu.' };
    var total = totalBab2(tiketId, bawaanIds);
    if (total > s.uang) return { ok: false, alasan: 'Uangnya tidak cukup.' };
    s.uang -= total;
    s.tiket = tiketId;
    s.bawaan = (bawaanIds || []).slice();
    s.jamPerjalanan += t.jam;
    s.bab3Skor += t.skor;
    s.bawaan.forEach(function (id) {
      var b = C.bawaan.filter(function (x) { return x.id === id; })[0];
      if (b) s.bab3Skor += b.skor;
    });
    s.chapter = 'bab3';
    s.travelStep = 0;
    return { ok: true };
  }

  /** Bab 3: terapkan pilihan di titik perjalanan saat ini. */
  function pilihPerjalanan(s, idx) {
    var node = D.perjalanan[s.travelStep];
    if (!node) return { ok: false };
    var p = node.pilihan[idx];
    if (!p) return { ok: false };
    if (p.butuhUang && s.uang < p.butuhUang) return { ok: false, alasan: 'Uangnya tidak cukup.' };
    var e = p.efek || {};
    s.jamPerjalanan += e.jam || 0;
    s.bab3Skor += e.skor || 0;
    if (e.uang) change(s, 'uang', e.uang);
    if (e.mood) change(s, 'mood', e.mood);
    s.pilihanPerjalanan[node.id] = idx;
    s.travelStep++;
    var selesai = s.travelStep >= D.perjalanan.length;
    if (selesai) s.chapter = 'ending';
    return { ok: true, hasil: p.hasil, selesai: selesai };
  }

  /** Kondisi ibu selama perjalanan (0-100), untuk garis detak jantung. */
  function kondisiPerjalanan(s) {
    return clamp(Math.round(s.kesehatanIbu - s.jamPerjalanan * 1.5), 3, 100);
  }

  function computeEnding(s) {
    var E = C.ending;
    var level;
    if (s.pulangCepat && s.ikatan >= E.e3Ikatan) level = 3;
    else if (s.ikatan >= E.e2Ikatan || s.infoIbu >= E.e2Info) level = 2;
    else level = 1;
    if (s.bab3Skor <= E.bab3Turun && level > 1) level -= 1;
    else if (s.bab3Skor >= E.bab3Naik && level === 1 && s.infoIbu >= E.bab3NaikMinInfo) level = 2;
    return level;
  }

  function finish(s) {
    s.ending = computeEnding(s);
    s.chapter = 'ending';
    return s.ending;
  }

  S.logic = {
    newState: newState, tier: tier, isLow: isLow, canDo: canDo, callDuring: callDuring,
    resolveCall: resolveCall, applyAction: applyAction, advance: advance, endDay: endDay,
    offerPulangCepat: offerPulangCepat, pilihPulangCepat: pilihPulangCepat,
    totalBab2: totalBab2, berangkat: berangkat, pilihPerjalanan: pilihPerjalanan,
    kondisiPerjalanan: kondisiPerjalanan, computeEnding: computeEnding, finish: finish,
    dialogIbu: dialogIbu, slotsLeft: slotsLeft
  };
})(typeof window !== 'undefined' ? window : globalThis);
