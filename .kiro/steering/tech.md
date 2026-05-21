# Tech Steering — Luma

Recommended stack:
- React
- Vite
- TypeScript
- Tailwind CSS
- CSS Variables
- Framer Motion
- Zustand
- IndexedDB via idb
- Recharts
- xlsx
- jsPDF
- html2canvas
- vite-plugin-pwa
- Gemini API for optional AI features

Storage:
- IndexedDB is the main storage.
- localStorage is only for lightweight flags.
- Transactions must not be stored in localStorage.

Architecture:
- Use repository layer for IndexedDB access.
- Components must not call IndexedDB directly.
- Use Zustand stores for app state.
- Use CSS variables for themes.
- Mobile-first max width 480px.
- App must remain usable offline.

AI:
- AI parser is optional.
- AI insight uses aggregated monthly data.
- AI must not block manual transaction creation.
