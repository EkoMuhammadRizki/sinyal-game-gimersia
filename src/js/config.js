/*
 * SINYAL — config.js
 * Semua angka balancing ada di sini supaya Game Designer bisa mengubahnya
 * tanpa menyentuh logika. Satuan uang: ribu rupiah.
 */
(function (root) {
  'use strict';
  var S = (root.SINYAL = root.SINYAL || {});

  S.config = {
    version: '0.1.0-checkpoint',
    totalDays: 7,
    slotsPerDay: 3,
    slotNames: ['Pagi', 'Siang', 'Malam'],

    // Nilai awal stat (0-100, kecuali uang)
    start: { uang: 200, energi: 70, mood: 60, ikatan: 30, kesehatanIbu: 70 },

    // Kalau energi atau mood di bawah ambang ini, aksi "kurang efektif"
    lowThreshold: 20,
    lowMultiplier: 0.5,

    // Efek dasar tiap aksi harian
    actions: {
      kerja:     { label: 'Kerja',       icon: '💼', slots: 1, uang: 60,  energi: -15, mood: -5, minigame: true },
      freelance: { label: 'Freelance',   icon: '💻', slots: 2, uang: 140, energi: -25, mood: -10 },
      nongkrong: { label: 'Nongkrong',   icon: '☕', slots: 1, uang: -30, energi: -5,  mood: 15, lowonganChance: 0.35, lowonganBonus: 30 },
      istirahat: { label: 'Istirahat',   icon: '🛏️', slots: 1, energi: 30, mood: 5 },
      telepon:   { label: 'Telepon Ibu', icon: '📞', slots: 1, ikatan: 15, mood: 5, kesehatanIbu: 2 }
    },

    // Event telepon masuk
    call: {
      angkat:  { ikatan: 10, kesehatanIbu: 2 },
      abaikan: { ikatan: -8, kesehatanIbu: -4 },
      freelancePenalty: 0.7 // uang freelance x0.7 kalau telepon diangkat
    },

    // Pergantian hari
    daily: { kesehatanIbu: -5, tanpaKontakIkatan: -3, tanpaKontakKesehatan: -3, tidurEnergi: 15 },

    // Minigame kerja (ketik kata)
    minigame: { durasi: 12, bonusPerKata: 12, bonusMaks: 60, callAt: 4 },

    // Opsi "pulang lebih cepat" muncul mulai hari ini kalau info kondisi ibu cukup
    pulangCepat: { mulaiHari: 4, minInfo: 3 },

    // Bab 2: tiket & bawaan
    tiket: [
      { id: 'pesawat', label: 'Pesawat + travel', harga: 450, jam: 4,  skor: 1,  ket: 'Paling cepat, paling mahal.' },
      { id: 'kereta',  label: 'Kereta malam',     harga: 250, jam: 9,  skor: 0,  ket: 'Sampai besok pagi.' },
      { id: 'bus',     label: 'Bus ekonomi',      harga: 120, jam: 14, skor: 0,  ket: 'Murah, tapi lama.' },
      { id: 'numpang', label: 'Numpang truk sayur kenalan', harga: 0, jam: 20, skor: -1, ket: 'Gratis. Entah kapan sampai.' }
    ],
    bawaan: [
      { id: 'obat', label: 'Obat & vitamin untuk ibu', harga: 60, skor: 1 },
      { id: 'oleh', label: 'Kue kesukaan ibu',         harga: 40, skor: 0 }
    ],

    // Penentuan ending
    ending: {
      e3Ikatan: 70,  // Ending 3 butuh pulang cepat + ikatan >= ini
      e2Ikatan: 45,  // Ending 2 kalau ikatan >= ini ...
      e2Info: 3,     // ... atau info kondisi ibu >= ini
      bab3Turun: -1, // skor Bab 3 <= ini: ending turun satu tingkat
      bab3Naik: 3,   // skor Bab 3 >= ini: Ending 1 bisa naik ke 2 (kalau pernah dapat info)
      bab3NaikMinInfo: 2
    },

    healthTier: { sehat: 55, lemah: 30 } // di bawah lemah = kritis
  };
})(typeof window !== 'undefined' ? window : globalThis);
