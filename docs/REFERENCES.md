# Technical References & Verification Notes

Tanggal baseline dokumentasi: 21 Oktober 2026. Link resmi berikut digunakan sebagai titik awal; verifikasi ulang package/version, API, kuota, lisensi, dan terms pada saat implementasi serta sebelum rilis.

## Antigravity

- Rules dan `AGENTS.md`: https://antigravity.google/docs/rules/
- Panduan utama Antigravity: https://antigravity.google/docs

Antigravity mendukung instruksi proyek melalui file seperti `AGENTS.md`/`GEMINI.md` sesuai dokumentasi Rules. Jangan mengasumsikan workflow identik dengan coding agent lain; gunakan file aturan sebagai konteks workspace dan prompt fase sebagai instruksi eksplisit.

## Next.js / TypeScript

- App Router: https://nextjs.org/docs/app
- Instalasi dan scaffold: https://nextjs.org/docs/app/getting-started/installation
- TypeScript: https://nextjs.org/docs/app/api-reference/config/typescript

Periksa versi Node.js minimum dan konfigurasi lint saat `create-next-app` dijalankan, karena kebutuhan bisa berubah.

## Chess rules

- `chess.js`: https://github.com/jhlywa/chess.js

Repositori menyatakan pustaka ini menangani move generation/validation dan deteksi check/checkmate/draw; lisensi yang tercantum adalah BSD-2-Clause. Verifikasi versi/package aktual saat install.

## Stockfish browser builds

- `stockfish.js`: https://github.com/lichess-org/stockfish.js
- Build web terkini Lichess: https://github.com/lichess-org/stockfish-web
- Official Stockfish: https://github.com/official-stockfish/Stockfish

Stockfish adalah engine open-source yang didistribusikan di bawah GPL. Browser builds, package, weights/binaries, dan distribusi yang dipilih mungkin memiliki file/ketentuan spesifik; catat sumber persis dan penuhi license/source notices yang berlaku. Jangan menganggap semua fork/build punya konfigurasi, fitur, ukuran, atau dukungan browser yang sama.

## Gemini API

- API key security: https://ai.google.dev/gemini-api/docs/api-key
- Pricing: https://ai.google.dev/gemini-api/docs/pricing
- Rate limits: https://ai.google.dev/gemini-api/docs/rate-limits
- Billing: https://ai.google.dev/gemini-api/docs/billing

Poin operasional: API key bersifat rahasia dan tidak boleh diekspos di client; rate limit bergantung pada model/proyek/tier dan dapat berubah. Free tier bukan janji akses tanpa batas. Periksa ketentuan penggunaan data, model yang tersedia, kuota aktual, dan biaya sebelum membuka API untuk publik.

## Deployment references

- Vercel Hobby plan: https://vercel.com/docs/plans/hobby
- Vercel terms: https://vercel.com/legal/terms
- Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits/

Paket gratis dapat mempunyai batas teknis dan batas penggunaan/non-komersial. Karena Next.js API route memerlukan server runtime yang cocok, verifikasi dukungan framework dan terms terbaru sebelum memilih host. Tidak ada penyedia hosting yang dijamin gratis selamanya.

## Catatan verifikasi

- Jangan hardcode nama model Gemini sampai model tersedia di Google AI Studio/project pengguna telah diperiksa.
- Jangan memasukkan API key ke browser bundle, `NEXT_PUBLIC_*`, repository, URL/query string, atau output diagnostik.
- Jangan mempublikasikan klaim Elo bot yang tidak didukung benchmark.
- Dokumen ini bukan nasihat hukum. Untuk distribusi publik, periksa lisensi package dan kewajiban masing-masing dependency yang benar-benar dipakai.
