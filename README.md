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
```

Luma automatically extracts: amount, category, account, transaction type, and description.

---

## ⚡ AI Architecture

Luma uses a hybrid local-first parsing system.

**Parsing Flow:**
1. Local heuristic parser runs first
2. Optional AI refinement runs if provider is available
3. If AI fails, local parsing result is still used safely

**This approach provides:**
- Faster parsing
- Better reliability
- Offline usability
- Lower AI cost
- Graceful fallback behavior

---

## 📊 Reports & Insights

- Expense breakdown
- Monthly summaries
- Behavioral spending insights
- Saving progress tracking
- Exportable reports

AI insights are generated from aggregate finance data with controlled prompt validation.

---

## 🛠 Tech Stack

**Frontend:** React, TypeScript, Vite, TailwindCSS

**State & Storage:** Zustand, IndexedDB

**Deployment:** Vercel

**Optional AI Providers:** Gemini, OpenAI, OpenRouter

---

## 📁 Project Structure

```
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
```

---

## 🚀 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run lint
npm run lint

# Build production
npm run build

# Preview production build
npm run preview
```

---

## 🔐 Environment Variables

Optional AI configuration (see `.env.example`):

| Variable | Description |
|----------|-------------|
| `VITE_AI_PROVIDER` | AI provider: `gemini` (default), `openai`, or `openrouter` |
| `VITE_AI_MODEL` | Override model ID (optional) |
| `VITE_AI_API_KEY` | Universal API key (works with any provider) |
| `VITE_GEMINI_API_KEY` | Gemini-specific key (overrides universal) |
| `VITE_OPENAI_API_KEY` | OpenAI-specific key (overrides universal) |
| `VITE_OPENROUTER_API_KEY` | OpenRouter-specific key (overrides universal) |

Local parsing still works without AI providers.

---

## 📱 PWA Support

Luma is designed as a mobile-first Progressive Web App with:

- Installable experience
- Offline-friendly behavior
- Responsive layout
- Touch-optimized navigation

---

## 🎯 Design Philosophy

Luma focuses on:

- Ultra-fast input
- Low cognitive load
- Practical daily usability
- Clean mobile UX
- Graceful AI assistance
- Reliable local-first behavior

---

## 📄 License

MIT
