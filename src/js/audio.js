/*
 * SINYAL — audio.js
 * SFX sementara yang disintesis dengan Web Audio (tanpa file audio).
 * Sound Designer nanti cukup mengganti fungsi di sini dengan file di src/assets/audio/.
 */
(function (root) {
  'use strict';
  var S = (root.SINYAL = root.SINYAL || {});
  var ctx = null;
  var muted = false;
  var ringTimer = null;

  function ac() {
    if (!ctx) {
      var AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, when, vol, type) {
    var c = ac();
    if (!c || muted) return;
    var t = c.currentTime + (when || 0);
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  S.audio = {
    click: function () { tone(660, 0.06, 0, 0.06, 'triangle'); },
    good: function () { tone(880, 0.08, 0, 0.08); tone(1320, 0.1, 0.07, 0.06); },
    bad: function () { tone(220, 0.18, 0, 0.08, 'sawtooth'); },
    notif: function () { tone(988, 0.08, 0, 0.08); tone(1318, 0.12, 0.09, 0.07); },
    ring: function () {
      S.audio.stopRing();
      var burst = function () {
        for (var i = 0; i < 6; i++) tone(i % 2 ? 1046 : 784, 0.07, i * 0.08, 0.1, 'square');
      };
      burst();
      ringTimer = setInterval(burst, 1400);
    },
    stopRing: function () { if (ringTimer) { clearInterval(ringTimer); ringTimer = null; } },
    flatline: function () { tone(1000, 2.5, 0, 0.05); },
    setMuted: function (m) { muted = m; if (m) S.audio.stopRing(); },
    isMuted: function () { return muted; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
