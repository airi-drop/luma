# Luma — Workflow Document
### Cozy Customizable Finance Space

## 1. App Map

```txt
Luma
├── Onboarding
│   ├── Splash Screen
│   ├── Intro Slides
│   ├── Choose Theme
│   ├── Choose Character
│   ├── Set Name
│   └── Set Monthly Budget
│
├── Home
│   ├── Budget Overview Card
│   │   └── Budget Detail Page
│   │       └── Add/Edit Budget Bottom Sheet
│   ├── Character Area
│   ├── Quick Stats
│   ├── Recent Transactions
│   ├── Floating Add Button
│   │   └── Add Transaction Bottom Sheet
│   └── Settings Icon
│       └── Settings
│           ├── Theme Customizer
│           ├── Character Customizer
│           ├── Background Customizer
│           ├── Budget Settings
│           └── Data Settings
│
├── Transactions
│   ├── Search
│   ├── Filter by Month
│   ├── Filter by Category
│   ├── Filter by Account
│   ├── Sort
│   └── Transaction Detail/Edit
│
├── Target
│   ├── Saving Goals List
│   ├── Create Saving Goal
│   ├── Saving Goal Detail
│   └── Add Saving Progress
│
└── Laporan
    ├── Monthly Summary
    ├── Charts
    ├── AI Reflection
    ├── Download Visual Report
    └── Export Spreadsheet
```

## 2. Bottom Navigation

```txt
Home | Transaksi | Target | Laporan
```

Rules:
- Settings tidak masuk bottom nav.
- Themes tidak masuk bottom nav.
- Budget tidak masuk bottom nav.
- Budget diakses dari Home.
- Customization diakses dari Settings.

## 3. First Open Flow

Purpose: user langsung merasa app ini personal space mereka.

```txt
Open App
↓
Splash Screen
↓
Intro Slides
↓
Choose Theme
↓
Choose Character
↓
Input Name
↓
Set Monthly Budget
↓
Home
```

Splash Screen:
- karakter muncul dengan animasi ringan
- logo Luma
- background sesuai default theme

Intro Slides, maksimal 3:
1. Catat uang dengan cara yang cozy
2. Custom tampilan sesuai style kamu
3. Pahami kebiasaan uangmu tanpa pressure

Choose Theme default options:
- Cozy Dark
- Cream Latte
- Sakura Dream

Choose Character default options:
- Otter
- Cat
- Bunny
- Hamster

Set Monthly Budget optional: bisa skip dan set nanti dari Home.

## 4. Daily Transaction Flow

Flow paling penting. Harus cepat, jelas, dan reliable.

```txt
Home
↓
Tap FAB
↓
Manual Input Bottom Sheet
↓
Isi transaksi
↓
Save
↓
Success Feedback
↓
Home Updated
```

Manual input adalah default saat bottom sheet terbuka.

Fields:
- nominal
- detail
- kategori
- akun
- tanggal
- mood
- note optional

Primary CTA: **Simpan Transaksi**.

Success feedback:
- bottom sheet close
- toast muncul
- character react ringan
- budget card update
- recent transaction update

Copy: “Tercatat ya ✨”.

## 5. AI Quick Input Flow

AI sebagai shortcut, bukan core dependency.

```txt
Home
↓
Tap FAB
↓
Manual Input Sheet
↓
Tap “Pakai AI Cepat ✨”
↓
Input natural language / voice
↓
AI Parse
↓
Preview Result
↓
Confirm Save
↓
Home Updated
```

AI entry points:
- tab kedua di bottom sheet
- small card di bagian atas manual form
- button secondary

Examples:
```txt
bakso 15rb cash
beli album 250k BCA
gofood 48rb ewallet
```

AI Preview harus menampilkan detail, nominal, kategori, akun, tanggal. User bisa edit sebelum simpan.

Voice hanya aktif di AI mode:

```txt
Voice → Speech to text → AI parse → Preview → Confirm
```

## 6. Budget Setup Flow

```txt
Home
↓
Tap Budget Card / Lihat Budget
↓
Budget Detail Page
↓
Tap Add/Edit Budget
↓
Budget Bottom Sheet
↓
Save
↓
Budget Detail Updated
```

Budget Detail menampilkan:
- total monthly budget
- total used
- remaining budget
- monthly progress
- category budget list

Category row example:
```txt
Entertainment
Rp320.000 / Rp400.000
80% terpakai
```

Add/Edit Budget fields:
- kategori
- nominal budget
- reset monthly toggle

Home Budget Card harus punya shortcut: **Lihat Budget →**.

Optional alert soft: “Hiburan hampir penuh 80% 🎬”.

## 7. Saving Goal Flow

Tabungan dibuat visual dan emotional, bukan banking-style.

```txt
Target
↓
Tap + Buat Target
↓
Input Goal Detail
↓
Save
↓
Goal Card Created
```

Create Goal fields:
- nama target
- target nominal
- current saved amount
- icon/emoji
- optional deadline

Add Saving Progress:
```txt
Target
↓
Tap Goal Card
↓
Goal Detail
↓
Tap Tambah Tabungan
↓
Input Nominal
↓
Save
↓
Progress Updated
```

Character bisa bereaksi saat goal dibuat, progress naik, dan goal selesai. Tone tetap soft, bukan gamified.

## 8. Reports Flow

```txt
Laporan
↓
Select Month
↓
View Summary
↓
View Charts
↓
Generate AI Reflection
↓
Download Visual Report / Export Spreadsheet
```

Report sections:
- total spending
- category breakdown
- budget comparison
- saving goal progress
- mood-spending correlation
- biggest expenses
- spending trend

AI Reflection fokus pada pattern, bukan statistik obvious.

Good examples:
- spending malam hari meningkat
- weekend spending lebih impulsif
- mood tertentu berkaitan dengan kategori tertentu
- transaksi kecil tapi sering bikin total besar

Bad examples:
- kategori terbesar adalah makanan
- total pengeluaran bulan ini sekian

## 9. Download Report Flow

Visual Report:
```txt
Laporan
↓
Tap Download Visual Report
↓
Generate aesthetic PDF/image
↓
Save to device
```

Isi visual report:
- month title
- total spending
- remaining budget
- top category
- AI reflection
- mood summary
- character reaction
- mini chart

Spreadsheet Export:
```txt
Laporan
↓
Tap Export Spreadsheet
↓
Choose .xlsx / .csv
↓
Download file
```

Spreadsheet berisi transactions, categories, account, mood, budget data, dan saving goals.

## 10. Customization Flow

```txt
Home
↓
Tap Settings Icon
↓
Settings
↓
Choose Customization Type
↓
Preview Realtime
↓
Apply
```

Customization types:
- theme
- character
- background
- accent color
- overlay opacity

## 11. Theme Customizer Flow

```txt
Settings → Theme → Choose Theme Pack → Preview → Apply
```

Theme pack mengubah colors, cards, gradients, decorative blobs, dan icon mood.

## 12. Character Customizer Flow

```txt
Settings → Character → Choose Character → Choose Style Variant → Preview on Home Mock Area → Apply
```

Character muncul di Home, loading, reports, empty states, dan success states.

## 13. Background Customizer Flow

```txt
Settings
↓
Background
↓
Upload Image
↓
Compress + Convert WebP
↓
Preview with Overlay
↓
Adjust Opacity
↓
Apply
```

Rules:
- background harus readable
- overlay wajib
- blur optional
- image disimpan di IndexedDB sebagai Blob

## 14. Transaction Page Flow

```txt
Transaksi
↓
Search / Filter / Sort
↓
Tap Transaction
↓
Detail/Edit Sheet
↓
Save Changes / Delete
```

UX rules:
- lebih clean daripada Home
- jangan terlalu banyak dekorasi
- angka harus mudah discan
- filter harus cepat

## 15. Empty State Flow

No Transactions:
> “Belum ada catatan hari ini. Mau mulai dari satu transaksi kecil?”

CTA: **Tambah Transaksi**.

No Saving Goals:
> “Ada sesuatu yang lagi kamu pengen wujudkan?”

CTA: **Buat Target**.

No Reports Data:
> “Laporan akan muncul setelah kamu punya beberapa transaksi.”

CTA: **Catat Transaksi**.

## 16. Main Screen Priority

Tier 1 — most polished:
- Home
- Add Transaction Bottom Sheet
- Character/Theme Visual System

Tier 2:
- Budget Detail
- Target
- Laporan

Tier 3:
- Transactions
- Settings

## 17. MVP Build Order

```txt
Sprint 1 — Foundation
Sprint 2 — Storage + Data
Sprint 3 — Core Input
Sprint 4 — Home + Budget
Sprint 5 — Target
Sprint 6 — Reports
Sprint 7 — Customization
Sprint 8 — AI
Sprint 9 — Polish + PWA
```

## 18. Key UX Rules
1. Manual input must work perfectly before AI.
2. Home must feel personal, not data-heavy.
3. Reports must be useful, not just pretty.
4. Budgeting must be soft, not stressful.
5. Customization must be visually satisfying.
6. Transactions page must prioritize readability.
7. App must stay fast even with custom backgrounds.
8. Character must support the experience, not distract from finance.

## 19. Final Workflow Goal

```txt
Open app
↓
Feel the app is personal
↓
Record spending quickly
↓
Understand budget softly
↓
Track saving goals visually
↓
Reflect monthly with useful reports
```

Luma should feel like a cozy personal space that helps users understand money without making money feel stressful.
