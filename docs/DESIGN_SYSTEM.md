# Design System — Chess Archive

## 1. Arah visual

**Konsep:** ruang arsip strategi modern. Tenang, editorial, presisi, dan premium tanpa terlihat seperti terminal hacker atau gim arcade.

**Kata kunci:** graphite, paper, archive, restrained, deliberate, readable, 2D.

### Jangan dilakukan

- Tidak menggunakan render 3D sebagai UI utama.
- Hindari gradient besar, neon glow, glassmorphism berlebihan, tekstur ramai, dan particle effect.
- Jangan menaruh badge, statistik, atau kartu dekoratif di setiap bagian.
- Jangan mengecilkan papan catur demi panel informasi.
- Jangan meniru logo atau identitas visual platform catur yang sudah terkenal.

## 2. Design tokens

Nama token CSS dapat disesuaikan saat implementasi; jaga makna dan kontrasnya.

| Token | Nilai awal | Penggunaan |
|---|---|---|
| `--color-bg` | `#141619` | Latar aplikasi |
| `--color-surface` | `#1C2024` | Permukaan utama |
| `--color-surface-raised` | `#24292E` | Panel atau menu yang terangkat |
| `--color-surface-muted` | `#2C3238` | Hover/area sekunder |
| `--color-border` | `#353B42` | Border halus |
| `--color-text` | `#F2F0E8` | Teks utama ivory |
| `--color-text-muted` | `#B0B5B9` | Teks sekunder |
| `--color-text-subtle` | `#8A9299` | Metadata; cek kontras sebelum pakai pada teks kecil |
| `--color-accent` | `#C7A66A` | Aksen emas kusam, link/aksi penting |
| `--color-accent-hover` | `#D8BB83` | Hover aksen |
| `--color-success` | `#73B894` | Status berhasil |
| `--color-warning` | `#E3B66F` | Peringatan |
| `--color-danger` | `#E17C78` | Error, menyerah, hapus |
| `--board-light` | `#E8E3D8` | Petak terang papan |
| `--board-dark` | `#68716F` | Petak gelap papan |
| `--board-last-move` | `rgba(199,166,106,.38)` | Petak langkah terakhir |
| `--board-selected` | `rgba(230,190,94,.55)` | Petak terpilih |
| `--board-legal-dot` | `rgba(20,22,25,.30)` | Penanda tujuan legal pada petak terang/gelap dengan penyesuaian kontras |

Status tidak boleh dibedakan hanya berdasarkan warna. Gunakan ikon, teks, atau pola tambahan.

## 3. Tipografi

- Gunakan keluarga sans-serif modern yang jelas, misalnya Geist atau Inter setelah kompatibilitas package/font diverifikasi.
- Fallback sistem wajib tersedia: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Heading singkat, tidak terlalu berat, jangan memakai huruf kapital penuh untuk semua label.
- Ukuran dasar teks 14–16 px; teks bantu jangan lebih kecil dari 12 px kecuali metadata yang tidak kritis.
- Angka jam dan statistik dapat memakai tabular numerals agar tidak bergeser.
- Notasi catur seperti `Nf3`, `e4`, FEN, dan PGN mempertahankan format standar; sediakan penjelasan Indonesia jika diperlukan.

## 4. Spacing, radius, dan elevasi

Gunakan skala 4 px: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

- Radius kontrol: 8–10 px.
- Radius panel: 12–16 px.
- Radius kartu besar: gunakan seperlunya, bukan pada semua elemen.
- Border 1 px dengan kontras halus.
- Shadow sangat ringan; elevated surfaces harus tetap terbaca dalam dark theme.
- Max content width sekitar 1440 px; area teks pelajaran dibatasi agar mudah dibaca.

## 5. Grid dan responsive tokens

Breakpoint referensi, bukan batas kaku:

- Mobile: `< 640 px`
- Tablet: `640–1023 px`
- Desktop: `1024–1279 px`
- Wide: `>= 1280 px`

Gunakan container dengan padding responsif 16 px mobile, 24 px tablet, dan 32 px desktop. Papan catur selalu mempertahankan rasio 1:1 dan tidak boleh overflow. Pada layar kecil, panel pendamping berpindah ke bawah atau ke drawer/sheet, bukan memaksa papan menjadi terlalu kecil.

## 6. Komponen

### Buttons

- Primary: latar ivory atau aksen yang cukup kontras, teks gelap, untuk aksi utama saja.
- Secondary: permukaan raised dengan border.
- Ghost: transparan, untuk aksi berulang atau navigasi.
- Destructive: warna bahaya dengan label eksplisit, terutama untuk hapus/menyerah.
- Setiap tombol memiliki hover, focus-visible, active, disabled, dan loading state bila perlu.

### Inputs

- Label terlihat, placeholder bukan pengganti label.
- Error muncul dekat field dan terhubung melalui `aria-describedby`.
- Jangan mengandalkan border warna saja untuk mengomunikasikan error.

### Panels and cards

- Gunakan panel untuk mengelompokkan tugas yang benar-benar terkait.
- Home maksimal menampilkan beberapa tujuan utama; hindari grid kartu tak berujung.
- Hindari nested cards.

### Chessboard

- Petak datar 2D, tidak menggunakan bevel/3D.
- Bidak harus berbeda jelas dari kedua warna petak.
- Highlight last move, selected square, legal target, check king, dan premove harus memiliki arti berbeda.
- Animasi gerakan singkat dan konsisten; jangan memindahkan bidak secara dekoratif.
- Gunakan label koordinat file/rank yang dapat dibaca.
- Orientasi papan dapat dibalik.

### Icons

- Gunakan satu keluarga icon, disarankan `lucide-react`.
- Hindari emoji sebagai pengganti ikon inti UI.
- Icon-only button wajib memiliki nama accessible dan tooltip jika tidak jelas.

## 7. Motion

- Transisi umum 160–220 ms.
- Panel/modal 180–240 ms dengan easing halus.
- Animasi bidak harus singkat, tidak menghambat giliran berikutnya.
- Jangan memakai animasi looping tanpa tujuan.
- Hormati `prefers-reduced-motion`; matikan atau minimalkan perpindahan dekoratif.
- Tidak ada cinematic animation saat pengguna sedang memikirkan langkah atau jam catur sedang berjalan.

## 8. Voice and copy

Gunakan bahasa Indonesia natural, instruksi ringkas, dan nada seperti pelatih yang tenang.

Contoh:
- “Mulai permainan” bukan “Launch match”.
- “Coba petunjuk” bukan “Get hint now!!!”.
- “Langkah ini membuka ancaman terhadap menteri lawan.” bukan “Move optimal karena engine says +1.8” tanpa konteks.
- “Analisis belum tersedia” disertai pilihan lanjut; jangan menampilkan stack trace.

## 9. Aksesibilitas

- Target kontras teks normal sekurangnya 4.5:1 dan teks besar 3:1 sesuai WCAG AA.
- Fokus keyboard terlihat jelas.
- Pastikan hover bukan satu-satunya cara mengakses fungsi.
- Papan dapat dimainkan dengan tap/click selection; drag-and-drop hanya jalur tambahan.
- Beri label status untuk skak, giliran, langkah terakhir, dan hasil.
- Ukuran target sentuh ideal sekitar 44×44 CSS px untuk kontrol penting.
- Cek dengan keyboard dan screen reader pada kontrol utama.
