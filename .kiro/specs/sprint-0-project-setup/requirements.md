# Requirements Document

## Introduction

Sprint 0 menyiapkan fondasi teknis Luma sebagai mobile-first PWA shell sebelum fitur finance dibangun. Lingkupnya murni scaffolding: Vite + React + TypeScript app yang jalan lokal, Tailwind CSS yang dikendalikan CSS variables, React Router dengan placeholder page untuk setiap route, BottomNav yang muncul hanya di empat tab utama, dan struktur folder yang sama persis dengan `docs/TECHNICAL_ARCHITECTURE.md` §3. Sprint ini sengaja tidak menyentuh IndexedDB, business logic, store hydration, atau AI — tujuannya hanya memberi developer "ruang kosong yang rapi" supaya sprint berikutnya tinggal isi.

Persyaratan di dokumen ini diturunkan dari design document Sprint 0 (`design.md` di folder yang sama) dan langsung memetakan correctness properties di sana ke kriteria yang bisa diverifikasi via type-check, build, dan inspeksi DOM/file.

## Glossary

- **Luma_App**: keseluruhan aplikasi React yang di-bootstrap dari `src/main.tsx`.
- **Vite_Toolchain**: kombinasi Vite dev server dan build pipeline (`npm run dev`, `npm run build`, `npm run preview`).
- **TypeScript_Compiler**: `tsc -b` yang dijalankan via script `npm run type-check` dan sebagai bagian pertama dari `npm run build`.
- **Router**: konfigurasi React Router v6 yang diekspor dari `src/app/routes.tsx` (objek `router` plus array `routeObjects`).
- **Route_Table**: array `routeObjects` yang berisi pemetaan path → React element untuk semua route Luma.
- **Primary_Routes**: kumpulan path yang muncul di BottomNav, yaitu `/home`, `/transactions`, `/target`, `/reports`.
- **Secondary_Routes**: path yang valid tapi tidak punya tab di BottomNav, yaitu `/settings` dan `/budget`.
- **Page_Wrapper**: komponen `PageWrapper` di `src/components/layout/PageWrapper.tsx` yang membungkus setiap halaman dan menerapkan max-width 480px.
- **Bottom_Nav**: komponen `BottomNav` di `src/components/layout/BottomNav.tsx` yang merender empat tab utama.
- **Nav_Items**: konstanta `NAV_ITEMS` di dalam `BottomNav` yang mendefinisikan tab Home, Transaksi, Target, Laporan secara statis dan berurutan.
- **Design_Tokens**: kumpulan CSS custom properties (`--bg-main`, `--bg-card`, `--bg-card-soft`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent-primary`, `--accent-secondary`, `--accent-soft`, `--danger-soft`, `--success-soft`, `--warning-soft`) yang dideklarasikan di `:root` melalui `src/styles/globals.css`.
- **Tailwind_Layer**: hasil generasi Tailwind (`@tailwind base; @tailwind components; @tailwind utilities;`) yang ter-load lewat `globals.css`.
- **Folder_Structure**: layout direktori `src/` yang dideskripsikan di `docs/TECHNICAL_ARCHITECTURE.md` §3 dan direplikasi di design document Sprint 0.
- **Build_Plan_Dependencies**: daftar dependency runtime yang disebut di `docs/BUILD_PLAN.md` §7, yaitu `react`, `react-dom`, `react-router-dom`, `zustand`, `idb`, `nanoid`, `date-fns`, `framer-motion`, `recharts`, `xlsx`, `jspdf`, `html2canvas`, plus dev dependency `vite-plugin-pwa`.
- **Placeholder_Page**: komponen halaman Sprint 0 yang hanya merender judul dan caption (mis. `"Coming soon — Sprint X"`) tanpa business logic.
- **UI_Layer**: gabungan modul di `src/components/**` dan `src/pages/**`.

## Requirements

### Requirement 1: Project Bootstrap

**User Story:** As a Luma developer, I want a Vite + React + TypeScript app yang langsung jalan lokal, so that saya bisa mulai membangun fitur tanpa setup tambahan.

#### Acceptance Criteria

1. THE Luma_App SHALL bootstrap dari `src/main.tsx` yang merender `<App />` ke elemen DOM dengan id `root` di dalam `<React.StrictMode>`.
2. WHEN seorang developer menjalankan `npm install` pada clone repository yang bersih, THE Vite_Toolchain SHALL menyelesaikan instalasi tanpa error dan exit dengan kode 0.
3. WHEN seorang developer menjalankan `npm run dev`, THE Vite_Toolchain SHALL menjalankan dev server pada `http://localhost:5173` dan menyajikan Luma_App.
4. WHEN seorang developer menjalankan `npm run build`, THE Vite_Toolchain SHALL menjalankan `tsc -b` lalu `vite build` secara berurutan, menghasilkan direktori `dist/`, dan exit dengan kode 0.
5. WHEN seorang developer menjalankan `npm run type-check`, THE TypeScript_Compiler SHALL menyelesaikan type checking pada seluruh workspace dan exit dengan kode 0.
6. IF salah satu placeholder page gagal di-import (mis. file hilang atau syntax error), THEN THE Vite_Toolchain SHALL menggagalkan build atau menampilkan overlay error di dev server, alih-alih merender fallback diam-diam.

### Requirement 2: Tailwind dan Design Tokens

**User Story:** As a Luma developer, I want Tailwind CSS terhubung dengan CSS variables Luma, so that design tokens bisa dipakai lewat utility classes dan tema bisa di-swap di sprint berikutnya tanpa rewrite.

#### Acceptance Criteria

1. THE Luma_App SHALL meng-import `src/styles/globals.css` tepat satu kali dari `src/main.tsx`.
2. THE styles/globals.css SHALL mendeklarasikan direktif `@tailwind base`, `@tailwind components`, dan `@tailwind utilities` di urutan tersebut.
3. WHEN `globals.css` ter-load di browser, THE Luma_App SHALL mendefinisikan seluruh Design_Tokens (`--bg-main`, `--bg-card`, `--bg-card-soft`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent-primary`, `--accent-secondary`, `--accent-soft`, `--danger-soft`, `--success-soft`, `--warning-soft`) sebagai non-empty values pada selector `:root`.
4. THE tailwind.config.ts SHALL memetakan utility color (`bg-main`, `bg-card`, `bg-card-soft`, `text-primary`, `text-secondary`, `text-muted`, `accent-primary`, `accent-secondary`, `accent-soft`) ke Design_Tokens lewat ekspresi `var(--token-name)`, sehingga utility class seperti `bg-bg-main` dan `text-text-primary` resolve ke nilai CSS variable yang aktif.
5. THE tailwind.config.ts SHALL menyertakan `./index.html` dan `./src/**/*.{ts,tsx}` di field `content` agar utility class di seluruh source ter-detect.
6. WHEN halaman manapun pertama kali dirender di browser, THE Luma_App SHALL menerapkan `--bg-main` sebagai background `body` dan `--text-primary` sebagai warna teks default.

### Requirement 3: Routing dan Placeholder Pages

**User Story:** As a Luma developer, I want semua route utama Luma sudah ter-wire ke placeholder page, so that navigasi end-to-end bisa dites sebelum fitur dibangun.

#### Acceptance Criteria

1. THE Router SHALL mendeklarasikan tepat satu entri di Route_Table untuk setiap path di himpunan {`/`, `/home`, `/transactions`, `/target`, `/reports`, `/settings`, `/budget`}.
2. WHEN browser memuat path `/`, THE Router SHALL me-redirect ke `/home` lewat element `<Navigate to="/home" replace />`.
3. WHEN browser memuat path yang tidak terdaftar di Route_Table, THE Router SHALL me-redirect ke `/home` melalui catch-all route dengan `path: "*"`.
4. WHEN path saat ini cocok dengan salah satu Primary_Routes atau Secondary_Routes, THE Router SHALL merender Placeholder_Page yang sesuai (`HomePage`, `TransactionsPage`, `TargetPage`, `ReportsPage`, `SettingsPage`, atau `BudgetDetailPage`).
5. THE Placeholder_Page untuk setiap route SHALL membungkus kontennya di dalam `<PageWrapper>` dan menampilkan judul halaman plus caption singkat seperti `"Coming soon — Sprint X"` agar dev bisa memverifikasi routing secara visual.
6. THE routes.tsx file SHALL meng-export `routeObjects` (array `RouteObject[]`) dan `router` (hasil `createBrowserRouter(routeObjects)`) sehingga Route_Table bisa diinspeksi dan diuji secara terpisah.

### Requirement 4: Bottom Navigation

**User Story:** As a Luma user, I want BottomNav yang konsisten dengan empat tab utama Luma (Home, Transaksi, Target, Laporan), so that navigasi terasa cozy dan tidak penuh tab yang nggak relevan.

#### Acceptance Criteria

1. THE Bottom_Nav SHALL merender tepat empat item navigasi yang berasal dari Nav_Items.
2. THE Nav_Items SHALL berisi entri dengan urutan persis: (`/home`, label `"Home"`), (`/transactions`, label `"Transaksi"`), (`/target`, label `"Target"`), (`/reports`, label `"Laporan"`).
3. THE Nav_Items SHALL tidak mengandung entri dengan path `/settings` maupun `/budget`.
4. WHEN path saat ini cocok dengan path salah satu Nav_Items, THE Bottom_Nav SHALL menandai NavLink yang sesuai sebagai aktif dengan menerapkan styling aktif (`text-accent-primary` plus `font-bold`) dan atribut `aria-current="page"`.
5. WHEN path saat ini termasuk Primary_Routes (`/home`, `/transactions`, `/target`, `/reports`), THE Page_Wrapper SHALL merender Bottom_Nav.
6. WHEN path saat ini adalah `/settings` atau `/budget`, THE Page_Wrapper SHALL menyembunyikan Bottom_Nav dengan menggunakan `showBottomNav={false}` di Placeholder_Page tersebut.
7. WHEN Bottom_Nav dirender, THE Bottom_Nav SHALL ditempatkan fixed di bagian bawah viewport dan dibatasi pada lebar Page_Wrapper (max-width 480px).

### Requirement 5: Mobile-First Container

**User Story:** As a Luma user di perangkat mobile, I want layout yang nyaman dibaca dan terpusat, so that konten finance tetap rapi di layar kecil maupun layar lebar.

#### Acceptance Criteria

1. THE Page_Wrapper SHALL membatasi outer container-nya pada max-width 480px lewat utility Tailwind `max-w-app` (yang dipetakan ke `480px` di `tailwind.config.ts`).
2. THE Page_Wrapper SHALL memusatkan container secara horizontal dengan utility `mx-auto`.
3. WHEN viewport melebihi 480px, THE Page_Wrapper SHALL menjaga konten tetap di kolom selebar 480px tanpa stretching ke seluruh lebar layar.
4. WHEN `showBottomNav` bernilai `true`, THE Page_Wrapper SHALL menyediakan padding bawah yang cukup (`pb-24`) supaya konten tidak tertutup Bottom_Nav.
5. WHEN `showBottomNav` bernilai `false`, THE Page_Wrapper SHALL memakai padding bawah yang lebih kecil (`pb-6`) dan tidak merender Bottom_Nav.
6. THE tailwind.config.ts SHALL mendaftarkan `maxWidth.app = "480px"` di `theme.extend` agar utility `max-w-app` tersedia secara global.

### Requirement 6: Dependencies Sesuai BUILD_PLAN §7

**User Story:** As a Luma developer, I want semua dependency yang dipakai sepanjang roadmap sudah terinstall di Sprint 0, so that sprint berikutnya tidak perlu menyentuh `package.json` lagi dan bisa langsung fokus implementasi.

#### Acceptance Criteria

1. THE package.json SHALL mendaftarkan `react`, `react-dom`, `react-router-dom`, `zustand`, `idb`, `nanoid`, `date-fns`, `framer-motion`, `recharts`, `xlsx`, `jspdf`, dan `html2canvas` di field `dependencies`.
2. THE package.json SHALL mendaftarkan `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`, `tailwindcss`, `postcss`, `autoprefixer`, dan `vite-plugin-pwa` di field `devDependencies`.
3. THE package.json SHALL mendefinisikan script `dev` (= `vite`), `build` (= `tsc -b && vite build`), `preview` (= `vite preview`), dan `type-check` (= `tsc -b --pretty`).
4. WHERE Sprint 0 belum membutuhkan import dari `zustand`, `idb`, `nanoid`, `date-fns`, `framer-motion`, `recharts`, `xlsx`, `jspdf`, atau `html2canvas`, THE UI_Layer SHALL tidak mengimpor library tersebut di file manapun.
5. THE vite.config.ts SHALL meng-konfigurasi plugin `VitePWA` dengan `registerType: "prompt"`, `injectRegister: false`, dan field `manifest` berisi `name: "Luma"`, `short_name: "Luma"`, `start_url: "/home"`, dan `icons: []`, sehingga build tidak gagal meskipun service worker belum aktif.

### Requirement 7: Folder Structure Sesuai TECHNICAL_ARCHITECTURE §3

**User Story:** As a Luma developer, I want struktur folder yang sama persis dengan dokumen arsitektur, so that setiap sprint tahu di mana harus menaruh kode tanpa restrukturisasi.

#### Acceptance Criteria

1. THE Folder_Structure SHALL berisi direktori `src/app/`, `src/pages/`, `src/components/`, `src/features/`, `src/stores/`, `src/db/`, `src/lib/`, `src/types/`, dan `src/styles/`.
2. THE src/components SHALL berisi sub-direktori `layout/`, `cards/`, `sheets/`, `forms/`, `charts/`, `character/`, `theme/`, dan `ui/`.
3. THE src/features SHALL berisi sub-direktori `transactions/`, `budgets/`, `savings/`, `reports/`, `customization/`, dan `ai/`.
4. THE src/app SHALL berisi file `App.tsx`, `routes.tsx`, dan `providers.tsx`.
5. THE src/pages SHALL berisi file `HomePage.tsx`, `TransactionsPage.tsx`, `TargetPage.tsx`, `ReportsPage.tsx`, `SettingsPage.tsx`, dan `BudgetDetailPage.tsx`.
6. THE src/components/layout SHALL berisi file `PageWrapper.tsx` dan `BottomNav.tsx`.
7. THE src/styles SHALL berisi file `globals.css`.
8. WHERE sebuah direktori belum berisi file source di Sprint 0, THE Folder_Structure SHALL menaruh file `.gitkeep` di dalamnya supaya direktori tetap ter-track Git.

### Requirement 8: Boundary — No IndexedDB, No Business Logic, No AI

**User Story:** As a Luma developer, I want Sprint 0 benar-benar terbatas pada scaffolding, so that scope tetap terkendali dan finance core di Sprint 2–3 dibangun di atas pondasi yang bersih.

#### Acceptance Criteria

1. THE UI_Layer SHALL tidak meng-import dari module `idb` di file manapun.
2. THE UI_Layer SHALL tidak mereferensikan global identifier `indexedDB` di file manapun.
3. THE Luma_App SHALL tidak mengandung implementasi Zustand store yang berfungsi (file di `src/stores/` SHALL kosong atau hanya memuat `.gitkeep`).
4. THE Luma_App SHALL tidak mengandung integrasi Gemini API atau AI parser apapun di Sprint 0.
5. THE Placeholder_Page untuk setiap route SHALL tidak melakukan data fetching, perhitungan budget, parsing transaksi, atau side effect lain di luar render statis.

### Requirement 9: Build dan Type-Check Quality Gate

**User Story:** As a Luma maintainer, I want quality gate yang jelas untuk menutup Sprint 0, so that pondasi divalidasi sebelum sprint berikutnya dimulai.

#### Acceptance Criteria

1. WHEN `npm run type-check` dijalankan pada commit Sprint 0 yang final, THE TypeScript_Compiler SHALL menyelesaikan dengan zero error dan exit code 0.
2. WHEN `npm run build` dijalankan pada commit Sprint 0 yang final, THE Vite_Toolchain SHALL menyelesaikan tahap type-check dan tahap bundling dengan zero error dan exit code 0.
3. WHEN `npm run preview` dijalankan setelah build berhasil, THE Vite_Toolchain SHALL menyajikan isi `dist/` dan menyajikan halaman placeholder yang sama seperti pada `npm run dev`.
4. THE .gitignore SHALL mengandung entri untuk `node_modules`, `dist`, `.env*`, dan `coverage` agar artefak build dan secret tidak ter-commit.
