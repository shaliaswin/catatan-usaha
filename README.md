# Catatan Usaha

Tools pencatatan cash flow, untung/rugi per proyek, invoice, dan **scan struk
otomatis pakai AI** — untuk usaha kontraktor (landscape, pagar BRC/seng,
kanopi, folding gate, potong rumput) dan wedding organizer.

Dibangun dengan: Next.js (App Router) · Tailwind CSS · Drizzle ORM + SQLite
(via Turso, supaya bisa diakses dari HP) · Better Auth · OpenAI/Gemini Vision.

## Fitur

1. **Dashboard** — total uang masuk/keluar, saldo saat ini, profit bulan
   berjalan, status semua proyek berjalan.
2. **Proyek** — tiap proyek punya laporan untung/rugi sendiri, tidak
   tercampur.
3. **Cash Flow + Scan Struk AI** — foto struk/kwitansi langsung dari kamera
   HP, AI otomatis membaca tanggal, jumlah, jenis transaksi (masuk/keluar),
   dan kategori. Kamu tinggal cek sekilas lalu simpan — jauh lebih cepat dan
   kurang salah ketik dibanding input manual semua.
4. **Invoice** — format seragam, nomor otomatis, DP, sisa tagihan, bisa
   dicetak jadi PDF dari browser.

### Catatan soal AI scan struk

AI membaca foto dan mengisi form secara otomatis, tapi **hasilnya tetap
ditampilkan untuk kamu cek sebelum disimpan** — bukan langsung tersimpan
tanpa dilihat. ini penting karena data keuangan yang salah jauh lebih
merepotkan untuk diperbaiki nanti daripada 5 detik untuk mengecek. Kalau AI
kurang yakin (foto buram, tulisan struk pudar, dll), akan ada catatan
peringatan supaya kamu lebih teliti mengecek angka itu.

## Cara menjalankan di laptop (development)

Prasyarat: Node.js 18+.

1. `cd catatan-usaha`
2. `npm install`
3. `cp .env.example .env`
4. Isi `.env`:
   - `BETTER_AUTH_SECRET` — ketik string acak panjang (minimal 32 karakter)
   - `AI_PROVIDER` — isi `openai` atau `gemini`
   - `OPENAI_API_KEY` atau `GEMINI_API_KEY` — sesuai provider yang dipilih
     (lihat cara dapatkan API key di bagian bawah)
   - Biarkan bagian `TURSO_*` kosong dulu untuk development lokal
5. `npm run db:push` (bikin struktur database di file `sqlite.db`)
6. `npm run dev`
7. Buka `http://localhost:3000`

## Supaya bisa diakses dari HP (production/deploy)

Database file lokal (`sqlite.db`) tidak bisa diakses dari HP karena cuma ada
di laptop kamu. Solusinya: pindahkan database ke **Turso** (tetap SQLite,
gratis untuk pemakaian usaha kecil, dan bisa diakses dari internet), lalu
deploy aplikasinya ke **Vercel** (gratis untuk pemakaian personal).

### Langkah 1 — Buat database Turso

1. Daftar di [turso.tech](https://turso.tech) (bisa pakai akun GitHub)
2. Install CLI Turso, atau langsung buat database lewat dashboard web mereka
3. Setelah database dibuat, kamu akan dapat:
   - **Database URL** (bentuknya `libsql://nama-db-xxx.turso.io`)
   - **Auth Token** (klik "Create Token" di dashboard)
4. Isi dua nilai itu ke `.env` kamu:
   ```
   TURSO_DATABASE_URL=libsql://nama-db-kamu.turso.io
   TURSO_AUTH_TOKEN=isi-token-nya
   ```
5. Jalankan `npm run db:push` sekali lagi — ini akan membuat struktur tabel
   di database Turso (cloud), bukan di file lokal lagi.

### Langkah 2 — Deploy ke Vercel

1. Push folder project ini ke repository GitHub kamu
2. Daftar/masuk ke [vercel.com](https://vercel.com), klik "Add New Project",
   pilih repo kamu
3. Di bagian **Environment Variables**, masukkan semua isi `.env` kamu satu
   per satu (termasuk `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`,
   `BETTER_AUTH_SECRET`, `AI_PROVIDER`, `OPENAI_API_KEY`/`GEMINI_API_KEY`)
   - Ganti `BETTER_AUTH_URL` dan `NEXT_PUBLIC_APP_URL` dengan alamat Vercel
     kamu nanti, contoh `https://catatan-usaha-kamu.vercel.app`
4. Klik Deploy
5. Setelah selesai, buka link Vercel itu dari browser HP kamu, daftar akun,
   dan mulai pakai — bisa dari mana saja, tidak perlu laptop menyala.

Kalau kamu mau, saya bisa bantu tuntun langkah-langkah ini satu per satu
secara interaktif kapan saja.

## Cara dapatkan API Key AI

**OpenAI** (untuk `AI_PROVIDER=openai`):
1. Buka [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Buat API key baru, salin, tempel ke `.env` sebagai `OPENAI_API_KEY`
3. Perlu isi saldo/billing kecil di akun OpenAI (biaya per scan struk sangat
   kecil, hitungan sen)

**Gemini** (untuk `AI_PROVIDER=gemini`):
1. Buka [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Buat API key, salin, tempel ke `.env` sebagai `GEMINI_API_KEY`
3. Gemini punya kuota gratis harian yang cukup besar — cocok untuk mulai

## Backup data

Kalau pakai Turso, data otomatis tersimpan di cloud mereka (lebih aman dari
kehilangan file). Tetap disarankan export berkala lewat dashboard Turso
sebagai backup tambahan.

## Alur pemakaian yang disarankan

1. Proyek baru → input di menu **Proyek**, isi nilai kontrak.
2. Setiap ada nota belanja/kwitansi → buka **Cash Flow** → **Catat
   Transaksi** → foto struknya, biarkan AI isi otomatis, cek sekilas, pilih
   proyek terkait, simpan.
3. Perlu menagih klien → buat **Invoice** dari halaman detail proyek.
4. Cek **Dashboard** rutin untuk lihat proyek mana yang paling untung dan
   saldo yang seharusnya kamu pegang.

## Struktur data (kalau perlu disesuaikan)

Jenis usaha: `landscape`, `pagar_brc`, `pagar_seng`, `kanopi`,
`folding_gate`, `potong_rumput`, `wedding_organizer`, `lainnya` — edit di
`lib/db/schema.ts` (`BUSINESS_TYPES`) dan `lib/utils.ts`
(`BUSINESS_TYPE_LABELS`).
