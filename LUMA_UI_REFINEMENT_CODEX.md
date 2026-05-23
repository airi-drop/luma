# LUMA UI Refinement Plan — Codex Ready

Dokumen ini dipakai sebagai rujukan untuk memperbaiki UI/UX Luma tanpa merombak total desain yang sudah ada.

Fokus utama bukan mengganti style, melainkan menaikkan kualitas polish dari:

- typography hierarchy
- spacing rhythm
- layout density
- button priority
- transaction scanability
- chart clarity
- settings simplification
- character integration
- FAB interaction clarity

Desain Luma saat ini sudah punya identitas kuat: cozy, personal, glassmorphism, navy, soft, dan emotional finance. Jangan hilangkan identitas itu.

---

## 1. Product Direction

Luma bukan aplikasi accounting hardcore.

Positioning yang harus dijaga:

> Cozy emotional budgeting app untuk mencatat uang, memahami pola pengeluaran, dan menjaga motivasi target finansial secara lembut.

Konsekuensi desain:

- Jangan dibuat terlalu corporate.
- Jangan dibuat terlalu spreadsheet-like.
- Jangan hapus nuansa cozy/personal.
- Tetap prioritaskan keterbacaan angka dan transaksi.
- Biarkan personalization seperti background, character, dan theme tetap menjadi diferensiasi utama.

---

## 2. Do Not Change

Jangan ubah hal-hal ini kecuali benar-benar diperlukan secara teknis:

- Jangan ganti konsep visual utama Luma.
- Jangan hapus background customizer.
- Jangan hapus glassmorphism.
- Jangan hapus FAB tengah.
- Jangan hapus cozy copywriting.
- Jangan ubah struktur data transaksi/target kalau tidak perlu.
- Jangan redesign seluruh aplikasi dari nol.
- Jangan ubah flow utama tanpa alasan UX yang kuat.

---

## 3. Main Problems To Fix

### 3.1 Typography hierarchy belum tegas

Masalah:

- Banyak heading terlihat setara.
- Serif terlalu sering dipakai.
- Subtitle/helper text terlalu dominan.
- Label, body, helper, dan card title belum punya peran visual yang jelas.

Target:

- Page title tetap punya karakter kuat.
- Section heading lebih bersih dan tidak terlalu dekoratif.
- Card title mudah discan.
- Helper text lebih subtle.
- Angka finansial tetap prominent.

Implementation direction:

Buat token typography global, misalnya di `src/styles`, `globals.css`, `theme.ts`, atau file styling yang sesuai dengan struktur project.

Rekomendasi scale:

```css
:root {
  --font-size-page-title: clamp(2.4rem, 8vw, 3.2rem);
  --font-size-section-title: 1.35rem;
  --font-size-card-title: 1.05rem;
  --font-size-body: 0.95rem;
  --font-size-caption: 0.78rem;
  --font-size-label: 0.72rem;

  --line-height-tight: 1.05;
  --line-height-normal: 1.45;
  --line-height-relaxed: 1.65;

  --letter-spacing-label: 0.12em;
}
```

Rules:

- Serif hanya untuk page title, hero title, monthly recap title, dan angka besar tertentu.
- Section/card heading pakai sans-serif agar lebih modern dan ringan.
- Helper text opacity sekitar 0.58–0.68.
- Label uppercase pakai tracking konsisten.

Acceptance criteria:

- User bisa langsung membedakan page title, section title, card title, body, dan helper text.
- Minimal 70% heading kecil/card heading tidak lagi memakai serif.
- Helper text tidak lebih dominan dari isi utama.

---

### 3.2 Spacing rhythm belum konsisten

Masalah:

- Jarak antar card kadang terasa random.
- Banyak section terasa terlalu roomy.
- App jadi panjang dan boros ruang layar.

Target:

- Spacing lebih konsisten.
- UI tetap cozy tapi tidak terlalu panjang.
- Data-heavy area lebih compact.

Implementation direction:

Buat spacing scale:

```css
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
}
```

Rules:

- Pakai scale ini untuk gap, padding, dan margin utama.
- Hindari angka spacing random kecuali ada kebutuhan khusus.
- Bedakan mode card:
  - `roomy` untuk target, onboarding, reflection.
  - `compact` untuk transaksi, filter, export, summary kecil, settings list.

Acceptance criteria:

- Tidak ada section yang terasa terlalu kosong tanpa fungsi.
- Transaction page bisa menampilkan lebih banyak konten tanpa kehilangan rasa premium.
- Settings page terasa lebih pendek dan lebih mudah discan.

---

### 3.3 Card density terlalu besar untuk area data

Masalah:

- Card transaksi terlalu tinggi.
- Filter/search card terlalu besar.
- Export buttons terlalu makan tempat.
- Settings cards terlalu panjang.

Target:

- Data area lebih compact.
- Emotional area tetap roomy.

Implementation direction:

Buat variasi reusable card:

```tsx
<Card variant="roomy" />
<Card variant="compact" />
<Card variant="data" />
```

Atau kalau belum punya component system, gunakan class utilitas:

```css
.card-roomy {
  padding: var(--space-6);
  border-radius: 28px;
}

.card-compact {
  padding: var(--space-4);
  border-radius: 22px;
}

.card-data {
  padding: var(--space-4);
  border-radius: 20px;
}
```

Use cases:

- Target empty state: `roomy`
- AI reflection: `roomy`
- Monthly recap hero: `roomy`
- Transaction item: `data`
- Filter panel: `compact`
- Export panel: `compact`
- Settings option card: `compact`

Acceptance criteria:

- Transaction list terasa lebih cepat dibaca.
- Settings tidak terasa terlalu berat.
- UI tetap cozy, bukan jadi terlalu sempit.

---

### 3.4 Transaction list belum cukup scanable

Masalah:

- Nama transaksi, kategori, akun, tanggal, dan nominal belum punya hierarchy yang sangat jelas.
- Semua teks terasa cukup terang.
- Card transaksi makan ruang cukup besar.

Target:

- Dalam 1 detik user bisa lihat: nama, nominal, kategori/akun, tanggal.
- Card lebih compact.
- CTA “Lihat” tidak perlu terlalu dominan.

Suggested layout:

```txt
[Transaction name]                    [Rp 20.000]
[Category pill] · [Cash]              [23 Mei 2026]
```

Rules:

- Nama transaksi: primary text.
- Nominal: primary text, right aligned.
- Category/account/date: secondary text.
- “Lihat” bisa diganti affordance kecil seperti chevron atau seluruh card clickable.

Acceptance criteria:

- Minimal 3 transaksi bisa terlihat nyaman dalam satu layar mobile setelah filter card.
- Nominal lebih cepat ditemukan secara visual.
- Metadata tidak bersaing dengan nama transaksi.

---

### 3.5 Button priority belum konsisten

Masalah:

- Ada filled, outline, ghost, glass, dan text button yang belum punya peran jelas.
- Tombol penting dan tidak penting kadang terasa setara.

Target:

Buat 3 level button:

1. Primary
   - aksi utama
   - contoh: Simpan Transaksi, Buat Target

2. Secondary
   - aksi pendukung
   - contoh: CSV, PDF, XLSX, Pakai background

3. Tertiary / destructive
   - aksi ringan atau berisiko
   - contoh: Kembali, Hapus

Implementation direction:

```css
.button-primary {
  background: var(--accent);
  color: var(--accent-foreground);
  font-weight: 650;
}

.button-secondary {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.14);
  color: var(--text-primary);
}

.button-tertiary {
  background: transparent;
  color: var(--text-secondary);
}

.button-danger {
  background: rgba(255, 120, 120, 0.16);
  border: 1px solid rgba(255, 120, 120, 0.32);
  color: #ffb0b0;
}
```

Acceptance criteria:

- Satu screen hanya punya satu primary action utama.
- Tombol destructive tidak berdekatan secara visual dengan FAB/nav sampai rawan salah klik.
- Export buttons terlihat secondary, bukan bersaing dengan CTA utama.

---

### 3.6 FAB plus masih ambigu

Masalah:

- Tombol `+` bisa berarti tambah transaksi, target, atau quick action.
- Di halaman Target ada tombol `+ Buat`, tapi juga ada FAB `+`.

Target:

- FAB menjadi quick action yang jelas.
- Tidak bertabrakan dengan page-level CTA.

Implementation option A — speed dial:

Saat FAB ditekan, tampilkan quick actions:

- Tambah Transaksi
- Tambah Target
- AI Cepat

Implementation option B — context aware:

- Di tab Transaksi: FAB buka Tambah Transaksi.
- Di tab Target: FAB buka Buat Target.
- Di tab Laporan: FAB buka Tambah Transaksi atau Export.
- Di Home: FAB buka quick actions.

Recommendation:

Pakai option A jika ingin lebih scalable. Pakai option B jika ingin lebih cepat implementasi.

Acceptance criteria:

- User tahu fungsi FAB tanpa menebak.
- Di halaman Target tidak ada dua CTA dengan fungsi sama yang membingungkan.
- FAB tidak menutup tombol berbahaya seperti Hapus.

---

### 3.7 Bottom nav terlalu berat secara visual

Masalah:

- Nav tinggi.
- FAB besar dan glow cukup kuat.
- Area bawah layar terasa berat.

Target:

- Bottom nav tetap cantik tapi lebih ringan.
- FAB tidak menutup konten penting.

Implementation direction:

- Kurangi tinggi nav 8–12%.
- Kurangi glow FAB.
- Pastikan bottom padding konten cukup saat modal panjang.
- Di modal detail, jangan sampai tombol hapus ketutup FAB/nav.

Acceptance criteria:

- Scroll bawah modal tidak ketutup nav/FAB.
- FAB tidak terasa lebih dominan daripada konten utama.
- Bottom nav tetap mudah disentuh di mobile.

---

### 3.8 Chart clarity perlu dipoles

Masalah:

- Tooltip chart terlalu terang untuk dark UI.
- Axis/grid terlalu samar atau kalah dengan background.
- Data line kurang prominent.

Target:

- Chart terlihat seperti bagian natural dari dark theme.
- Data lebih jelas tanpa merusak style cozy.

Implementation direction:

- Tooltip dark mode.
- Grid opacity rendah tapi cukup terbaca.
- Line/bar thickness dinaikkan sedikit.
- Chart container gunakan background lebih solid dibanding card biasa.

Acceptance criteria:

- Tooltip tidak putih terang di atas dark UI.
- Axis label terbaca di mobile.
- Chart tetap jelas saat background custom aktif.

---

### 3.9 Settings terlalu panjang dan belum progressive

Masalah:

- Theme, character, background, AI settings tampil terlalu panjang dalam satu scroll.
- Banyak card besar.

Target:

- Settings lebih mudah discan.
- User tidak langsung dibanjiri banyak opsi.

Implementation direction:

Gunakan salah satu:

Option A — accordion:

- Theme
- Character
- Background
- AI

Option B — segmented tabs:

- Tampilan
- Karakter
- Background
- AI

Recommendation:

Untuk mobile, segmented tabs lebih enak jika implementasi tidak terlalu berat.
Accordion lebih cepat kalau mau perubahan minimal.

Acceptance criteria:

- User bisa menemukan Background Customizer tanpa scroll terlalu jauh.
- Character section tidak terasa placeholder kosong.
- Bantuan AI tidak terlihat seperti developer note mentah.

---

### 3.10 Developer-facing copy harus disembunyikan dari user biasa

Masalah:

Di screenshot ada teks:

> Konfigurasi provider dan API key diatur di .env.local.

Ini terlalu developer-facing untuk user production.

Target:

User biasa tidak melihat istilah `.env.local`.

Suggested replacement:

> AI aktif untuk bantu membaca input cepat dan membuat refleksi bulanan.

Jika AI belum aktif:

> AI belum aktif di perangkat ini. Kamu tetap bisa mencatat transaksi manual seperti biasa.

Acceptance criteria:

- Tidak ada copy production yang menyebut `.env.local`, API key, provider config, atau istilah teknis internal.
- Error AI tetap informatif tapi ramah user.

---

### 3.11 Emoji target terasa kurang premium

Masalah:

- Emoji native OS terasa seperti tempelan.
- Bentrok dengan UI yang elegan.

Target:

- Icon target terasa menyatu dengan visual system.

Implementation options:

Option A — cepat:

- Tetap pakai emoji, tapi bungkus dalam circular glass badge konsisten.
- Gunakan ukuran dan alignment tetap.

Option B — lebih premium:

- Ganti dengan icon set seperti Lucide atau custom mini sticker.

Recommendation:

Mulai dari option A dulu agar aman.

Acceptance criteria:

- Icon target terlihat konsisten antar device.
- Badge icon punya ukuran, padding, dan background seragam.

---

### 3.12 Character system belum hidup

Masalah:

- Character ada di settings tapi belum terasa berpengaruh di app.
- Masih terasa cosmetic toggle.

Target:

Character menjadi bagian emotional layer Luma.

Implementation direction:

Gunakan selected character di:

- Empty state target
- Empty state transaksi
- AI reflection card
- Monthly summary message
- Success feedback setelah simpan transaksi/target

Examples:

```txt
Otter: “Pelan-pelan aja, yang penting mulai dicatat.”
Bunny: “Target kecil hari ini bisa jadi hadiah besar nanti.”
Cat: “Aku bantu rapihin catatanmu bulan ini.”
```

Acceptance criteria:

- Karakter aktif muncul minimal di 2 tempat selain Settings.
- Copy berubah sesuai character yang dipilih.
- Tidak mengganggu fungsi utama.

---

## 4. Copywriting Guidelines

Tone Luma:

- santai
- lembut
- tidak menggurui
- tidak terlalu childish
- tidak terlalu corporate
- tetap jelas secara finansial

Avoid:

- istilah teknis developer
- copy terlalu panjang
- kalimat motivasi yang berlebihan
- bahasa terlalu accounting

Use:

- “catatan” bukan “record”
- “target” bukan “goal object”
- “uang keluar” untuk konteks sederhana
- “pengeluaran” untuk laporan
- “bulan ini” untuk temporal clarity

Examples:

Before:

> Data bulan ini masih terlalu tipis buat dibaca polanya.

After:

> Catatan bulan ini masih sedikit. Setelah beberapa transaksi lagi, Luma bisa bantu baca polanya.

Before:

> Konfigurasi provider dan API key diatur di .env.local.

After:

> AI aktif untuk bantu input cepat dan refleksi bulanan.

Before:

> Belum ada target aktif.

After:

> Belum ada target aktif. Mulai dari satu hal kecil yang pengen kamu wujudin.

---

## 5. Implementation Order

Kerjakan berurutan agar aman.

### Phase 1 — Foundation polish

1. Tambahkan typography tokens.
2. Tambahkan spacing tokens.
3. Rapikan pemakaian serif vs sans.
4. Turunkan dominasi helper text.
5. Pastikan build/lint lolos.

### Phase 2 — Data UI polish

1. Compact transaction card.
2. Compact filter/search card.
3. Perjelas nominal dan metadata.
4. Rapikan export buttons.
5. Pastikan transaksi tetap bisa edit/detail.

### Phase 3 — Navigation/action polish

1. Kurangi visual weight bottom nav.
2. Pastikan FAB tidak nutup konten/modal.
3. Buat FAB context-aware atau speed dial.
4. Hilangkan CTA yang redundant.

### Phase 4 — Reports and charts

1. Tooltip chart dark mode.
2. Grid/axis/data line lebih jelas.
3. Chart card lebih solid.
4. Test dengan background custom aktif.

### Phase 5 — Settings and character

1. Sederhanakan Settings dengan accordion/tabs.
2. Ganti developer-facing AI copy.
3. Rapikan emoji/icon badge.
4. Integrasikan selected character ke empty state/reflection.

---

## 6. Codex Safety Instructions

When implementing this plan:

- Inspect the existing codebase first.
- Do not guess file paths.
- Preserve current design identity.
- Prefer small, safe, incremental changes.
- Avoid full rewrites.
- Avoid changing data schema unless explicitly required.
- Do not remove existing features.
- If a component system already exists, extend it instead of creating duplicate styles.
- Run build and lint after changes.
- Summarize changed files and risks.

---

## 7. Expected Final Result

After implementation, Luma should feel:

- cleaner
- more premium
- easier to scan
- less visually heavy
- more consistent
- still cozy and personal

The app should not feel like a different product. It should feel like the current Luma, but more mature and production-ready.
