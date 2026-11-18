/*
 * SINYAL — main.js
 * Alur layar: Judul → Prolog → Bab 1 (7 hari) → Bab 2 (Kabar) → Bab 3 (Perjalanan) → Ending.
 * Parameter URL:
 *   ?debug=1          tampilkan stat tersembunyi (kesehatan ibu, info, skor Bab 3)
 *   ?scene=<nama>     lompat ke layar tertentu untuk screenshot:
 *                     title, day, call, minigame, bab2, bab3, ending1, ending2, ending3
 */
(function (root) {
  'use strict';
  var S = root.SINYAL;
  var C = S.config, D = S.data, L = S.logic;
  var doc = root.document;

  var screen = doc.getElementById('screen');
  var overlayEl = doc.getElementById('overlay');
  var toastEl = doc.getElementById('toast');
  var debugEl = doc.getElementById('debug');
  var params = new URLSearchParams(root.location.search);
  var DEBUG = params.get('debug') === '1';

  var G = { s: null, missed: [], heartbeat: null };

  // ---------- util ----------
  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function rp(n) { return 'Rp' + Math.round(n) + 'rb'; }
  function set(html) { stopHeartbeat(); screen.innerHTML = html; screen.scrollTop = 0; updateDebug(); }
  function on(sel, fn) {
    var els = screen.querySelectorAll(sel);
    for (var i = 0; i < els.length; i++) els[i].addEventListener('click', fn);
  }
  function overlay(html, bind) {
    overlayEl.innerHTML = '<div class="sheet">' + html + '</div>';
    overlayEl.classList.remove('hidden');
    if (bind) bind(overlayEl);
    updateDebug();
  }
  function closeOverlay() { overlayEl.classList.add('hidden'); overlayEl.innerHTML = ''; }
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.add('hidden'); }, 2200);
  }
  function storeGet(k) { try { return JSON.parse(root.localStorage.getItem(k)); } catch (e) { return null; } }
  function storeSet(k, v) { try { root.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } }
  function unlocked() { return storeGet('sinyal.endings') || []; }
  function unlock(n) { var u = unlocked(); if (u.indexOf(n) < 0) { u.push(n); storeSet('sinyal.endings', u); } }

  function updateDebug() {
    if (!DEBUG || !G.s) return;
    var s = G.s;
    debugEl.classList.remove('hidden');
    debugEl.textContent = 'DEBUG · bab:' + s.chapter + ' hari:' + s.day + ' slot:' + s.slot +
      ' | ikatan:' + s.ikatan + ' kesehatanIbu:' + s.kesehatanIbu + ' (' + L.tier(s) + ')' +
      ' info:' + s.infoIbu + ' angkat:' + s.panggilanTerjawab + ' abaikan:' + s.panggilanTakTerjawab +
      ' | pulangCepat:' + s.pulangCepat + ' jam:' + s.jamPerjalanan + ' skorBab3:' + s.bab3Skor +
      ' | prediksi ending:' + L.computeEnding(s);
  }

  function heartColor(v) {
    // abu-abu (jauh) → merah muda → merah (dekat)
    var sat = Math.round(10 + v * 0.75);
    var light = Math.round(62 - v * 0.12);
    return 'hsl(350,' + sat + '%,' + light + '%)';
  }

  function bar(label, v, cls) {
    return '<div class="stat"><span>' + label + '</span><div class="meter ' + cls + '"><i style="width:' + v + '%"></i></div></div>';
  }

  // ---------- Judul & prolog ----------
  function showTitle() {
    G.s = null;
    closeOverlay();
    set(
      '<section class="title-screen">' +
        '<div class="title-signal" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
        '<h1>SINYAL</h1>' +
        '<p class="subtitle">sebuah gim tentang pulang</p>' +
        '<button class="btn btn-primary btn-lg" id="bStart">Mulai</button>' +
        '<button class="btn btn-ghost" id="bGallery">Ending yang terbuka (' + unlocked().length + '/3)</button>' +
        '<p class="credit">Gimersia Inspire 2026 · prototipe v' + esc(C.version) + '</p>' +
      '</section>'
    );
    on('#bStart', function () { S.audio.click(); startGame(); });
    on('#bGallery', function () { S.audio.click(); showGallery(); });
  }

  function startGame() {
    G.s = L.newState();
    G.missed = [];
    showPrologue(0);
  }

  function showPrologue(i) {
    var lines = D.prolog.slice(0, i + 1).map(function (l) { return '<p class="fade-in">' + esc(l) + '</p>'; }).join('');
    var last = i >= D.prolog.length - 1;
    set(
      '<section class="story">' +
        '<div class="chapter-tag">Bab 1 — Kota: "Nanti Aja"</div>' +
        lines +
        '<button class="btn btn-primary" id="bNext">' + (last ? 'Mulai hari pertama' : 'Lanjut') + '</button>' +
      '</section>'
    );
    on('#bNext', function () { S.audio.click(); if (last) showDay(); else showPrologue(i + 1); });
  }

  // ---------- Bab 1: layar harian (HP Raka) ----------
  function showDay() {
    var s = G.s;
    if (s.chapter === 'bab2') return showBab2();
    var day = D.days[s.day] || {};
    var t = L.tier(s);
    var k = s.kesehatanIbu / 100;
    var callPending = day.call && !s.callsHandled[s.day] && day.call.slot === s.slot;
    var notifs = '';
    if (day.notif) {
      notifs += '<li class="notif"><b>' + esc(day.notif.from) + '</b><span>' + esc(day.notif.teks[t]) + '</span></li>';
    }
    G.missed.filter(function (m) { return m.day === s.day; }).forEach(function (m) {
      notifs += '<li class="notif notif-missed"><b>' + esc(m.from) + '</b><span>1 panggilan tak terjawab</span></li>';
    });
    if (s.lowonganBonus) notifs += '<li class="notif notif-info"><b>Info</b><span>Ada bonus lowongan untuk kerja berikutnya.</span></li>';

    var actions = Object.keys(C.actions).map(function (id) {
      var a = C.actions[id];
      var ok = L.canDo(s, id).ok;
      var blink = id === 'telepon' && callPending ? ' blink' : '';
      return '<button class="act' + (ok ? '' : ' disabled') + blink + '" data-act="' + id + '" aria-label="' + esc(a.label) + '">' +
        '<span class="act-icon" aria-hidden="true">' + a.icon + '</span><span class="act-label">' + esc(a.label) + '</span>' +
        (a.slots > 1 ? '<span class="act-slot">2 slot</span>' : '') + '</button>';
    }).join('');

    var slotDots = '';
    for (var i = 1; i <= C.slotsPerDay; i++) slotDots += '<i class="' + (i < s.slot ? 'used' : i === s.slot ? 'now' : '') + '"></i>';

    set(
      '<section class="home">' +
        '<header class="statusbar">' +
          '<span class="day">Hari ' + s.day + '/' + C.totalDays + ' · ' + C.slotNames[s.slot - 1] + '</span>' +
          '<span class="slots" title="Sisa waktu hari ini">' + slotDots + '</span>' +
        '</header>' +
        '<div class="stats">' +
          '<div class="money">' + rp(s.uang) + '</div>' +
          bar('Energi', s.energi, 'm-energi') +
          bar('Mood', s.mood, 'm-mood') +
          '<div class="heart" title="Ikatan dengan ibu" style="color:' + heartColor(s.ikatan) + '">♥</div>' +
        '</div>' +
        '<div class="wallpaper" style="filter:saturate(' + (0.25 + 0.75 * k).toFixed(2) + ') brightness(' + (0.8 + 0.2 * k).toFixed(2) + ')">' +
          '<span>[foto Raka &amp; Ibu]</span>' +
        '</div>' +
        '<ul class="notifs">' + (notifs || '<li class="notif notif-empty">Tidak ada notifikasi.</li>') + '</ul>' +
        (L.isLow(s) ? '<p class="warn">Raka lelah atau malas. Aksi kurang efektif.</p>' : '') +
        '<nav class="actions">' + actions + '</nav>' +
      '</section>'
    );
    on('.act', function (e) { doAction(e.currentTarget.getAttribute('data-act')); });

    if (L.offerPulangCepat(s)) showPulangOffer();
  }

  function showPulangOffer() {
    S.audio.notif();
    overlay(
      '<h2>Pulang sekarang?</h2>' +
      '<p>' + esc(D.tawaranPulang) + '</p>' +
      '<p class="muted">Tabungan saat ini: ' + rp(G.s.uang) + '</p>' +
      '<div class="row"><button class="btn btn-primary" id="oYa">Pulang sekarang</button><button class="btn btn-ghost" id="oNanti">Nanti aja</button></div>',
      function (o) {
        o.querySelector('#oYa').onclick = function () { S.audio.click(); L.pilihPulangCepat(G.s, true); closeOverlay(); showBab2(); };
        o.querySelector('#oNanti').onclick = function () { S.audio.click(); L.pilihPulangCepat(G.s, false); closeOverlay(); };
      }
    );
  }

  function callerName(call) { return call.from === 'pakrt' ? 'Pak RT' : 'Ibu'; }

  function doAction(id) {
    var s = G.s;
    var chk = L.canDo(s, id);
    if (!chk.ok) { S.audio.bad(); return toast(chk.alasan); }
    S.audio.click();
    var call = L.callDuring(s, id);
    if (id === 'kerja') {
      S.minigame.run({
        el: screen, call: call, callerName: call ? callerName(call) : null,
        onDone: function (bonus, outcome) { finishAction(id, { minigameBonus: bonus, call: outcome }); }
      });
      return;
    }
    if (call && !(id === 'telepon' && call.from === 'ibu')) {
      showCallPopup(call, function (outcome) { finishAction(id, { call: outcome }); });
      return;
    }
    finishAction(id, {});
  }

  function showCallPopup(call, cb) {
    S.audio.ring();
    var name = callerName(call);
    overlay(
      '<div class="incoming">' +
        '<div class="avatar pulse" aria-hidden="true">' + esc(name.charAt(0)) + '</div>' +
        '<h2>' + esc(name) + ' memanggil…</h2>' +
        '<p class="muted">' + (call.from === 'ibu' ? 'Kalau diangkat, kegiatanmu terganggu.' : 'Nomor kampung.') + '</p>' +
        '<div class="row"><button class="btn btn-ok" id="cAngkat">Angkat</button><button class="btn btn-no" id="cAbaikan">Abaikan</button></div>' +
      '</div>',
      function (o) {
        o.querySelector('#cAngkat').onclick = function () { S.audio.stopRing(); closeOverlay(); cb('angkat'); };
        o.querySelector('#cAbaikan').onclick = function () { S.audio.stopRing(); closeOverlay(); cb('abaikan'); };
      }
    );
  }

  function deltaChips(d) {
    var out = [];
    if (d.uang) out.push('<span class="chip ' + (d.uang > 0 ? 'up' : 'down') + '">' + (d.uang > 0 ? '+' : '') + d.uang + 'rb Uang</span>');
    if (d.energi) out.push('<span class="chip ' + (d.energi > 0 ? 'up' : 'down') + '">' + (d.energi > 0 ? '+' : '') + d.energi + ' Energi</span>');
    if (d.mood) out.push('<span class="chip ' + (d.mood > 0 ? 'up' : 'down') + '">' + (d.mood > 0 ? '+' : '') + d.mood + ' Mood</span>');
    if (d.ikatan) out.push('<span class="chip heart-chip ' + (d.ikatan > 0 ? 'up' : 'down') + '">♥ ' + (d.ikatan > 0 ? 'makin dekat' : 'menjauh') + '</span>');
    return out.join('');
  }

  function finishAction(id, ctx) {
    var s = G.s;
    var res = L.applyAction(s, id, ctx);
    var a = C.actions[id];
    var body = '';
    if (res.call) {
      var name = callerName(res.call);
      if (res.call.answered) {
        body += '<div class="dialog"><b>📞 ' + esc(name) + '</b><p>' + esc(res.call.teks) + '</p>' +
          (res.call.petunjuk ? '<p class="hint">' + esc(res.call.petunjuk) + '</p>' : '') + '</div>';
      } else {
        G.missed.push({ day: s.day, from: name });
        body += '<div class="dialog dialog-missed"><b>' + esc(name) + '</b><p>' + esc(res.call.teks) + '</p></div>';
      }
    }
    if (res.dialog) {
      body += '<div class="dialog"><b>📞 Ibu</b><p>' + esc(res.dialog.teks) + '</p><p class="hint">' + esc(res.dialog.petunjuk) + '</p></div>';
    }
    res.catatan.forEach(function (c) { body += '<p class="note">' + esc(c) + '</p>'; });

    set(
      '<section class="result">' +
        '<div class="result-icon" aria-hidden="true">' + a.icon + '</div>' +
        '<h2>' + esc(a.label) + '</h2>' +
        '<div class="chips">' + deltaChips(res.deltas) + '</div>' +
        body +
        '<button class="btn btn-primary" id="bNext">Lanjut</button>' +
      '</section>'
    );
    if (res.deltas.uang > 0) S.audio.good();
    on('#bNext', function () {
      S.audio.click();
      var adv = L.advance(s, id);
      if (adv.dayEnded) showNight(adv);
      else if (adv.chapterEnded) showBab2();
      else showDay();
    });
  }

  function showNight(adv) {
    var s = G.s;
    var missedToday = G.missed.filter(function (m) { return m.day === adv.hari; }).length;
    var noContact = adv.deltas.ikatan < 0;
    set(
      '<section class="night">' +
        '<div class="moon" aria-hidden="true"></div>' +
        '<h2>Hari ' + adv.hari + ' selesai</h2>' +
        '<p>' + esc(D.malam[(adv.hari - 1) % D.malam.length]) + '</p>' +
        (missedToday ? '<p class="note">' + missedToday + ' panggilan tak terjawab hari ini.</p>' : '') +
        (noContact ? '<p class="note">Hari ini Raka tidak menghubungi ibu.</p>' : '') +
        '<p class="muted">Tabungan: ' + rp(s.uang) + '</p>' +
        '<button class="btn btn-primary" id="bNext">' + (s.chapter === 'bab1' ? 'Tidur' : 'Lanjut') + '</button>' +
      '</section>'
    );
    on('#bNext', function () { S.audio.click(); if (s.chapter === 'bab1') showDay(); else showBab2(); });
  }

  // ---------- Bab 2: Kabar ----------
  function showBab2() {
    var s = G.s;
    closeOverlay();
    var tickets = C.tiket.map(function (t, i) {
      var dis = t.harga > s.uang;
      return '<label class="option' + (dis ? ' disabled' : '') + '"><input type="radio" name="tiket" value="' + t.id + '"' + (dis ? ' disabled' : '') + '>' +
        '<span><b>' + esc(t.label) + '</b> · ' + rp(t.harga) + ' · ±' + t.jam + ' jam<br><small>' + esc(t.ket) + '</small></span></label>';
    }).join('');
    var items = C.bawaan.map(function (b) {
      return '<label class="option"><input type="checkbox" name="bawaan" value="' + b.id + '"><span><b>' + esc(b.label) + '</b> · ' + rp(b.harga) + '</span></label>';
    }).join('');
    set(
      '<section class="bab2">' +
        '<div class="chapter-tag">' + esc(D.bab2.judul) + '</div>' +
        '<p>' + esc(s.pulangCepat ? D.bab2.teksCepat : D.bab2.teksKabar) + '</p>' +
        '<div class="fund">Dana darurat: <b>' + rp(s.uang) + '</b></div>' +
        '<h3>Cara pulang</h3>' + tickets +
        '<h3>Bawa apa?</h3>' + items +
        '<div class="fund">Total: <b id="tot">Rp0rb</b> · Sisa: <b id="sisa">' + rp(s.uang) + '</b></div>' +
        '<button class="btn btn-primary" id="bGo" disabled>Berangkat</button>' +
      '</section>'
    );
    function selection() {
      var t = screen.querySelector('input[name=tiket]:checked');
      var b = Array.prototype.map.call(screen.querySelectorAll('input[name=bawaan]:checked'), function (x) { return x.value; });
      return { tiket: t ? t.value : null, bawaan: b };
    }
    function refresh() {
      var sel = selection();
      var tot = L.totalBab2(sel.tiket, sel.bawaan);
      screen.querySelector('#tot').textContent = rp(tot);
      var sisa = screen.querySelector('#sisa');
      sisa.textContent = rp(s.uang - tot);
      sisa.classList.toggle('neg', tot > s.uang);
      screen.querySelector('#bGo').disabled = !sel.tiket || tot > s.uang;
    }
    Array.prototype.forEach.call(screen.querySelectorAll('input'), function (x) { x.addEventListener('change', function () { S.audio.click(); refresh(); }); });
    on('#bGo', function () {
      var sel = selection();
      var r = L.berangkat(s, sel.tiket, sel.bawaan);
      if (!r.ok) { S.audio.bad(); return toast(r.alasan); }
      S.audio.click();
      showBab3(null);
    });
  }

  // ---------- Bab 3: Perjalanan ----------
  function showBab3(hasil) {
    var s = G.s;
    var nodes = ['Kota'].concat(D.perjalanan.map(function (n) { return n.tempat; })).concat(['RS kota']);
    var pos = s.travelStep; // 0 = baru berangkat
    var map = nodes.map(function (n, i) {
      var cls = i <= pos ? 'done' : '';
      if (i === pos + 1 && s.chapter === 'bab3') cls = 'next';
      return '<li class="' + cls + '"><i></i><span>' + esc(n) + '</span></li>';
    }).join('');
    var node = D.perjalanan[s.travelStep];
    var card;
    if (hasil) {
      card = '<div class="card"><p>' + esc(hasil) + '</p><button class="btn btn-primary" id="bNext">Lanjut</button></div>';
    } else {
      card = '<div class="card"><div class="card-place">' + esc(node.tempat) + '</div><p>' + esc(node.teks) + '</p><div class="col">' +
        node.pilihan.map(function (p, i) {
          var dis = p.butuhUang && s.uang < p.butuhUang;
          return '<button class="btn ' + (i === 0 ? 'btn-primary' : 'btn-ghost') + '" data-pick="' + i + '"' + (dis ? ' disabled title="Uang tidak cukup"' : '') + '>' + esc(p.label) + '</button>';
        }).join('') + '</div></div>';
    }
    set(
      '<section class="bab3">' +
        '<div class="chapter-tag">Bab 3 — Perjalanan: "Pulang"</div>' +
        '<div class="trip-info">' + rp(s.uang) + ' · ' + s.jamPerjalanan + ' jam di jalan</div>' +
        '<ol class="route">' + map + '</ol>' +
        card +
        '<div class="hb-wrap"><span>Kondisi ibu</span><canvas id="hb" width="300" height="60" aria-label="Garis detak jantung ibu"></canvas></div>' +
      '</section>'
    );
    startHeartbeat(screen.querySelector('#hb'), L.kondisiPerjalanan(s), false);
    if (hasil) {
      on('#bNext', function () { S.audio.click(); if (s.chapter === 'ending') showKepergian(); else showBab3(null); });
    } else {
      on('[data-pick]', function (e) {
        var r = L.pilihPerjalanan(s, +e.currentTarget.getAttribute('data-pick'));
        if (!r.ok) { S.audio.bad(); return toast(r.alasan || 'Tidak bisa.'); }
        S.audio.click();
        showBab3(r.hasil);
      });
    }
  }

  function showKepergian() {
    var s = G.s;
    set(
      '<section class="story dark">' +
        D.kepergian.map(function (l, i) { return '<p class="fade-in" style="animation-delay:' + (i * 1.2) + 's">' + esc(l) + '</p>'; }).join('') +
        '<canvas id="hb" width="300" height="60" class="hb-big"></canvas>' +
        '<button class="btn btn-ghost fade-in" style="animation-delay:2.6s" id="bNext">…</button>' +
      '</section>'
    );
    startHeartbeat(screen.querySelector('#hb'), L.kondisiPerjalanan(s), true);
    on('#bNext', function () { S.audio.click(); showEnding(L.finish(s)); });
  }

  function startHeartbeat(canvas, kondisi, flatlineAfter) {
    stopHeartbeat();
    if (!canvas || !canvas.getContext) return;
    var g = canvas.getContext('2d');
    var w = canvas.width, h = canvas.height;
    var x = 0, prevY = h / 2, t0 = performance.now();
    var bpm = 60 + (100 - kondisi) * 0.6;
    var amp = 6 + kondisi * 0.22;
    var color = kondisi > 50 ? '#7fd1a0' : kondisi > 25 ? '#f2c14e' : '#ef6f6c';
    var flatAt = flatlineAfter ? 2200 : Infinity;
    var flatPlayed = false;
    g.fillStyle = '#0f1626'; g.fillRect(0, 0, w, h);
    function frame(now) {
      var t = now - t0;
      var flat = t > flatAt;
      if (flat && !flatPlayed) { flatPlayed = true; S.audio.flatline(); color = '#ef6f6c'; }
      var period = 60000 / bpm;
      var ph = (t % period) / period;
      var y = h / 2;
      if (!flat) {
        if (ph > 0.1 && ph < 0.14) y -= amp * 0.3;
        else if (ph > 0.2 && ph < 0.23) y += amp * 0.3;
        else if (ph >= 0.23 && ph < 0.27) y -= amp;
        else if (ph >= 0.27 && ph < 0.31) y += amp * 0.6;
      }
      g.fillStyle = '#0f1626';
      g.fillRect(x, 0, 14, h);
      g.strokeStyle = color; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x - 2, prevY); g.lineTo(x, y); g.stroke();
      prevY = y;
      x += 2;
      if (x > w) { x = 0; }
      G.heartbeat = requestAnimationFrame(frame);
    }
    G.heartbeat = requestAnimationFrame(frame);
  }
  function stopHeartbeat() { if (G.heartbeat) { cancelAnimationFrame(G.heartbeat); G.heartbeat = null; } }

  // ---------- Ending ----------
  function showEnding(n) {
    var s = G.s;
    var e = D.endings[n];
    unlock(n);
    var extra = (n >= 2 && s.bawaan.indexOf('oleh') >= 0) ? '<p>' + esc(D.tambahanOleh) + '</p>' : '';
    set(
      '<section class="ending ending-' + e.warna + '">' +
        '<div class="ending-art">[ilustrasi ending: ' + (n === 1 ? 'RS, malam' : n === 2 ? 'rumah kampung, senja' : 'rumah kampung, pagi') + ']</div>' +
        '<div class="chapter-tag">Ending ' + n + '</div>' +
        '<h1>' + esc(e.judul) + '</h1>' +
        e.teks.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + extra +
        '<div class="recap">Telepon diangkat: ' + s.panggilanTerjawab + ' · Tak terjawab: ' + s.panggilanTakTerjawab +
          (s.pulangCepat ? ' · Pulang di hari ke-' + s.hariPulang : '') + '</div>' +
        '<div class="row"><button class="btn btn-primary" id="bAgain">Ulangi</button><button class="btn btn-ghost" id="bOther">Lihat ending lain</button></div>' +
      '</section>'
    );
    on('#bAgain', function () { S.audio.click(); startGame(); });
    on('#bOther', function () { S.audio.click(); showGallery(); });
  }

  function showGallery() {
    var u = unlocked();
    var list = [1, 2, 3].map(function (n) {
      var e = D.endings[n];
      var open = u.indexOf(n) >= 0;
      return '<li class="' + (open ? 'open' : 'locked') + '"><b>Ending ' + n + ': ' + (open ? esc(e.judul) : '???') + '</b><small>' + esc(e.syarat) + '</small></li>';
    }).join('');
    overlay(
      '<h2>Ending (' + u.length + '/3)</h2><ul class="gallery">' + list + '</ul>' +
      '<div class="row"><button class="btn btn-primary" id="gPlay">Main lagi</button><button class="btn btn-ghost" id="gClose">Tutup</button></div>',
      function (o) {
        o.querySelector('#gPlay').onclick = function () { S.audio.click(); closeOverlay(); startGame(); };
        o.querySelector('#gClose').onclick = function () { S.audio.click(); closeOverlay(); };
      }
    );
  }

  // ---------- Tombol suara ----------
  var muteBtn = doc.getElementById('mute');
  if (storeGet('sinyal.muted')) { S.audio.setMuted(true); muteBtn.textContent = '🔇'; }
  muteBtn.addEventListener('click', function () {
    var m = !S.audio.isMuted();
    S.audio.setMuted(m);
    storeSet('sinyal.muted', m);
    muteBtn.textContent = m ? '🔇' : '🔊';
    muteBtn.setAttribute('aria-label', m ? 'Nyalakan suara' : 'Matikan suara');
  });

  // ---------- Scene untuk screenshot / debug ----------
  function demoState(over) {
    var s = L.newState();
    for (var k in over) s[k] = over[k];
    G.s = s; G.missed = [];
    return s;
  }
  var scenes = {
    title: showTitle,
    day: function () {
      demoState({ day: 3, slot: 2, uang: 340, energi: 55, mood: 48, ikatan: 52, kesehatanIbu: 58, infoIbu: 2 });
      G.missed.push({ day: 3, from: 'Ibu' });
      G.s.callsHandled[3] = true;
      showDay();
    },
    call: function () {
      demoState({ day: 1, slot: 2 });
      showDay();
      showCallPopup(D.days[1].call, function (o) { finishAction('istirahat', { call: o }); });
    },
    minigame: function () {
      demoState({ day: 1, slot: 2 });
      C.minigame.callAt = 1;
      doAction('kerja');
    },
    bab2: function () { demoState({ chapter: 'bab2', day: 7, uang: 380, ikatan: 60, kabarDiterima: true }); showBab2(); },
    bab3: function () {
      var s = demoState({ chapter: 'bab2', day: 7, uang: 380, ikatan: 60, kesehatanIbu: 40 });
      L.berangkat(s, 'kereta', ['obat']);
      L.pilihPerjalanan(s, 0);
      showBab3(null);
    },
    ending1: function () { demoState({ chapter: 'ending', panggilanTakTerjawab: 5 }); showEnding(1); },
    ending2: function () { demoState({ chapter: 'ending', panggilanTerjawab: 4, panggilanTakTerjawab: 1 }); showEnding(2); },
    ending3: function () { demoState({ chapter: 'ending', panggilanTerjawab: 5, pulangCepat: true, hariPulang: 5 }); showEnding(3); }
  };

  var scene = params.get('scene');
  if (scene && scenes[scene]) scenes[scene]();
  else showTitle();

  // akses dari console untuk debugging
  S.ui = { G: G, showDay: showDay, showTitle: showTitle };
})(window);
