/*
 * SINYAL — minigame.js
 * Minigame kerja: ketik kata yang muncul sebelum waktu habis.
 * Kalau ada telepon masuk, pop-up kecil muncul di pojok.
 */
(function (root) {
  'use strict';
  var S = (root.SINYAL = root.SINYAL || {});

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /**
   * opts: { el, call, callerName, onDone(bonus, callOutcome) }
   * callOutcome: null | 'angkat' | 'abaikan'
   */
  function run(opts) {
    var cfg = S.config.minigame;
    var el = opts.el;
    var words = shuffle(S.data.kataKerja);
    var idx = 0, done = 0, finished = false;
    var start = performance.now();
    var callShown = false, callOutcome = null;
    var raf = null;

    el.innerHTML =
      '<section class="mg">' +
        '<div class="mg-top"><span>Kerja: ketik kata yang muncul</span><span class="mg-time" id="mgTime">' + cfg.durasi + 's</span></div>' +
        '<div class="mg-bar"><div class="mg-bar-fill" id="mgBar"></div></div>' +
        '<div class="mg-desk">' +
          '<div class="mg-laptop"><div class="mg-word" id="mgWord"></div></div>' +
          '<div class="mg-placeholder">[ilustrasi meja kerja: laptop &amp; kopi]</div>' +
        '</div>' +
        '<input id="mgInput" class="mg-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="ketik di sini..." aria-label="Ketik kata">' +
        '<div class="mg-score">Selesai: <b id="mgDone">0</b> · Bonus: Rp<b id="mgBonus">0</b>rb</div>' +
        '<div id="mgCall" class="mg-call hidden" role="alertdialog" aria-label="Ibu memanggil">' +
          '<div class="mg-call-title">📞 ' + (opts.callerName || 'Ibu') + ' memanggil…</div>' +
          '<div class="mg-call-btns"><button class="btn btn-ok" id="mgAngkat">Angkat</button><button class="btn btn-ghost" id="mgAbaikan">Abaikan</button></div>' +
        '</div>' +
      '</section>';

    var $ = function (id) { return el.querySelector('#' + id); };
    var input = $('mgInput');
    var wordEl = $('mgWord');

    function bonus() { return Math.min(cfg.bonusMaks, done * cfg.bonusPerKata); }
    function showWord() { wordEl.textContent = words[idx % words.length]; }
    showWord();
    setTimeout(function () { input.focus(); }, 50);

    input.addEventListener('input', function () {
      if (finished) return;
      var target = words[idx % words.length];
      var v = input.value.trim().toLowerCase();
      if (v === target) {
        done++; idx++;
        input.value = '';
        $('mgDone').textContent = done;
        $('mgBonus').textContent = bonus();
        wordEl.classList.remove('pop'); void wordEl.offsetWidth; wordEl.classList.add('pop');
        S.audio.good();
        showWord();
      } else if (target.indexOf(v) !== 0) {
        input.classList.add('wrong');
      } else {
        input.classList.remove('wrong');
      }
    });

    function end(reason) {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      S.audio.stopRing();
      if (callShown && !callOutcome) callOutcome = 'abaikan'; // tidak dijawab sampai habis = tak terjawab
      var b = reason === 'angkat' ? 0 : bonus();
      opts.onDone(b, callOutcome);
    }

    function showCall() {
      callShown = true;
      $('mgCall').classList.remove('hidden');
      S.audio.ring();
      $('mgAngkat').onclick = function () { callOutcome = 'angkat'; end('angkat'); };
      $('mgAbaikan').onclick = function () {
        callOutcome = 'abaikan';
        S.audio.stopRing();
        $('mgCall').classList.add('hidden');
        input.focus();
      };
    }

    function tick(now) {
      var t = (now - start) / 1000;
      var left = Math.max(0, cfg.durasi - t);
      $('mgTime').textContent = Math.ceil(left) + 's';
      $('mgBar').style.width = (left / cfg.durasi * 100) + '%';
      if (opts.call && !callShown && t >= cfg.callAt) showCall();
      if (left <= 0) return end('waktu');
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
  }

  S.minigame = { run: run };
})(typeof window !== 'undefined' ? window : globalThis);
