# Luma — Design System v1
### Cozy Customizable Finance Space

## 1. Design Goal
Luma harus terasa seperti personal aesthetic space, bukan finance dashboard yang kaku.

Visual direction:
- cozy
- soft
- warm
- personal
- expressive
- readable
- mobile-first

Finance data tetap harus jelas, terutama nominal, budget progress, transaksi, dan laporan.

## 2. Core Design Principles

### Cozy First
UI harus terasa nyaman dibuka setiap hari. Gunakan warna hangat, rounded card, ilustrasi/karakter, spacing lega, dan motion halus.

### Readability Before Decoration
Aesthetic tidak boleh mengganggu data keuangan. Nominal, kategori, dan progress harus selalu mudah dibaca.

### Personal but Controlled
User boleh custom background, theme, dan character. Namun sistem tetap harus menjaga kontras dan readability. Gunakan overlay otomatis untuk background custom.

### Soft Finance Tone
Tidak memakai warning agresif.

Good:
> “budget hiburan hampir penuh 🎬”

Bad:
> “ANDA MELEBIHI BATAS!”

## 3. Color System

### Default Theme — Cozy Dark
```css
--bg-main: #1A1410;
--bg-card: #2A211B;
--bg-card-soft: #342A22;

--text-primary: #FFF3DC;
--text-secondary: #CDBEA8;
--text-muted: #9C8D7B;

--accent-primary: #E8A857;
--accent-secondary: #8FB896;
--accent-soft: #F4D6A0;

--danger-soft: #D96C5F;
--success-soft: #8FB896;
--warning-soft: #E8A857;
```

### Light Theme — Cream Latte
```css
--bg-main: #FFF3DC;
--bg-card: #FFFFFF;
--bg-card-soft: #F7E7CC;

--text-primary: #2B211A;
--text-secondary: #6E5A48;
--text-muted: #A08D7A;

--accent-primary: #D88938;
--accent-secondary: #8FB896;
--accent-soft: #F2C879;
```

### Accent Presets
```txt
Amber      #E8A857
Sage       #8FB896
Rose       #E89A9A
Sky        #89B8E8
Purple     #B69AE8
```

### Category Colors
```txt
Food / Living       Amber
Transport           Sky
Entertainment       Purple
Shopping            Rose
Health              Sage
Giving              Cream Gold
Saving              Green
Other               Muted Brown
```

## 4. Typography
Fonts:
```txt
Display: Fraunces
Body: DM Sans
```

Type scale mobile:
```txt
Hero Number       36–44px / 700
Page Title        28–32px / 700
Section Title     20–24px / 700
Card Title        16–18px / 700
Body              14–16px / 400–500
Caption           12–13px / 400
Micro Label       11–12px / 600
```

Fraunces untuk big budget number, app title, section headline, emotional copy.

DM Sans untuk transaction list, form input, labels, reports data.

## 5. Spacing System
Use 4px base scale.

```txt
4px   micro gap
8px   compact gap
12px  small gap
16px  default padding
20px  card inner padding
24px  section spacing
32px  large section spacing
40px  hero spacing
```

## 6. Radius System
```txt
Small controls      12px
Inputs              16px
Cards               24px
Hero cards          28–32px
Bottom sheets       28px top radius
Floating button     999px
```

Rule: Luma harus banyak memakai radius besar agar terasa soft.

## 7. Shadow & Elevation
Dark theme:
```css
box-shadow: 0 12px 40px rgba(0,0,0,0.28);
```

Light theme:
```css
box-shadow: 0 12px 32px rgba(92,64,38,0.12);
```

## 8. Layout System
Mobile canvas:
```txt
max-width: 480px
safe-area supported
bottom nav fixed
content padding: 20px
```

Page structure:
```txt
PageWrapper
├── Custom Background Layer
├── Gradient Overlay
├── Blob Decoration Layer
├── Main Content
└── Bottom Navigation
```

## 9. Background System
Layers:
```txt
User Image / Theme Background
↓
optional blur
↓
dark/light gradient overlay
↓
content cards
```

Dark overlay:
```css
linear-gradient(
  to bottom,
  rgba(26,20,16,0.72),
  rgba(26,20,16,0.92)
)
```

Light overlay:
```css
linear-gradient(
  to bottom,
  rgba(255,243,220,0.72),
  rgba(255,243,220,0.92)
)
```

User controls:
- background image
- blur amount
- overlay opacity 30–80%
- reset default

## 10. Card System

### Base Card
```txt
radius: 24px
padding: 20px
background: bg-card
shadow: subtle
border: 1px translucent
```

### Hero Budget Card
Isi:
- character
- remaining budget
- total spent
- progress ring/bar
- shortcut “Lihat Budget →”

Visual:
- lebih besar dari card lain
- boleh punya decorative blob
- character boleh overlap sedikit

### Transaction Card
Harus clean.

Isi:
- category icon
- detail
- account chip
- mood badge
- nominal

Rule: nominal harus paling mudah discan.

### Saving Goal Card
Isi:
- emoji/icon
- goal name
- progress amount
- progress bar
- optional deadline
- small character reaction optional

## 11. Button System
Primary Button:
```txt
height: 52px
radius: 999px
font-weight: 700
```

Examples:
- Simpan Transaksi
- Simpan Budget
- Buat Target

Secondary Button:
- Pakai AI Cepat ✨
- Download Report
- Export Spreadsheet

Floating Action Button:
- center bottom
- above bottom nav
- large circular/pill
- icon + optional label
- action: open Add Transaction Bottom Sheet

## 12. Form System
Input style:
```txt
height: 52–56px
radius: 16px
background: bg-card-soft
label above input
large tap target
```

Manual Transaction Form Order:
```txt
Nominal
Detail
Kategori
Akun
Tanggal
Mood
Note optional
```

Manual form harus langsung muncul saat FAB ditekan. AI input hanya secondary.

## 13. Bottom Sheet System
Dipakai untuk add transaction, AI quick input, add/edit budget, add saving progress, edit transaction.

Style:
```txt
height: content based
max-height: 90vh
radius top: 28px
padding: 20px
handle bar at top
```

## 14. Navigation
Bottom nav:
```txt
Home | Transaksi | Target | Laporan
```

Active state:
- warm accent icon
- soft pill background
- label visible

Inactive state:
- muted icon
- label optional

## 15. Character Placement Rules
Character areas:
- Home hero: large
- Empty state: medium
- Loading: small animated
- Success: small pop-in
- Reports: reaction illustration

Avoid:
- character covering numbers
- character on every card
- too much motion
- distracting animation during input

## 16. Motion System
Motion style: soft, springy, subtle.

Use motion for page transition, bottom sheet open, card reveal, success feedback, character reaction.

Timing:
```txt
Fast interaction: 150–200ms
Card reveal: 250–350ms
Page transition: 300–450ms
Character reaction: 500–800ms
```

Rules:
- no excessive bounce
- avoid heavy blur animation
- avoid infinite animation except very subtle idle character

## 17. Report Visual Style
Reports harus aesthetic, readable, useful.

Use:
- large summary card
- soft charts
- clear legends
- AI reflection card
- download actions

Avoid:
- dense analytics dashboard
- too many charts at once
- tiny labels

## 18. Copywriting Style
Tone: casual, soft, supportive, non-judgmental, Indonesian-first.

Examples:
```txt
“Tercatat ya ✨”
“Budget hiburan hampir penuh 🎬”
“Dompetmu masih aman hari ini.”
“Belum ada catatan hari ini.”
“Yuk catat satu transaksi kecil dulu.”
```

Avoid:
```txt
“Pengeluaran gagal dikontrol”
“Anda melebihi batas”
“Keuangan buruk”
```

## 19. Accessibility Rules
Minimum:
- text contrast readable
- tap target minimal 44px
- nominal not only color-coded
- progress always has text percentage
- support reduced motion
- background overlay mandatory

## 20. Performance Design Rules
Rules:
- compress image on upload
- convert to WebP
- max width 1080px
- lazy load decorative assets
- avoid large animated SVG loops
- keep charts lightweight
- cache theme assets

## 21. Design QA Checklist
Sebelum screen dianggap selesai:
- Apakah nominal mudah dibaca?
- Apakah CTA utama jelas?
- Apakah karakter tidak mengganggu data?
- Apakah background custom tetap readable?
- Apakah page terasa cozy?
- Apakah page tetap cepat digunakan?
- Apakah state empty/loading/error sudah punya visual?
- Apakah dark/light theme aman?

## 22. Final Design Target
Saat user melihat Luma, mereka harus merasa:

> “ini bukan app finance biasa, ini space gue.”

Tapi saat mereka mencatat uang, mereka tetap merasa:

> “fiturnya jelas, cepet, dan gampang dipakai.”
