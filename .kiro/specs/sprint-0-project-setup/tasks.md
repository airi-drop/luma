# Implementation Plan: Sprint 0 — Project Setup

## Overview

Sprint 0 menyiapkan fondasi teknis Luma sebagai mobile-first PWA shell. Tasks di bawah ini menerjemahkan design document Sprint 0 menjadi langkah-langkah coding yang bisa dieksekusi berurutan: dari scaffolding Vite + React + TypeScript, instalasi dependency, konfigurasi Tailwind dengan CSS variables, struktur folder sesuai `docs/TECHNICAL_ARCHITECTURE.md` §3, sampai routing dan BottomNav yang ter-wire ke placeholder pages.

Setiap task dibangun di atas task sebelumnya: project bootstrap → config files → folder structure → styles → layout components → pages → routing → wiring. Tidak ada business logic, tidak ada IndexedDB, tidak ada Zustand store yang berfungsi — Sprint 0 hanya scaffolding.

Catatan: design document secara eksplisit menunda test runner ke Sprint 1+ (lihat "Testing Strategy" di `design.md`). Property test sub-tasks tetap dicantumkan dan dipetakan ke properties di design, tapi ditandai optional (`*`) sehingga bisa di-skip sampai test runner tersedia. Quality gate Sprint 0 adalah `npm run type-check` + `npm run build` exit 0.

## Tasks

- [ ] 1. Bootstrap project skeleton
  - [ ] 1.1 Inisialisasi root project files
    - Buat `package.json` di root (`name: "luma"`, `private: true`, `type: "module"`, `version: "0.0.0"`)
    - Buat `index.html` di root dengan `<div id="root"></div>` dan `<script type="module" src="/src/main.tsx">`
    - Buat `tsconfig.json` dan `tsconfig.node.json` standar Vite + React + TypeScript
    - Buat `.gitignore` dengan entri `node_modules`, `dist`, `.env*`, `coverage`
    - _Validates: Requirements 1.1, 1.2, 9.4_

- [ ] 2. Install dependencies sesuai BUILD_PLAN §7
  - [ ] 2.1 Tambahkan `dependencies` di `package.json`
    - `react`, `react-dom`, `react-router-dom`
    - `zustand`, `idb`, `nanoid`, `date-fns`
    - `framer-motion`, `recharts`, `xlsx`, `jspdf`, `html2canvas`
    - _Validates: Requirements 6.1_

  - [ ] 2.2 Tambahkan `devDependencies` di `package.json`
    - `vite`, `@vitejs/plugin-react`, `typescript`
    - `@types/react`, `@types/react-dom`
    - `tailwindcss`, `postcss`, `autoprefixer`, `vite-plugin-pwa`
    - _Validates: Requirements 6.2_

  - [ ] 2.3 Definisikan npm scripts
    - `dev` = `vite`
    - `build` = `tsc -b && vite build`
    - `preview` = `vite preview`
    - `type-check` = `tsc -b --pretty`
    - _Validates: Requirements 1.3, 1.4, 1.5, 6.3_

  - [ ] 2.4 Jalankan `npm install` dan verifikasi exit code 0
    - Pastikan semua dependency terinstal tanpa error
    - _Validates: Requirements 1.2_

- [ ] 3. Konfigurasi Vite, Tailwind, dan PostCSS
  - [ ] 3.1 Buat `vite.config.ts` dengan plugin React dan VitePWA
    - Plugin `@vitejs/plugin-react`
    - Plugin `VitePWA` dengan `registerType: "prompt"`, `injectRegister: false`
    - Manifest: `name: "Luma"`, `short_name: "Luma"`, `start_url: "/home"`, `icons: []`
    - Server port 5173, build outDir `dist`, sourcemap true
    - _Validates: Requirements 1.3, 1.4, 6.5_

  - [ ] 3.2 Buat `tailwind.config.ts` dengan CSS variable color mapping
    - `content`: `["./index.html", "./src/**/*.{ts,tsx}"]`
    - `theme.extend.maxWidth.app = "480px"`
    - `theme.extend.colors`: petakan `bg-main`, `bg-card`, `bg-card-soft`, `text-primary`, `text-secondary`, `text-muted`, `accent-primary`, `accent-secondary`, `accent-soft` ke `var(--token-name)`
    - `theme.extend.fontFamily`: `display: ["Fraunces", "serif"]`, `body: ["DM Sans", "system-ui", "sans-serif"]`
    - `theme.extend.borderRadius`: `card: "24px"`, `hero: "28px"`, `sheet: "28px"`
    - _Validates: Requirements 2.4, 2.5, 5.1, 5.6_

  - [ ] 3.3 Buat `postcss.config.js` dengan plugin tailwindcss dan autoprefixer
    - Standar konfigurasi PostCSS untuk Tailwind v3
    - _Validates: Requirements 2.2_

- [ ] 4. Buat folder structure sesuai TECHNICAL_ARCHITECTURE §3
  - [ ] 4.1 Buat direktori top-level di `src/`
    - `src/app/`, `src/pages/`, `src/components/`, `src/features/`
    - `src/stores/`, `src/db/`, `src/lib/`, `src/types/`, `src/styles/`
    - _Validates: Requirements 7.1_

  - [ ] 4.2 Buat sub-direktori `src/components/`
    - `layout/`, `cards/`, `sheets/`, `forms/`, `charts/`, `character/`, `theme/`, `ui/`
    - Tambahkan `.gitkeep` di setiap folder yang masih kosong
    - _Validates: Requirements 7.2, 7.8_

  - [ ] 4.3 Buat sub-direktori `src/features/`
    - `transactions/`, `budgets/`, `savings/`, `reports/`, `customization/`, `ai/`
    - Tambahkan `.gitkeep` di setiap folder
    - _Validates: Requirements 7.3, 7.8_

  - [ ] 4.4 Tambahkan `.gitkeep` di `src/stores/`, `src/db/`, `src/lib/`, `src/types/`
    - Folder ini tetap kosong di Sprint 0
    - _Validates: Requirements 7.8, 8.3_

- [ ] 5. Buat global stylesheet dengan design tokens
  - [ ] 5.1 Buat `src/styles/globals.css`
    - Direktif `@tailwind base; @tailwind components; @tailwind utilities;` (urutan tepat)
    - Deklarasikan semua design tokens di `:root`: `--bg-main`, `--bg-card`, `--bg-card-soft`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent-primary`, `--accent-secondary`, `--accent-soft`, `--danger-soft`, `--success-soft`, `--warning-soft` dengan nilai Cozy Dark sesuai `docs/DESIGN_SYSTEM.md` §3
    - Set `html`, `body`, `#root` height 100%, margin 0
    - Apply `background: var(--bg-main)` dan `color: var(--text-primary)` pada body
    - _Validates: Requirements 2.2, 2.3, 2.6_

- [ ] 6. Buat layout components
  - [ ] 6.1 Buat `src/components/layout/PageWrapper.tsx`
    - Export `PageWrapper(props: { children, showBottomNav?, title? })`
    - Default `showBottomNav = true`
    - Outer container: `mx-auto w-full max-w-app min-h-screen bg-bg-main text-text-primary`
    - Main content: `px-5 pt-6` dengan padding bawah `pb-24` jika `showBottomNav`, `pb-6` jika tidak
    - Render `<h1 className="font-display text-2xl mb-4">` ketika `title` ada
    - Render `<BottomNav />` di akhir ketika `showBottomNav` true
    - _Validates: Requirements 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 6.2 Buat `src/components/layout/BottomNav.tsx`
    - Definisikan konstanta `NAV_ITEMS` dengan tepat 4 entri urutan: `/home` "Home", `/transactions` "Transaksi", `/target` "Target", `/reports` "Laporan"
    - Tidak boleh ada entri `/settings` atau `/budget`
    - Render `<nav>` fixed bottom, `left-1/2 -translate-x-1/2 w-full max-w-app`, `bg-bg-card`, `border-t border-black/10`, `flex justify-around py-3 z-50`, `aria-label="Bottom navigation"`
    - Map `NAV_ITEMS` ke `<NavLink>`; aktif state pakai `text-accent-primary font-bold`, inaktif pakai `text-text-muted`
    - `<NavLink>` otomatis menambahkan `aria-current="page"` saat aktif
    - Tambahkan `data-testid` per item (`nav-home`, `nav-transactions`, `nav-target`, `nav-reports`)
    - _Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.7_

  - [ ] 6.3* Property test untuk BottomNav (opsional, defer ke Sprint 1+)
    - **Property 4: Bottom nav items are exactly the four primary tabs in order** — assert `NAV_ITEMS.length === 4` dan `NAV_ITEMS.map(i => i.to)` strictly equal `["/home", "/transactions", "/target", "/reports"]`
    - **Property 5: Settings dan Budget excluded** — untuk semua `i ∈ NAV_ITEMS`, `i.to !== "/settings"` dan `i.to !== "/budget"`
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [ ] 7. Buat placeholder pages
  - [ ] 7.1 Buat 4 page placeholder dengan BottomNav
    - `src/pages/HomePage.tsx`, `src/pages/TransactionsPage.tsx`, `src/pages/TargetPage.tsx`, `src/pages/ReportsPage.tsx`
    - Setiap page render `<PageWrapper title="..." showBottomNav>` dengan caption `<p className="text-text-secondary">Coming soon — Sprint X</p>` (sesuaikan sprint number per fitur)
    - Tidak ada data fetching, tidak ada side effect
    - _Validates: Requirements 3.5, 8.5_

  - [ ] 7.2 Buat 2 page placeholder tanpa BottomNav
    - `src/pages/SettingsPage.tsx` dan `src/pages/BudgetDetailPage.tsx`
    - Render `<PageWrapper title="..." showBottomNav={false}>` dengan caption singkat
    - _Validates: Requirements 3.5, 4.6, 8.5_

- [ ] 8. Buat router dan compose providers
  - [ ] 8.1 Buat `src/app/routes.tsx`
    - Import 6 placeholder pages plus `Navigate` dan `createBrowserRouter` dari `react-router-dom`
    - Export `routeObjects: RouteObject[]` dengan tepat 8 entri: `/` (Navigate to `/home`), `/home`, `/transactions`, `/target`, `/reports`, `/settings`, `/budget`, dan `*` (Navigate to `/home`)
    - Export `router = createBrowserRouter(routeObjects)`
    - _Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.6_

  - [ ] 8.2 Buat `src/app/providers.tsx`
    - Export `Providers(props: { children? })`
    - Render `<RouterProvider router={router} />`
    - Komentar TODO untuk ThemeProvider, ErrorBoundary, ToastProvider di sprint berikutnya
    - _Validates: Requirements 1.1, 3.1_

  - [ ] 8.3 Buat `src/app/App.tsx`
    - Export `App()` yang me-return `<Providers />`
    - _Validates: Requirements 1.1_

  - [ ] 8.4* Property test untuk route table (opsional, defer ke Sprint 1+)
    - **Property 1: Route coverage is total** — untuk semua `p ∈ {"/", "/home", "/transactions", "/target", "/reports", "/settings", "/budget"}`, `routeObjects` punya tepat satu entri yang match
    - **Property 2: Root path redirects to home** — resolusi `/` menghasilkan element `<Navigate to="/home" replace />`
    - **Property 3: Unknown paths redirect to home** — sample arbitrary paths (`/foo`, `/bar/baz`) resolve ke catch-all `*` yang redirect ke `/home`
    - **Validates: Requirements 3.1, 3.2, 3.3**

- [ ] 9. Wire entry point
  - [ ] 9.1 Buat `src/main.tsx`
    - Import `React`, `ReactDOM`, `App` dari `./app/App`, dan side-effect `./styles/globals.css`
    - Mount `<React.StrictMode><App /></React.StrictMode>` ke `document.getElementById("root")!`
    - _Validates: Requirements 1.1, 2.1_

- [ ] 10. Checkpoint — Verifikasi quality gate
  - Jalankan `npm run type-check` dan pastikan exit code 0
  - Jalankan `npm run build` dan pastikan `tsc -b` lalu `vite build` selesai dengan exit code 0 plus direktori `dist/` terbentuk
  - Jalankan `npm run dev` (manual oleh user), kunjungi `http://localhost:5173` dan verifikasi: redirect `/` → `/home`, semua 6 route render placeholder, BottomNav muncul di 4 route utama, BottomNav hilang di `/settings` dan `/budget`, active state highlight tab yang sesuai
  - Jalankan `npm run preview` (manual oleh user) dan verifikasi build artifact serve dengan benar
  - Ensure all tests pass, ask the user if questions arise.
  - _Validates: Requirements 1.4, 1.5, 9.1, 9.2, 9.3_

- [ ] 11. Verifikasi boundary constraints (no IndexedDB, no business logic, no AI)
  - [ ] 11.1 Audit `src/components/**` dan `src/pages/**` untuk import terlarang
    - Pastikan tidak ada `import ... from "idb"` di file manapun
    - Pastikan tidak ada referensi global `indexedDB`
    - Pastikan tidak ada import dari `zustand`, `nanoid`, `date-fns`, `framer-motion`, `recharts`, `xlsx`, `jspdf`, `html2canvas` (terinstal tapi belum dipakai)
    - _Validates: Requirements 6.4, 8.1, 8.2_

  - [ ] 11.2 Konfirmasi `src/stores/` dan folder kosong lainnya hanya berisi `.gitkeep`
    - Tidak ada implementasi store di Sprint 0
    - Tidak ada file Gemini/AI parser di Sprint 0
    - _Validates: Requirements 8.3, 8.4_

  - [ ] 11.3* Property test untuk boundary (opsional, defer ke Sprint 1+)
    - **Property 9: No direct IndexedDB access from UI layer** — untuk semua file di `src/components/**` dan `src/pages/**`, AST/grep scan tidak menemukan import `idb` atau referensi `indexedDB`
    - **Validates: Requirements 8.1, 8.2**

- [ ] 12. Final checkpoint — Sprint 0 done
  - Re-run `npm run type-check` → exit 0 (Property 10)
  - Re-run `npm run build` → exit 0 (Property 8)
  - Inspeksi visual: background pakai `--bg-main`, teks pakai `--text-primary`, container max 480px terpusat (Property 6, Property 7)
  - Konfirmasi commit Sprint 0 final siap untuk dilanjutkan ke Sprint 1
  - Ensure all tests pass, ask the user if questions arise.
  - _Validates: Requirements 9.1, 9.2, 9.3, 9.4_

## Notes

- Tasks bertanda `*` adalah optional dan bisa di-skip untuk MVP cepat. Untuk Sprint 0, semua property test sub-tasks ditandai optional karena design document secara eksplisit menunda test runner setup ke Sprint 1+.
- Setiap task referensi requirement spesifik via `Validates: Requirements X.Y` untuk traceability.
- Checkpoint task (10 dan 12) memastikan validasi inkremental sebelum lanjut.
- Property tests memvalidasi correctness properties universal dari design document; ketika test runner tersedia di sprint berikutnya, property sub-tasks bisa diaktifkan tanpa rework.
- Quality gate Sprint 0 minimal: `npm run type-check` + `npm run build` exit code 0, plus inspeksi visual route + BottomNav.
- Dependency yang terinstal tapi belum diimport (zustand, idb, nanoid, date-fns, framer-motion, recharts, xlsx, jspdf, html2canvas) sengaja disiapkan supaya sprint berikutnya tidak perlu menyentuh `package.json`.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["2.4"] },
    { "id": 3, "tasks": ["3.1", "3.2", "3.3", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "5.1"] },
    { "id": 5, "tasks": ["6.2"] },
    { "id": 6, "tasks": ["6.1", "6.3"] },
    { "id": 7, "tasks": ["7.1", "7.2"] },
    { "id": 8, "tasks": ["8.1"] },
    { "id": 9, "tasks": ["8.2", "8.4"] },
    { "id": 10, "tasks": ["8.3"] },
    { "id": 11, "tasks": ["9.1"] },
    { "id": 12, "tasks": ["11.1", "11.2", "11.3"] }
  ]
}
```
