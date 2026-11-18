# Halaman itch.io: Checkpoint 19 November 2026

Syarat checkpoint: halaman itch.io paling lambat **Kamis, 19 November 2026** berisi **deskripsi gim** dan **screenshot atau GIF terbaru**.
Tim yang tidak mengisi checkpoint tidak bisa lanjut ke submission.

## Langkah membuat halaman

1. Login ke itch.io, lalu buka **Dashboard → Create new project**.
2. Isi pengaturan berikut.

| Kolom | Isi |
|---|---|
| Title | `Sinyal` |
| Project URL | `sinyal` (atau `sinyal-gimersia` kalau sudah dipakai) |
| Short description or tagline | `7 hari. 1 telepon yang terus kamu tunda. Gim tentang pulang.` |
| Classification | Games |
| Kind of project | **HTML** |
| Release status | **In development** |
| Pricing | No payments |

3. Di bagian **Uploads**, upload `dist/sinyal-web-v0.1.0-checkpoint.zip` hasil `npm run build`.
   Centang **This file will be played in the browser**.
4. Di bagian **Embed options**, isi pengaturan berikut.

| Opsi | Isi |
|---|---|
| Embed in page | Manually set size, **800 × 760** px |
| Mobile friendly | ✅ centang, orientation: Portrait |
| Automatically start on page load | ❌ jangan, agar audio bisa jalan setelah diklik |
| Fullscreen button | ✅ centang |
| Enable scrollbars | ❌ |

5. Salin **Description** di bawah ke kolom Description.
6. Upload screenshot dari `docs/screenshots/`.
7. Isi **Genre** dengan `Interactive Fiction` dan **Tags** dengan `narrative`, `emotional`, `choices-matter`, `multiple-endings`, `short`, `indonesia`, `2d`.
8. Isi **Language** dengan Indonesian.
9. Atur **Visibility**:
   - **Restricted** dengan password kalau panitia cukup menerima link dan password.
   - **Public** kalau panitia perlu membuka halaman tanpa password.
10. Klik **Save**, buka halaman publiknya, mainkan sekali untuk memastikan gim jalan, lalu kirim link ke Producer.

## Description (siap tempel)

```
SINYAL
Sebuah gim tentang pulang.

Raka, mahasiswa tingkat akhir yang merantau, sedang mengumpulkan uang untuk mudik. Hidupnya penuh kerja, deadline, dan nongkrong. Di kampung, ibunya sering mengirim pesan dan menelepon. Raka selalu menjawab: "nanti aja".

Selama 7 hari, kamu yang mengatur waktu Raka. Mengangkat telepon ibu tidak menghasilkan uang. Tapi suatu hari, telepon dari kampung datang bukan dari ibu.

— CARA BERMAIN —
• Setiap hari ada 3 slot waktu: Pagi, Siang, Malam. Pilih satu aksi per slot.
• Kerja: uang naik, energi turun. Ada minigame mengetik kata.
• Freelance: uang lebih besar, tapi memakan 2 slot.
• Nongkrong: mood naik, kadang dapat info lowongan.
• Istirahat: energi pulih.
• Telepon Ibu: tidak menghasilkan uang, tapi Raka jadi tahu kabar ibunya.
• HP bisa berdering kapan saja, bahkan saat kamu sedang kerja. Angkat, atau abaikan?
• Saat kabar buruk datang, pakai tabunganmu untuk pulang dan ambil keputusan di perjalanan.

Tidak ada game over. Ada 3 ending yang bergantung pada pilihanmu.

— KONTROL —
Mouse/sentuh untuk memilih. Keyboard untuk minigame kerja.
Bisa dimainkan di browser desktop maupun HP.

— STATUS —
Prototipe untuk Checkpoint Progress Gimersia Inspire 2026.
Semua tampilan masih placeholder. Ilustrasi, audio, dan naskah final sedang dikerjakan tim.

— TIM —
Game Designer: [nama]
Game Programmer: [nama]
Narrative Designer: [nama]
UI/UX Designer: [nama]
2D Artist & Sound Designer: [nama]
Producer: [nama]

Dibuat untuk Gimersia Inspire 2026, tema "Pulang".
```

## Screenshot yang disarankan

File ada di `docs/screenshots/`. Urutan upload yang disarankan:

1. `01-layar-harian.png` untuk layar utama HP Raka.
2. `02-telepon-masuk.png` untuk pop-up "Ibu memanggil…".
3. `03-minigame-kerja.png` untuk minigame dengan telepon masuk di pojok.
4. `04-perjalanan.png` untuk peta Bab 3 dengan garis detak jantung.
5. `05-ending.png` untuk layar ending.

Untuk mengambil screenshot baru, buka `src/index.html?scene=<nama>` lalu tangkap layar.
Nilai `<nama>` ada di README.

## Untuk submission 29 November

Checklist ini mengikuti buku panduan.

- [ ] Tautan itch.io dengan build Windows atau WebGL. Build browser ini sudah memenuhi.
- [ ] Video gameplay 60 detik sampai 2 menit.
- [ ] Deskripsi, cara bermain, dan minimal 3 screenshot.
- [ ] Pernyataan karya dibuat selama masa pengembangan dan sesuai tema.
- [ ] Declare aset pihak ketiga dari [CREDITS.md](CREDITS.md).
- [ ] Data 2 perwakilan tim untuk final di Bandung.
