# PRD — Luma
### Cozy Customizable Finance Space · Mobile-First PWA
**Version:** 2.0

## 1. Product Direction
Luma bukan finance app yang fokus ke angka. Luma adalah **personal aesthetic space untuk ngatur uang** dengan cara yang nyaman, personal, dan visually expressive.

User membuka app karena tampilannya nyaman, karakter favorit mereka ada di dalam app, dashboard terasa personal, dan mencatat pengeluaran terasa ringan.

Finance tetap menjadi fitur utama, tapi experience dibungkus seperti cozy dashboard, customizable room, digital companion, dan aesthetic journal.

## 2. Positioning
**Bukan:** spreadsheet finance app, fintech dashboard, budgeting app yang serius, productivity finance tool, gamified money challenge app.

**Tapi:** cozy finance companion, aesthetic money journal, customizable dashboard app, self-expression finance app.

## 3. Target User
Usia 17–28 tahun. User suka customize HP, aesthetic apps, widget/theme/wallpaper custom, idol/anime/cozy art style, ingin tracking uang tanpa pressure, dan malas app finance yang terlalu ribet.

## 4. Product Pillars
### Aesthetic First
Visual dan atmosphere adalah prioritas utama. App harus nyaman dilihat lama, punya strong visual identity, terasa hidup, dan terasa personal.

### Customization
User bisa mengubah background, character, color palette, vibe/theme, dan accent style.

### Frictionless Finance
Pencatatan keuangan harus cepat, ringan, tidak intimidating, dan tidak banyak form.

### Emotional Experience
App terasa seperti companion. Karakter dan UI bereaksi terhadap kondisi keuangan user.

## 5. Visual Direction
Referensi: Daynest, Finch, cozy productivity apps, widget aesthetic apps, Russian illustrated mobile apps.

Keywords: warm, cozy, soft, rounded, playful, expressive, dreamy, personal.

Default theme: **Cozy Dark**.
- Near black: `#1A1410`
- Cream: `#FFF3DC`
- Amber: `#E8A857`
- Soft brown: `#6E4A2E`
- Sage: `#8FB896`

Typography:
- Display: Fraunces
- Body: DM Sans

## 6. Character System — Core Feature
Character bukan dekorasi. Character adalah emotional identity dari app.

Default characters:
- Otter
- Cat
- Bunny
- Hamster

Future packs:
- Anime aesthetic
- Idol-inspired theme
- Pixel art mascot
- Cozy cafe character
- Minimal monochrome character

Character muncul di Home dashboard, empty states, AI loading state, success animation, splash screen, report summaries, dan Settings preview.

Mood states:
- `happy`: budget aman
- `chill`: pengeluaran normal
- `worried`: budget mulai tipis
- `panic`: overspending

## 7. Theme System
Theme bukan cuma ganti warna. Satu theme mengubah colors, icon style, decorative blobs, illustration vibe, gradients, dan card style.

Planned themes:
- Cozy Autumn
- Cream Latte
- Sakura Dream
- Midnight Navy
- Soft Purple
- Idol Stage
- Minimal White

## 8. Background Customization
User bisa upload idol photo, anime wallpaper, personal photo, atau illustration.

Rendering system:
- blur ringan
- gradient overlay
- adjustable opacity
- UI tetap readable
- aesthetic tetap kuat

Technical notes:
- compress image automatically
- convert to WebP
- optimize max resolution
- store in IndexedDB as Blob, not base64

## 9. Core Finance Features
Finance harus kuat dan reliable walaupun visual jadi selling point.

### 9.1 Transaction Input
Manual input adalah default utama. AI input adalah optional shortcut, bukan primary flow.

Alasan:
- manual input reliable
- user bisa mencatat tanpa koneksi/API
- AI punya cost dan limit
- AI bisa jadi premium/freemium feature

Manual fields:
- nominal
- detail transaksi
- kategori
- akun
- tanggal
- mood
- note optional

Primary CTA: **Simpan Transaksi**.

AI Quick Input muncul sebagai secondary option: tab kedua, shortcut card kecil, atau button “Pakai AI Cepat ✨”.

Contoh AI input:
- “bakso 15rb cash”
- “beli album 250k BCA”
- “gofood 48rb”

AI parse → preview → user confirm/edit → save.

Voice input masuk ke AI mode: voice → text → AI parse → preview → confirm.

### 9.2 Budgeting System
User bisa mengatur budget bulanan total dan budget per kategori.

Budgeting tidak memakai warning agresif. Gunakan progress ring, soft gradient changes, subtle character reaction, dan reminder santai.

Contoh copy: “budget nongkrong tinggal sedikit ☕”.

Budget access flow: **Home → Budget Card → Budget Detail**.

Budget Detail Page menampilkan:
- budget bulanan total
- total terpakai
- sisa budget
- progress bulanan
- list budget per kategori

Contoh kategori:
- Food
- Transport
- Entertainment
- Shopping
- Health
- Other

Add/Edit Budget Bottom Sheet fields:
- kategori
- nominal budget bulanan
- reset otomatis per bulan

Home Budget Card harus punya shortcut: **Lihat Budget →**.

### 9.3 Saving Goals
Saving goals adalah target tabungan visual dan emotional.

Example goals:
- album idol
- concert fund
- laptop baru
- liburan
- setup gaming

Saving Goal Card menampilkan nama target, target nominal, progress, ilustrasi/icon, dan optional deadline.

Contoh:
```txt
🎧 Album IU
Rp350.000 / Rp1.200.000

✈️ Trip Jepang
Rp2jt / Rp12jt
```

Karakter bisa bereaksi terhadap progress tabungan.

### 9.4 Dashboard
Home adalah area paling penting.

Prioritas:
1. visual comfort
2. budget visibility
3. quick finance access

Home sections:
- greeting
- character besar
- budget overview
- quick stats
- recent transactions
- floating add button

## 10. Transactions Page
Features:
- search realtime
- filter kategori
- filter bulan
- filter akun
- sort transaksi
- edit/delete transaction

UX: lebih functional dan clean daripada Home. Jangan terlalu decorative karena user akan scan banyak data.

## 11. Reports Page
Reports semi-minimal. Tetap aesthetic tapi readability prioritas.

Content:
- category chart
- spending trend chart
- comparison bulan lalu
- top spending category
- biggest transaction
- budget comparison
- saving goal progress
- mood-spending correlation

### AI Insights
AI tidak boleh cuma mengulang statistik biasa. AI harus membantu user memahami behavioral spending pattern, emotional spending pattern, impulsive spending habit, recurring spending behavior, dan relationship antara mood dan uang.

Good examples:
- “kamu lebih sering checkout malam hari 🌙”
- “pengeluaran impulsif paling sering muncul saat weekend.”
- “mood 😭 sering muncul bersamaan dengan pengeluaran makanan delivery.”
- “bulan ini kamu lebih sering spending kecil tapi berulang.”
- “pengeluaran nongkrong naik 42% dibanding bulan lalu ☕”

Tone AI: casual, ringan, supportive, non-judgmental, companion-like.

## 12. Settings
Settings adalah User Customization Center.

User bisa mengubah:
- theme
- character
- background
- overlay opacity
- accent colors
- mascot visibility

Data settings:
- download monthly report
- export spreadsheet `.xlsx` / `.csv`
- reset data

## 13. Tech Stack
Frontend: React, Vite, TypeScript.

Styling: TailwindCSS, CSS Variables, Framer Motion.

Storage:
- IndexedDB untuk transactions, settings, recurring, character config, backgrounds
- localStorage hanya untuk onboarding state dan lightweight preferences

AI: Gemini API Free Tier untuk transaction parsing dan monthly behavioral insight.

Charts: Recharts.

App type: PWA, offline-first.

## 14. Performance Rules
App harus lightweight, smooth, fast opening, battery friendly, dan terasa 60fps.

Optimization:
- image compression wajib
- gunakan WebP
- lazy render decorative assets
- minimal heavy blur
- animation subtle
- avoid over-animation

## 15. Navigation Structure
Bottom nav utama:
- Home
- Transaksi
- Target
- Laporan

Settings diakses lewat icon kanan atas di Home.

Themes tidak masuk bottom nav karena bukan aktivitas harian utama. Customization tetap penting tapi lebih cocok di Settings.

## 16. UX Philosophy
Luma harus terasa seperti tempat nyaman buat ngobrol sama dompet sendiri.

Tidak ada pressure, aggressive warning, atau toxic productivity vibe.

Experience harus calming, soft, personal, dan expressive.

## 17. Reporting System
### Cozy Visual Report
Untuk recap bulanan, emotional reflection, dan sharing.

Isi:
- spending summary
- charts
- AI insights
- mood summary
- character reaction
- visual highlights

Output: downloadable PDF/image summary.

### Spreadsheet Export
Untuk user yang ingin analisa manual.

Format:
- `.xlsx`
- `.csv`

Berisi transaction history, categories, budgeting data, dan saving goals.

## 18. MVP Scope
In scope:
- theme system
- character selection
- background upload
- cozy dark mode
- subtle animation
- add transaction manual
- AI parser secondary
- voice input secondary through AI mode
- budget total dan budget per kategori
- reports
- transaction history
- recurring transaction
- download visual report
- spreadsheet export
- saving goals
- PWA
- offline support
- IndexedDB storage
- mobile-first responsive

Out of scope:
- social features
- banking integration
- crypto/investment
- complex accounting
- debt management
- cloud sync
- multiplayer/shared wallet
- gamification

## 19. Future Expansion Ideas
- downloadable theme packs
- creator-made themes
- seasonal themes
- animated backgrounds
- AI-generated cozy wallpapers
- widget support
- desktop mode

## 20. Final Product Goal
Saat user membuka Luma, mereka harus merasa:

> “ini space gue.”

Dan saat mencatat pengeluaran:

> “ternyata ngatur uang bisa senyaman ini.”
