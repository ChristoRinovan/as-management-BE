# PRD: Backend Manajemen Laporan Keuangan Pengeluaran

> Dokumen spesifikasi kebutuhan produk (PRD) untuk MVP Backend API Manajemen Laporan Keuangan Pengeluaran.
> Disusun melalui skill `research-to-prd` dan disetujui sebagai kontrak koding.

## 1. Problem
Pelaporan dan audit keuangan pengeluaran tim saat ini berjalan lambat dan rentan kekeliruan karena data pengeluaran terpisah di spreadsheet (Excel) sedangkan foto bukti nota tersebar di grup WhatsApp. Di sisi lain, anggota tim enggan membuat laporan karena prosesnya manual dan terpisah. Dibutuhkan backend API terintegrasi yang menyatukan pencatatan pengeluaran dengan unggah bukti nota, menyediakan alur persetujuan (approval), serta sistem autentikasi dan manajemen anggota tim berbasis undangan email.

## 2. Goals
- Menyediakan endpoint REST API untuk registrasi anggota via undangan email (token valid 24 jam), aktivasi password, dan autentikasi login yang aman (JWT).
- Menyediakan API manajemen akun anggota tim (melihat daftar anggota, mengaktifkan, dan menonaktifkan status akun).
- Menyediakan API pencatatan laporan pengeluaran terintegrasi langsung dengan upload foto bukti nota ke Cloudinary.
- Menyediakan API audit laporan untuk Ketua Tim (melihat daftar laporan berserta bukti nota, dan mengubah status menjadi *Approved* atau *Rejected*).
- Menyeragamkan format response API menggunakan wrapper umum standar: `{ success: boolean, message: string, data: any }`.

## 3. Non-goals (Secara eksplisit TIDAK ada di versi ini)
- Tidak ada fitur ekspor laporan ke format Excel atau PDF pada rilis MVP ini (ditunda ke versi berikutnya).
- Tidak ada dashboard visual grafik analitik keuangan (ditunda ke versi berikutnya).
- Tidak ada manajemen multi-currency atau hierarki divisi bertingkat (fokus pada tim saat ini dengan mata uang standar IDR).
- Tidak mencakup pengerjaan UI / Frontend (antarmuka dikerjakan terpisah oleh rekan tim frontend).

## 4. Personas
- **Ketua Tim (Lead / Admin)**: Mengelola keanggotaan tim, memeriksa laporan pengeluaran lengkap dengan foto bukti notanya, dan memutuskan persetujuan (*Approved/Rejected*). [Dari cerita]
- **Anggota Tim (Staff)**: Menerima email undangan untuk set password, login, dan membuat laporan pengeluaran detail disertai unggahan foto nota bukti. [Dari cerita]

## 5. User Stories (Maksimal 4 untuk MVP)
| ID | As a… | I want to… | So that… | Priority |
|---|---|---|---|---|
| **US-1** | Ketua Tim & Anggota Tim | Mengundang anggota via email (token valid 24 jam), mengaktivasi password, dan login dengan aman | Akses backend terlindungi dan hanya anggota tim terverifikasi yang dapat masuk | Must |
| **US-2** | Ketua Tim | Melihat daftar anggota tim serta mengaktifkan atau menonaktifkan status akun anggota | Ketua tim dapat mengontrol hak akses anggota tim yang berwenang melapor | Must |
| **US-3** | Anggota Tim | Mencatat data pengeluaran (tanggal, nominal, keterangan) sekaligus mengunggah foto nota bukti ke Cloudinary | Data pengeluaran dan foto bukti tersimpan menyatu dalam satu laporan | Must |
| **US-4** | Ketua Tim | Melihat seluruh daftar laporan pengeluaran beserta foto buktinya dan memberikan status persetujuan (*Approved* / *Rejected*) | Proses audit pengeluaran berjalan cepat, transparan, dan tercatat statusnya | Must |

## 6. Acceptance Criteria (Format: Given / When / Then)
| ID | Story | Given | When | Then |
|---|---|---|---|---|
| **AC-1** | US-1 | Ketua Tim terautentikasi | Mengirim request invite dengan alamat email anggota yang valid | Sistem membuat akun berstatus nonaktif/pending, menghasilkan token aktivasi berlaku 24 jam, dan mengirimkan email undangan verifikasi |
| **AC-2** | US-1 | Calon anggota tim menerima token undangan yang belum kadaluarsa (< 24 jam) | Mengirimkan password baru melalui endpoint aktivasi | Sistem mengupdate status akun menjadi aktif, mengenkripsi (hash) password, dan token undangan dinyatakan kedaluwarsa/hangus |
| **AC-3** | US-1 | Pengguna (Ketua atau Anggota) berstatus aktif | Mengirim email dan password yang valid ke endpoint login | Sistem mengembalikan token autentikasi (JWT) dan informasi profil serta peran (*role*) pengguna dengan format wrapper standar |
| **AC-4** | US-2 | Ketua Tim terautentikasi | Mengirim request update status anggota (aktifkan / nonaktifkan) | Sistem memperbarui status anggota, dan menolak login jika statusnya nonaktif |
| **AC-5** | US-3 | Anggota Tim terautentikasi dan berstatus aktif | Mengirim data pengeluaran (tanggal, nominal, keterangan) beserta file foto nota | Sistem mengunggah foto ke Cloudinary, menyimpan URL bukti nota bersama data pengeluaran berstatus default 'Pending', dan mengembalikan kode status 201 Created |
| **AC-6** | US-3 | Anggota Tim terautentikasi | Mengirim data pengeluaran tanpa menyertakan foto nota atau nominal <= 0 | Sistem menolak request dengan status 400 Bad Request dan menyertakan pesan validasi error yang jelas |
| **AC-7** | US-4 | Ketua Tim terautentikasi | Mengakses endpoint daftar laporan pengeluaran | Sistem mengembalikan seluruh data laporan lengkap dengan nominal, tanggal, keterangan, nama pelapor, status, dan URL foto nota Cloudinary |
| **AC-8** | US-4 | Laporan pengeluaran berstatus 'Pending' | Ketua Tim mengirim request approval (*Approved* atau *Rejected* dengan catatan/alasan) | Sistem memperbarui status laporan tersebut dan mencatat riwayat perubahannya |

## 7. Out of Scope / Rencana Nanti
| Ide Fitur | Sumber Alasan | Kenapa Ditunda |
|---|---|---|
| Ekspor rekap laporan ke Excel / PDF | Permintaan user untuk fokus MVP | Fitur esensial adalah pencatatan dan audit; rekap file bisa ditambahkan setelah alur dasar stabil |
| Grafik analitik & rekap total per kategori | Kesepakatan ruang lingkup | Bukan kebutuhan mendesak untuk audit pengeluaran sehari-hari |
| Notifikasi WhatsApp bot | Cerita awal | Digantikan dengan email undangan resmi dan sistem terpusat |

## 8. Open Questions / Hal yang Belum Diketahui
| # | Pertanyaan / Asumsi | Dampak jika salah | Status |
|---|---|---|---|
| 1 | Provider pengiriman email yang akan digunakan (misal Nodemailer dengan Gmail SMTP, Resend, atau SendGrid) | Menentukan environment variables dan transporter email di backend saat setup proyek | Terbuka (akan disepakati di Fase 0) |

---
### ✅ Checklist Evaluasi PRD
- [x] Maksimal 4 User Story, seluruhnya berstatus "Must"
- [x] Minimal 6 Acceptance Criteria spesifik (bisa pass/fail tanpa perdebatan)
- [x] Fitur kompleks yang tidak esensial sudah masuk Non-goals
- [x] Setiap AC bisa ditelusuri ke User Story induknya
- [x] Tidak ada fakta karangan: semua item berasal dari cerita atau ditandai [Asumsi]
- [x] Open Questions terisi dengan 1 item terbuka
- [x] Format response API disepakati menggunakan wrapper standar: `{ success, message, data }`
- [x] Tidak ada keputusan teknologi (framework/database/hosting) di dokumen ini

