# Luma

Modern AI-assisted personal finance tracker built for fast daily logging, smart transaction parsing, and clean mobile-first UX.

Luma combines deterministic local parsing with optional AI refinement to create a reliable, lightweight, and privacy-friendly finance experience.

---

## ✨ Features

- Smart natural language transaction input
- Hybrid AI-assisted parsing
- Local-first architecture
- Fast mobile-first dashboard
- Expense & income tracking
- Saving goals
- Budget tracking
- Behavioral finance insights
- Offline-friendly experience
- PWA support
- CSV/XLSX export
- Customizable appearance/backgrounds

---

## 🧠 Smart Parsing Examples

````txt
makan bakso 25rb
spotify 55k bca
isi bensin 100rb
gaji 5jt
token listrik 200rb

Luma automatically extracts:

amount
category
account
transaction type
description
⚡ AI Architecture

Luma uses a hybrid local-first parsing system.

Parsing Flow
Local heuristic parser runs first
Optional AI refinement runs if provider is available
If AI fails, local parsing result is still used safely

This approach provides:

faster parsing
better reliability
offline usability
lower AI cost
graceful fallback behavior
📊 Reports & Insights
Expense breakdown
Monthly summaries
Behavioral spending insights
Saving progress tracking
Exportable reports

AI insights are generated from aggregate finance data with controlled prompt validation.

🛠 Tech Stack
Frontend
React
TypeScript
Vite
TailwindCSS
State & Storage
Zustand
IndexedDB
Deployment
Vercel
Optional AI Providers
Gemini
OpenAI
OpenRouter
📁 Project Structure
src/
├── app/
├── components/
├── db/
├── features/
├── hooks/
├── pages/
├── stores/
├── types/
└── utils/
🚀 Development

Install dependencies:

npm install

Run development server:

npm run dev

Run lint:

npm run lint

Build production:

npm run build

Preview production build:

npm run preview
🔐 Environment Variables

Optional AI configuration:

VITE_GEMINI_API_KEY=your_key
VITE_OPENAI_API_KEY=your_key
VITE_OPENROUTER_API_KEY=your_key

Local parsing still works without AI providers.

📱 PWA Support

Luma is designed as a mobile-first Progressive Web App with:

installable experience
offline-friendly behavior
responsive layout
touch-optimized navigation
🎯 Design Philosophy

Luma focuses on:

ultra-fast input
low cognitive load
practical daily usability
clean mobile UX
graceful AI assistance
reliable local-first behavior
🧪 Production Hardening

Recent improvements include:

spreadsheet export sanitization
memory leak fixes
repository-level validation
safer AI fallback handling
improved runtime stability
optimized transaction rendering
better mobile readability
📌 Current Status

Luma is currently in active development.

Core finance tracking, smart parsing, reports, and AI-assisted workflows are functional and continuously improving.

📄 License

MIT

ini tampilannya jadi jelek ga kalo udah di copy

Iya, kalau lu copas yang tadi langsung ke GitHub README kadang bisa agak berantakan karena gw tadi campur markdown sama format chat/code internal.

Ini gw bikinin versi clean GitHub-ready yang aman langsung paste ke README.md tanpa rusak tampilannya:

# Luma

Modern AI-assisted personal finance tracker built for fast daily logging, smart transaction parsing, and clean mobile-first UX.

Luma combines deterministic local parsing with optional AI refinement to create a reliable, lightweight, and privacy-friendly finance experience.

---

## ✨ Features

- Smart natural language transaction input
- Hybrid AI-assisted parsing
- Local-first architecture
- Fast mobile-first dashboard
- Expense & income tracking
- Saving goals
- Budget tracking
- Behavioral finance insights
- Offline-friendly experience
- PWA support
- CSV/XLSX export
- Customizable appearance/backgrounds

---

## 🧠 Smart Parsing Examples

```txt
makan bakso 25rb
spotify 55k bca
isi bensin 100rb
gaji 5jt
token listrik 200rb

Luma automatically extracts:

amount
category
account
transaction type
description
⚡ AI Architecture

Luma uses a hybrid local-first parsing system.

Parsing Flow
Local heuristic parser runs first
Optional AI refinement runs if provider is available
If AI fails, local parsing result is still used safely

This approach provides:

faster parsing
better reliability
offline usability
lower AI cost
graceful fallback behavior
📊 Reports & Insights
Expense breakdown
Monthly summaries
Behavioral spending insights
Saving progress tracking
Exportable reports

AI insights are generated from aggregate finance data with controlled prompt validation.

🛠 Tech Stack
Frontend
React
TypeScript
Vite
TailwindCSS
State & Storage
Zustand
IndexedDB
Deployment
Vercel
Optional AI Providers
Gemini
OpenAI
OpenRouter
📁 Project Structure
src/
├── app/
├── components/
├── db/
├── features/
├── hooks/
├── pages/
├── stores/
├── types/
└── utils/
🚀 Development

Install dependencies:

npm install

Run development server:

npm run dev

Run lint:

npm run lint

Build production:

npm run build

Preview production build:

npm run preview
🔐 Environment Variables

Optional AI configuration:

VITE_GEMINI_API_KEY=your_key
VITE_OPENAI_API_KEY=your_key
VITE_OPENROUTER_API_KEY=your_key

Local parsing still works without AI providers.

📱 PWA Support

Luma is designed as a mobile-first Progressive Web App with:

installable experience
offline-friendly behavior
responsive layout
touch-optimized navigation
🎯 Design Philosophy

Luma focuses on:

ultra-fast input
low cognitive load
practical daily usability
clean mobile UX
graceful AI assistance
reliable local-first behavior
🧪 Production Hardening

Recent improvements include:

spreadsheet export sanitization
memory leak fixes
repository-level validation
safer AI fallback handling
optimized transaction rendering
improved runtime stability
better mobile readability
📌 Current Status

Luma is currently in active development.

Core finance tracking, smart parsing, reports, and AI-assisted workflows are functional and continuously improving.

📄 License

MIT
````
