# Arsitektur Sinyal

Gim ditulis dengan HTML, CSS, dan JavaScript biasa. Tidak ada engine, framework, atau langkah build untuk menjalankannya.
Tujuannya supaya semua anggota tim bisa membuka `src/index.html` dan langsung melihat hasil perubahan.

## Pembagian file per peran

| Kamu... | Edit file ini | Jangan khawatir soal |
|---|---|---|
| Game Designer | `src/js/config.js` | logika & UI |
| Narrative Designer | `src/js/data.js` | angka & kode |
| UI/UX Designer | `src/css/style.css`, terutama token di `:root` | logika |
| 2D Artist / Sound | `src/assets/`, lalu minta programmer memasangnya | — |
| Programmer | `logic.js`, `main.js`, `minigame.js`, `audio.js` | — |

Setelah mengubah `config.js` atau `logic.js`, jalankan `npm test` untuk memastikan ketiga ending masih bisa dicapai.

## Urutan script

`config.js` → `data.js` → `logic.js` → `audio.js` → `minigame.js` → `main.js`

Semua file mendaftarkan diri ke satu objek global `SINYAL` (`SINYAL.config`, `SINYAL.data`, `SINYAL.logic`, dan seterusnya).
Tidak memakai ES module supaya gim tetap jalan saat `index.html` dibuka langsung dari folder lewat `file://`.

## Alur permainan

```
Judul → Prolog → Bab 1 (hari 1..7) ──► Bab 2: Kabar ──► Bab 3: Perjalanan ──► Kepergian ──► Ending 1/2/3
                     │        ▲
                     │        └─ tawaran "Pulang sekarang?" (hari 4–6, kalau info ibu ≥ 3) ─┘
                     └─ hari 7: telepon Pak RT memaksa masuk Bab 2
```

## State

Semua kondisi permainan ada di satu objek yang dibuat `SINYAL.logic.newState()`.

| Field | Arti |
|---|---|
| `uang`, `energi`, `mood`, `ikatan` | Stat yang terlihat. Ikatan tampil sebagai warna hati, bukan angka. |
| `kesehatanIbu` | Stat tersembunyi. Terlihat lewat pesan yang makin pendek dan wallpaper yang makin pucat. |
| `infoIbu` | Berapa kali Raka mendapat info kondisi ibu lewat telepon. |
| `day`, `slot` | Hari 1–7 dan slot 1–3. |
| `pulangCepat` | Apakah Raka pulang sebelum telepon Pak RT. |
| `bab3Skor`, `jamPerjalanan` | Akumulasi pilihan di Bab 2 dan Bab 3. |

## Aturan ending

Ada di `computeEnding()` di `logic.js`. Ambangnya diatur di `config.ending`.

1. **Ending 3** kalau Raka pulang cepat dan `ikatan` ≥ `e3Ikatan`.
2. **Ending 2** kalau `ikatan` ≥ `e2Ikatan` atau `infoIbu` ≥ `e2Info`.
3. Selain itu **Ending 1**.
4. Pilihan buruk di Bab 3 (`bab3Skor` ≤ `bab3Turun`) menurunkan ending satu tingkat.
5. Pilihan sangat baik di Bab 3 bisa menaikkan Ending 1 ke Ending 2, asal Raka pernah dapat info ibu.

## Telepon masuk

Jadwal ada di `data.js`, pada `days[n].call`, berisi slot dan penelepon. Maksimal satu telepon dan satu notifikasi per hari, sesuai catatan "notifikasi tidak boleh spam".

- Saat **kerja**, telepon muncul sebagai pop-up kecil di pojok minigame. Angkat menghentikan minigame dan bonus hilang. Tidak dijawab sampai waktu habis dihitung sebagai tak terjawab.
- Saat aksi lain, pop-up muncul di tengah sebelum aksi berjalan.
- Kalau Raka memilih **Telepon Ibu** tepat saat ibu menelepon, panggilan dihitung diangkat.
- Telepon **Pak RT** di hari 7 selalu memicu Bab 2, diangkat atau tidak.

## Menambah konten

- **Hari atau event baru:** tambah entri di `data.days` dan `data.teleponIbu`.
- **Keputusan perjalanan baru:** tambah objek di `data.perjalanan`. Peta di Bab 3 menyesuaikan otomatis.
- **Aksi baru:** tambah di `config.actions` lalu tangani di `applyAction()` di `logic.js`.
