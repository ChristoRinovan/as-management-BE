# Sintesis Cerita: Backend Manajemen Laporan Keuangan Pengeluaran

> Dokumen bukti untuk skill `research-to-prd`. Disimpan sebagai `docs/research-synthesis.md`.
> Aturan: HANYA memakai cerita user. Jika sesuatu tidak ada di cerita, tulis "tidak ada di cerita".
> Belum ada ide fitur di dokumen ini — fitur baru muncul di PRD.

### Problem statement
Proses pelaporan dan audit pengeluaran tim terhambat karena data laporan terpisah antara spreadsheet (Excel) dan bukti fisik nota (grup WhatsApp), diperparah dengan keengganan anggota tim menyusun laporan pengeluaran secara manual.

### Personas
| Persona (label peran) | Tujuan | Friksi utama | Sumber |
|---|---|---|---|
| Ketua Tim | Memeriksa & mengaudit laporan pengeluaran yang menyatu dengan bukti nota, serta mengelola akses akun anggota tim. | Kesulitan mencocokkan data di Excel dengan foto nota di WhatsApp secara terpisah saat audit. | [Dari cerita] |
| Anggota Tim (5 orang & bisa bertambah) | Menginput rincian pengeluaran dan mengunggah foto nota bukti dengan cepat dan mudah. | Kerepotan/malas menyusun laporan terpisah. | [Dari cerita] |

### Pain points (maks 5)
| # | Pain point | Bukti (kutipan / parafrase dekat dari cerita) | Siapa | Tag |
|---|---|---|---|---|
| 1 | Data dan bukti nota terpisah | *"laporan itu selalu terpisah antara data dengan foto buktinya. data ada diexcel, foto bukti nota ada di grup WhatsApp."* | Ketua Tim | [Dari cerita] |
| 2 | Proses audit memakan waktu & tidak praktis | *"dia pingin itu jadi satu jadi ga harus terpisah untuk lihat dan audit."* | Ketua Tim | [Dari cerita] |
| 3 | Anggota tim enggan membuat laporan | *"anak buahnya itu males-males bikin laporannya."* | Anggota Tim & Ketua Tim | [Dari cerita] |
| 4 | Akses belum terlindungi & perlu kontrol tim | *"dia ingin agar aman si apps dibuatin login aja... bisa nambahin anak buah via register email... bisa manage anak buah, supaaya bisa aktif dan nonaktifkan anak buah."* | Ketua Tim | [Dari cerita] |
| 5 | Status hasil audit belum ada kepastian | *"bisa ada disetujui dan ditolak"* | Ketua Tim | [Dari cerita] |

### Pertentangan dalam cerita
| Pernyataan A | Pernyataan B | Keputusan user |
|---|---|---|
| *(Tidak ada pertentangan)* | - | - |

### Belum diketahui / Perlu dikonfirmasi
| # | Hal yang belum jelas | Kenapa penting | Status |
|---|---|---|---|
| 1 | Provider pengiriman email yang akan digunakan (misal Resend, SendGrid, Gmail SMTP) | Menentukan environment variables dan konfigurasi nodemailer/transporter email di backend saat setup | Terbuka (akan diputuskan di Fase 0) |

### ✅ Cek sebelum lanjut
- [x] Setiap pain point punya bukti dari cerita (atau dihapus)
- [x] Semua hal yang disimpulkan agent diberi tag [Asumsi]
- [x] Tidak ada ide fitur di dokumen ini

