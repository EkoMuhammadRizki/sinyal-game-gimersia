/*
 * SINYAL — data.js
 * Semua teks cerita (DRAF PLACEHOLDER). Narrative Designer cukup mengedit file ini.
 * Teks bertingkat memakai tier kesehatan ibu: sehat / lemah / kritis.
 * Semakin lemah ibu, pesannya semakin pendek.
 */
(function (root) {
  'use strict';
  var S = (root.SINYAL = root.SINYAL || {});

  S.data = {
    prolog: [
      'Raka, mahasiswa tingkat akhir, merantau di kota sambil kerja freelance.',
      'Ia sedang mengumpulkan uang untuk mudik. Kerja, deadline, nongkrong. Selalu sibuk.',
      'Di kampung, ibunya sering mengirim pesan. Raka sering membalas: "nanti aja".',
      'Tujuh hari ke depan, kamu yang mengatur waktu Raka.'
    ],

    // Jadwal event per hari. Maksimal 1 notifikasi chat + 1 telepon per hari.
    days: {
      1: { notif: { from: 'Ibu', teks: { sehat: 'Nak, sudah makan? Jangan telat makan ya.', lemah: 'Nak, sudah makan?', kritis: 'Nak, makan?' } },
           call: { slot: 2, from: 'ibu' } },
      2: { notif: { from: 'Ibu', teks: { sehat: 'Kapan pulang, Nak? Ibu masak opor nanti.', lemah: 'Kapan pulang, Nak?', kritis: 'Kapan pulang?' } } },
      3: { notif: { from: 'Ibu', teks: { sehat: 'Ibu kemarin ke pasar, capek sekali. Kamu jaga kesehatan ya.', lemah: 'Ibu agak capek. Kamu sehat?', kritis: 'Ibu capek.' } },
           call: { slot: 1, from: 'ibu' } },
      4: { notif: { from: 'Ibu', teks: { sehat: 'Kalau sempat telepon ya, Nak. Ibu kangen suaramu.', lemah: 'Kalau sempat telepon ya.', kritis: 'Telepon ya.' } },
           call: { slot: 3, from: 'ibu' } },
      5: { notif: { from: 'Ibu', teks: { sehat: 'Ibu batuk sedikit, tapi sudah minum jahe kok.', lemah: 'Ibu batuk2. Gpp.', kritis: 'Batuk.' } },
           call: { slot: 2, from: 'ibu' } },
      6: { notif: { from: 'Pak RT', teks: { sehat: 'Raka, ibumu kemarin titip salam.', lemah: 'Raka, ada kabar dari ibumu. Tolong hubungi beliau.', kritis: 'Raka, ibumu kelihatan pucat. Hubungi beliau.' } },
           call: { slot: 1, from: 'ibu' } },
      7: { notif: { from: 'Ibu', teks: { sehat: 'Nak...', lemah: 'Nak', kritis: 'Nak' } },
           call: { slot: 2, from: 'pakrt', wajib: true } }
    },

    // Isi percakapan saat telepon ibu diangkat / Raka menelepon. [hari][tier]
    teleponIbu: {
      1: { sehat: 'Ibu cerita soal ayam tetangga yang masuk dapur. Ibu tertawa lama.', lemah: 'Ibu bilang baik-baik saja, tapi suaranya pelan.', kritis: 'Ibu lebih banyak diam.' },
      2: { sehat: 'Ibu tanya kapan wisuda. Raka bilang sebentar lagi.', lemah: 'Ibu tanya kapan pulang. Raka belum bisa jawab.', kritis: 'Ibu cuma bilang, "pulang ya".' },
      3: { sehat: 'Ibu bilang badannya pegal habis ke pasar.', lemah: 'Ibu batuk di tengah obrolan, lalu bilang cuma masuk angin.', kritis: 'Napas ibu terdengar berat.' },
      4: { sehat: 'Ibu menyanyikan lagu yang dulu dinyanyikan sebelum Raka tidur.', lemah: 'Ibu batuk lagi. Katanya tidak mau ke dokter, takut merepotkan.', kritis: 'Ibu bilang tidak usah ke dokter. Suaranya hampir tak terdengar.' },
      5: { sehat: 'Ibu bilang sudah minum jahe dan merasa lebih enak.', lemah: 'Batuk ibu makin sering. Ibu menolak ke puskesmas.', kritis: 'Ibu tidak kuat bicara lama. "Ibu tidur dulu ya, Nak."' },
      6: { sehat: 'Ibu minta Raka tidak usah khawatir.', lemah: 'Ibu terdengar lelah. "Kamu kapan pulang, Nak?"', kritis: 'Telepon diangkat Pak RT. Ibu sedang tidur, demamnya tinggi.' },
      7: { sehat: 'Ibu hanya ingin dengar suara Raka.', lemah: 'Ibu terbatuk lama.', kritis: 'Hanya terdengar napas.' }
    },

    // Petunjuk kondisi ibu yang didapat lewat telepon (pemain tidak melihat angka)
    petunjuk: {
      sehat: 'Kondisi ibu: terdengar sehat.',
      lemah: 'Kondisi ibu: ada yang tidak beres. Batuk, mudah lelah.',
      kritis: 'Kondisi ibu: mengkhawatirkan.'
    },

    pakRT: {
      angkat: 'Pak RT: "Raka, ibumu sakit parah. Dari kemarin tidak mau ke rumah sakit. Kamu pulang ya, Nak. Sekarang."',
      abaikan: 'Pesan dari Pak RT: "RAKA. Ibumu sakit parah. Tolong pulang. Sekarang."'
    },

    tawaranPulang: 'Suara batuk ibu di telepon terus terngiang. Kamu tahu ada yang tidak beres. Pulang sekarang, walau tabungan belum cukup?',

    lowongan: 'Teman nongkrong cerita ada kerjaan tambahan. Bonus di kerja berikutnya!',

    malam: [
      'Raka rebahan di kos. Lampu kota masih menyala.',
      'Hujan turun pelan. Raka menatap layar HP.',
      'Notifikasi grup kantor berbunyi terus.',
      'Raka memikirkan tabungan mudiknya.',
      'Suara motor lewat di gang. Kota tidak pernah tidur.',
      'Raka membuka foto lama bersama ibu, lalu menutupnya lagi.',
      'Malam yang panjang.'
    ],

    bab2: {
      judul: 'Bab 2 — Kabar',
      teksKabar: 'Telepon Pak RT mengubah segalanya. Dana mudik sekarang jadi dana darurat.',
      teksCepat: 'Raka memutuskan pulang sebelum ada kabar buruk. Dana mudik dipakai sekarang juga.'
    },

    // Bab 3: titik keputusan di peta. efek: jam, skor, uang, mood
    perjalanan: [
      { id: 'restarea', tempat: 'Rest area', teks: 'Badan Raka pegal setelah berjam-jam di jalan. Istirahat sebentar di rest area?',
        pilihan: [
          { label: 'Lanjut terus', efek: { jam: 0, skor: 1 }, hasil: 'Raka menahan kantuk. Setiap jam berarti.' },
          { label: 'Istirahat dulu', efek: { jam: 2, skor: 0, mood: 10 }, hasil: 'Raka tertidur sebentar, lalu kaget bangun.' }
        ] },
      { id: 'revisi', tempat: 'Di perjalanan', teks: 'Email klien: "Revisi mendadak, bayar 200 ribu, harus selesai malam ini." HP tinggal 30% baterai.',
        pilihan: [
          { label: 'Kerjakan revisi', efek: { jam: 1, skor: -1, uang: 200 }, hasil: 'Uang masuk. Baterai habis. Tidak ada kabar dari kampung.' },
          { label: 'Tolak, telepon Pak RT', efek: { jam: 0, skor: 1 }, hasil: 'Pak RT bilang ibu terus menanyakan Raka.' }
        ] },
      { id: 'ambulans', tempat: 'Kampung', teks: 'Raka sampai. Ibu terbaring lemah dan sulit bernapas. Bagaimana membawanya?',
        pilihan: [
          { label: 'Telepon ambulans (Rp100rb)', butuhUang: 100, efek: { jam: 1, skor: 1, uang: -100 }, hasil: 'Ambulans datang. Petugas memasang oksigen.' },
          { label: 'Bawa sendiri pakai pick-up Pak RT', efek: { jam: 0, skor: 0 }, hasil: 'Raka memangku kepala ibu di bak pick-up.' }
        ] },
      { id: 'rs', tempat: 'Persimpangan', teks: 'RS terdekat hanya puskesmas kecil. RS kota lebih lengkap, tapi dua jam lagi.',
        pilihan: [
          { label: 'RS kota', efek: { jam: 2, skor: 0 }, hasil: 'Jalan berkelok. Raka terus menggenggam tangan ibu.' },
          { label: 'Puskesmas terdekat dulu', efek: { jam: 1, skor: 1 }, hasil: 'Ibu sempat distabilkan, lalu dirujuk ke RS kota.' }
        ] }
    ],

    kepergian: [
      'Di perjalanan menuju RS kota, genggaman ibu melemah.',
      'Garis di monitor menjadi datar.'
    ],

    endings: {
      1: { judul: 'Terlalu Terlambat', warna: 'night',
           teks: [
             'Raka sampai ketika ibu sudah tidak bisa bicara.',
             'Di HP-nya masih ada pesan-pesan yang tidak pernah dibalas: "Nak, sudah makan?"',
             'Tidak ada kata maaf yang sempat didengar.'
           ],
           syarat: 'Jarang menjawab telepon ibu.' },
      2: { judul: 'Bittersweet', warna: 'dusk',
           teks: [
             'Raka sempat merawat ibu, walau hanya sebentar.',
             'Ia sempat bilang maaf. Ibu tersenyum dan mengusap kepalanya, seperti dulu.',
             'Ibu tetap pergi. Tapi Raka tahu, ibu mendengarnya.'
           ],
           syarat: 'Cukup sering berkomunikasi dengan ibu.' },
      3: { judul: 'Pulang yang Sesungguhnya', warna: 'dawn',
           teks: [
             'Raka pulang sebelum terlambat. Beberapa hari terakhir ia habiskan di samping ibu.',
             'Mereka bicara tentang banyak hal: opor, lagu pengantar tidur, ayam tetangga.',
             'Ibu tetap pergi. Sedih, tapi pulangnya Raka tidak sia-sia.'
           ],
           syarat: 'Rutin menjawab telepon, tahu kondisi ibu lebih awal, dan pulang lebih cepat.' }
    },
    tambahanOleh: 'Kue kesukaan ibu masih utuh di meja. Ibu sempat mencicipnya sedikit.',

    // Kata untuk minigame kerja
    kataKerja: ['laporan', 'deadline', 'revisi', 'invoice', 'rapat', 'email', 'klien', 'desain', 'target',
                'lembur', 'proposal', 'presentasi', 'jadwal', 'berkas', 'catatan', 'tagihan', 'kopi', 'data']
  };
})(typeof window !== 'undefined' ? window : globalThis);
