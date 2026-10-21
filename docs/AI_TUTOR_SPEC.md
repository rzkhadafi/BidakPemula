# AI Tutor Specification — Gemini

## 1. Peran

Gemini adalah guru yang menerangkan bahasa catur kepada pemain Indonesia. Ia bukan rules engine, bukan sumber legalitas langkah, dan bukan sumber tunggal untuk menentukan langkah terbaik.

**Sumber kebenaran:**

- `chess.js`/rules library: legalitas langkah dan status game.
- Stockfish: kandidat langkah, score, principal variation, dan analisis posisi.
- Konten lokal: pelajaran dasar dan definisi istilah yang telah dikurasi.
- Gemini: menyusun penjelasan pedagogis berdasarkan konteks terverifikasi.

## 2. Fitur tutor

P0:
- “Jelaskan posisi ini”.
- “Mengapa langkah saya kurang baik?” jika ada analisis engine yang mencukupi.
- Petunjuk bertahap untuk puzzle yang sudah memiliki solusi tervalidasi.
- Penjelasan istilah catur dalam Bahasa Indonesia.
- Saran konsep latihan lanjutan.

Tidak termasuk P0:
- Percakapan tanpa batas/umum.
- Memainkan bidak untuk pengguna.
- Mengubah posisi atau hasil pertandingan atas permintaan teks.
- Mengklaim evaluasi mesin yang tidak tersedia.

## 3. Pemicu request

Jangan meminta model menjawab otomatis untuk setiap langkah. Request hanya terjadi saat pengguna:

- Menekan “Jelaskan langkah”.
- Meminta hint berikutnya.
- Mengirim pertanyaan terkait posisi yang sedang ditinjau.
- Meminta penjelasan setelah hasil analisis selesai.

## 4. Data input yang disarankan

Schema logis request, sesuaikan tipe implementasi namun jaga data minimal:

```ts
type TutorExplainRequest = {
  question: string;                 // bounded, e.g. max 500 chars
  fen: string;                      // current position
  sideToMove: "w" | "b";
  learnerLevel: "pemula" | "santai" | "menengah" | "mahir";
  lastMoveUci?: string;
  recentMovesSan?: string[];        // limited, e.g. last 16 plies
  analysis?: {
    bestMoveUci?: string;
    evaluationCp?: number;
    mateIn?: number | null;
    principalVariationUci?: string[]; // short, bounded line
    alternatives?: Array<{ moveUci: string; evaluationCp?: number }>;
    depth?: number;
  };
  mode: "lesson" | "puzzle" | "gameReview";
};
```

Semua field dari client tidak dipercaya begitu saja. Validasi tipe, batas panjang, FEN, notasi langkah, rentang angka, dan jumlah item di server. Konversi UCI menjadi SAN pada posisi yang sesuai dengan rules library jika perlu.

## 5. Output schema

Minta model mengembalikan struktur yang bisa divalidasi, bukan teks bebas saja. Contoh bentuk:

```ts
type TutorExplainResponse = {
  title: string;
  explanation: string;          // concise Indonesian explanation
  keyIdea: string;
  whatToNotice: string[];       // 1–3 items
  hint?: string;                // hint only; avoid spoiler unless requested
  practiceQuestion?: string;
  glossary?: Array<{ term: string; meaning: string }>;
  caveat?: string;              // used if analysis context is incomplete
};
```

Jangan menerima atau menjalankan `tool_calls`, script, HTML, atau perintah dari output tutor. Jangan biarkan AI menghasilkan state catur baru. Jika output tidak valid, coba perbaikan terbatas atau tampilkan fallback.

## 6. Perilaku pedagogis

- Gunakan Bahasa Indonesia natural, ramah, tidak merendahkan.
- Mulai dengan inti penjelasan dalam 1–3 kalimat.
- Jelaskan sebab-akibat: ancaman, bidak yang terancam, raja yang terbuka, atau konsekuensi pertukaran.
- Sesuaikan istilah dan panjang menurut level pemain.
- Untuk pemula, definisikan istilah asing pada penggunaan pertama.
- Untuk puzzle, berikan hint bertingkat tanpa langsung mengungkap solusi kecuali diminta.
- Bedakan fakta posisi dari dugaan strategis.
- Jangan mengarang langkah lawan atau bidak yang tidak ada.
- Jika score/PV tidak tersedia, jangan klaim “langkah terbaik menurut mesin”; jelaskan keterbatasan data.
- Jangan menyatakan bahwa suatu langkah “pasti menang” kecuali hasil engine yang relevan memang membuktikan forced mate pada konteks yang cukup dan penjelasan tetap menyebut batas pencarian bila relevan.

## 7. Server architecture and security

- Endpoint: `POST /api/tutor/explain`.
- SDK Gemini hanya di server-side route/service.
- API key dari `process.env.GEMINI_API_KEY`; jangan gunakan prefix `NEXT_PUBLIC_`.
- `GEMINI_MODEL` dibaca dari environment dan diverifikasi dengan model yang tersedia di akun saat implementasi; jangan mengunci nama model yang mungkin berubah tanpa pengecekan.
- `TUTOR_ENABLED` menjadi feature flag; jika false/key kosong, kembalikan status terkendali.
- Validasi request sebelum menghubungi provider.
- Maksimalkan data minimization: kirim hanya FEN/riwayat yang relevan serta ringkasan analisis, bukan seluruh arsip pengguna.
- Batasi input pertanyaan, langkah historis, panjang PV, token output, dan timeout.
- Validasi response terhadap schema dan bersihkan/render sebagai teks terstruktur; hindari HTML mentah.
- Jangan menulis API key, raw provider response sensitif, atau stack trace ke response client.
- Tambahkan rate limiting. Pembatasan in-memory berguna saat lokal tetapi tidak cukup untuk serverless multi-instance; pilih limiter/platform controls untuk deployment publik.
- Cegah client memicu request otomatis berulang atau parallel requests yang memboroskan kuota.

## 8. Error contract

Respons server stabil, misalnya:

```ts
type TutorApiError = {
  code:
    | "TUTOR_DISABLED"
    | "INVALID_REQUEST"
    | "RATE_LIMITED"
    | "QUOTA_EXHAUSTED"
    | "PROVIDER_UNAVAILABLE"
    | "INVALID_MODEL_OUTPUT"
    | "INTERNAL_ERROR";
  message: string; // safe Indonesian message
  retryable: boolean;
};
```

Status HTTP dipilih secara konsisten. Jangan menampilkan provider raw error kepada pengguna.

## 9. Free-tier handling

- Kuota, model, dan penggunaan yang diizinkan dapat berubah. Periksa Google AI Studio serta dokumentasi rate limits/pricing sebelum rilis.
- Tutor tidak boleh menjadi blocking dependency dari play/academy/puzzles.
- Bila terkena rate limit/kuota, berikan feedback dan sarankan mencoba lagi nanti; jangan retry otomatis agresif.
- Cache jawaban berdasarkan konteks/permintaan yang aman bila memang membantu, dengan batas ukuran dan cara membersihkan cache.
- Jangan menjanjikan “gratis tanpa batas”.

## 10. Testing

- Tidak ada key: fitur fallback bekerja dan server tidak memanggil provider.
- Key ada: panggilan provider dimock di tes otomatis; jangan memerlukan key nyata untuk CI.
- Invalid FEN, request terlalu panjang, field asing, dan JSON invalid ditolak.
- Provider timeout, 429/quota, 5xx, dan output tidak valid menghasilkan UI yang aman.
- Output tidak dapat mengubah board/game state.
- API key tidak terlihat di client bundle, HTML, logs, response, atau source map.
- Penjelasan dibandingkan dengan konteks engine agar tidak membicarakan langkah yang tidak diberikan.
