# Technical Architecture — Chess Archive

## 1. Prinsip arsitektur

- Mulai sederhana, lokal, dan berbasis browser.
- Pisahkan aturan catur, bot, tampilan papan, persistence, konten edukasi, dan AI tutor.
- Server hanya diperlukan untuk fitur yang memang membutuhkan rahasia/API, terutama Gemini.
- Jangan menambahkan database/auth pada MVP.
- Semua keputusan versi package perlu diverifikasi saat instalasi terhadap dokumentasi resmi dan kompatibilitas Next.js/React terbaru.

## 2. Stack yang disarankan

- **Framework:** Next.js App Router.
- **Language:** TypeScript strict.
- **Styling:** Tailwind CSS dengan design tokens eksplisit.
- **UI primitives:** komponen internal yang konsisten; boleh memakai Radix/shadcn secara selektif jika mengurangi aksesibilitas yang harus ditulis sendiri. Jangan menginstal library komponen besar hanya untuk beberapa elemen.
- **Icons:** `lucide-react`.
- **Chess rules:** `chess.js` atau pustaka sepadan yang terawat dan diverifikasi.
- **Board UI:** evaluasi package board React yang kompatibel dengan versi React terpilih dan mendukung promotion, responsive sizing, click/tap serta drag. Bungkus dalam adapter internal agar package dapat diganti. Jika package tidak cocok, buat presentasi papan CSS Grid, tetapi tetap gunakan `chess.js` untuk aturan.
- **Chess engine:** Stockfish build untuk browser yang sesuai dengan lisensi dan ukuran bundle yang diterima, berjalan melalui Web Worker.
- **Gemini:** SDK resmi Google Gen AI yang tersedia pada saat implementasi, hanya di server.
- **Validation:** Zod atau validator skema serupa untuk input/response API.
- **Unit/integration tests:** Vitest dan React Testing Library atau alternatif yang kompatibel.
- **E2E:** Playwright atau browser-testing tool yang tersedia di environment.
- **Formatting/lint:** ikuti setup Next.js/ESLint yang sesuai versi; jangan menambahkan tool yang tumpang tindih tanpa kebutuhan.

## 3. Struktur folder sasaran

Antigravity boleh menyesuaikan detail folder bila ada alasan teknis, tetapi pertahankan batas modul dan laporkan perubahan.

```text
chess-archive/
├── AGENTS.md
├── PRD.md
├── README.md
├── .env.example
├── docs/
│   ├── DESIGN_SYSTEM.md
│   ├── UI_UX_SPEC.md
│   ├── SCREEN_SPEC.md
│   ├── TECH_ARCHITECTURE.md
│   ├── CHESS_ENGINE_SPEC.md
│   ├── AI_TUTOR_SPEC.md
│   ├── DATA_MODEL.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── TEST_PLAN.md
│   ├── REFERENCES.md
│   └── IMPLEMENTATION_LOG.md
├── public/
│   ├── pieces/                 # only if custom SVG pieces are used
│   └── engine/                 # only verified local engine assets
├── src/
│   ├── app/
│   │   ├── api/tutor/explain/route.ts
│   │   ├── academy/[lessonId]/page.tsx
│   │   ├── academy/page.tsx
│   │   ├── archive/[gameId]/page.tsx
│   │   ├── archive/page.tsx
│   │   ├── play/page.tsx
│   │   ├── puzzles/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── chessboard/
│   │   └── feedback/
│   ├── features/
│   │   ├── game/
│   │   ├── engine/
│   │   ├── academy/
│   │   ├── puzzles/
│   │   ├── archive/
│   │   └── tutor/
│   ├── lib/
│   │   ├── validation/
│   │   ├── storage/
│   │   └── utils/
│   └── types/
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

## 4. Batas tanggung jawab modul

### Game domain

Mengelola state permainan, status game, konfigurasi game, dan perubahan posisi. Jangan membiarkan komponen UI memodifikasi FEN/PGN secara bebas.

### Chessboard adapter

Menerima posisi, orientation, legal destinations, last move, check state, dan callbacks. Tidak boleh berisi evaluasi strategis atau panggilan Gemini.

### Engine adapter

Satu interface untuk menginisialisasi worker, mengirim posisi/limit, menerima best move/evaluation/PV, membatalkan pencarian, dan menangani timeout/error. Jangan kirim perintah UCI baru yang bertentangan ketika search masih aktif; atur lifecycle dengan jelas.

### Persistence

Gunakan `localStorage` untuk preferensi kecil dan IndexedDB atau repository terisolasi untuk riwayat game/puzzle/progres bila struktur data bertambah. UI tidak boleh bergantung langsung pada detail penyimpanan browser.

### Tutor service

Client mengirim konteks minimum ke server route. Server memvalidasi payload, membangun prompt dan meminta Gemini, memvalidasi output, membatasi isi, dan mengirim respons dengan skema stabil. Client tidak menghubungi Google API secara langsung.

## 5. State management

- Mulai dengan React state/context per feature bila memadai.
- Jangan memasukkan seluruh game state, UI state, dan database state ke satu global store tanpa kebutuhan.
- Pisahkan ephemeral UI state (drawer, active tab, hint count) dari persisted state (settings, progress, archived game).
- Hindari state duplikat yang dapat menyebabkan board, move list, dan FEN berbeda.

## 6. Engine dan performa browser

- Engine harus berjalan dalam worker, bukan main thread.
- UI memiliki status `idle`, `initializing`, `searching`, `ready`, `error`.
- Tambahkan timeout dan kemampuan menghentikan/mereset worker.
- Gunakan limit pencarian yang wajar; jangan melakukan analisis penuh setelah setiap drag.
- Jangan mengirim banyak pencarian bertumpuk. Debounce analisis non-esensial.
- Hormati perangkat lemah dengan batas waktu/depth yang konservatif.
- Pastikan file engine didistribusikan lokal dari versi/paket yang diverifikasi, bukan diambil dari URL random.
- Verifikasi dan penuhi lisensi serta kewajiban penyediaan sumber untuk binary/package Stockfish yang digunakan.

## 7. API tutor

Rute yang disarankan: `POST /api/tutor/explain`.

- Key hanya dibaca di server melalui environment variable.
- `TUTOR_ENABLED=false` atau key kosong harus memberikan respons fallback yang terkontrol.
- Validasi body dengan Zod; batasi panjang pertanyaan, jumlah ply, panjang PV, dan jumlah kandidat langkah.
- Jangan menerima HTML/markup sebagai prompt bebas tanpa pembatasan.
- Jangan log API key, prompt lengkap yang mungkin sensitif, atau raw errors dari provider.
- Tangani 400 invalid input, 429 rate/quota limit, 503 model unavailable, dan 500 unexpected error dengan skema aman.
- Batasi token output, minta format terstruktur/JSON bila didukung SDK, lalu validasi lagi di server.
- Rate limiting in-memory hanya best-effort pada satu proses dan bukan perlindungan memadai untuk deployment serverless publik. Sebelum membuka endpoint publik, tambahkan rate limiter yang sesuai dengan platform/stateful storage atau autentikasi/abuse control.

## 8. Environment variables

Contoh nama:

- `GEMINI_API_KEY` — server only.
- `GEMINI_MODEL` — model yang dipilih setelah memverifikasi ketersediaan dan kuota pada akun saat implementasi.
- `TUTOR_ENABLED` — feature flag.

Tidak ada variabel rahasia dengan prefix `NEXT_PUBLIC_`. `.env.local` di-ignore oleh Git. File `.env.example` hanya memiliki placeholder kosong.

## 9. Deployment dan biaya

- Pengembangan lokal dapat dilakukan tanpa API key dan tanpa database online.
- Untuk Gemini, free-tier quota dan pemrosesan data dapat berubah; cek halaman pricing/rate limits yang berlaku sebelum mengaktifkan publik.
- Deployment Next.js dengan API route memerlukan host yang mendukung runtime server yang dipilih; jangan mengasumsikan export statis dapat menjalankan endpoint Gemini.
- Pilihan host gratis memiliki batasan, syarat penggunaan, dan kemungkinan perubahan. Verifikasi syarat terkini—khususnya penggunaan non-komersial pada tier gratis—sebelum proyek publik/komersial.
- Custom domain bersifat opsional dan dapat menimbulkan biaya.

## 10. Keamanan dan privasi

- Tidak ada autentikasi pada MVP.
- Data lokal berada pada perangkat/browser; jelaskan bahwa data tidak otomatis tersinkron antar perangkat.
- Validasi seluruh input client dan server yang relevan.
- Jangan percaya output Gemini atau request client; revalidasi langkah yang berhubungan dengan posisi catur.
- Hindari HTML mentah dari Gemini. Render teks/Markdown terbatas dengan sanitizer bila diperlukan.
- Tambahkan security headers dan pembatasan ukuran payload saat deployment bila didukung host.

## 11. Strategi perubahan

Jika package, hosting, atau SDK yang direncanakan tidak kompatibel dengan versi terbaru, cari alternatif terawat, tulis catatan keputusan di `docs/IMPLEMENTATION_LOG.md`, dan jangan mengubah kontrak produk secara diam-diam.
