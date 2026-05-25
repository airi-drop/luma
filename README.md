# Luma

AI-powered personal finance tracker focused on ultra-fast transaction input, intelligent parsing, and modern mobile-first UX.

## Features

- AI-assisted transaction parsing
- Natural language expense input
- Smart category detection
- Account detection
- Mobile-first dashboard
- Fast manual transaction flow
- Offline-friendly architecture
- Responsive PWA support
- Local-first experience
- Lightweight and fast UI

## Example Inputs

```txt
makan bakso 25rb
spotify 55k bca
isi bensin 100rb
token listrik 200rb
gaji 5jt

Luma automatically extracts:

amount
category
transaction type
account
description
Tech Stack
React
TypeScript
Vite
TailwindCSS
Zustand
Vercel
AI Parsing System

Luma uses a hybrid parsing architecture:

Deterministic local parser (primary)
AI provider fallback (optional)
Manual correction flow

This approach improves:

speed
reliability
offline usability
cost efficiency
Project Structure
src/
 ├── components/
 ├── features/
 ├── hooks/
 ├── pages/
 ├── services/
 ├── store/
 ├── utils/
 └── types/
Development

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
Environment Variables
VITE_GEMINI_API_KEY=your_api_key

Optional depending on provider configuration.

Deployment

Recommended deployment platform:

Vercel

Production build is optimized for:

static deployment
edge delivery
mobile performance
Design Philosophy

Luma focuses on:

ultra-fast input
low friction UX
mobile-first interactions
AI-assisted productivity
minimal cognitive load
Current Status

Active development.

Core transaction flow and AI parsing are functional.
Additional analytics and advanced finance modules are planned.

License

MIT
