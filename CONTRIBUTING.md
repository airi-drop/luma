# Contributing to Luma

Makasih sudah mau bantu Luma. Thanks for helping make this cozy finance app better.

## Local Setup

```bash
git clone https://github.com/airi-drop/luma.git
cd luma
npm install
cp .env.example .env
npm run dev
```

After that, open the local Vite URL in your browser.

## How to Contribute

1. Fork this repository.
2. Create a focused branch, for example `feat/manual-transaction-note` or `fix/budget-progress`.
3. Make small, clear changes.
4. Run the relevant checks before opening a pull request.
5. Open a PR with a short summary, what changed, and any screenshots if the UI changed.

Santai aja, but keep the PR easy to review.

## Code Style Notes

- Use TypeScript for app code.
- Use Tailwind CSS and existing CSS variables for styling.
- Follow the existing Zustand store patterns for client state.
- Keep IndexedDB access inside the repository layer, not inside React components.
- Keep copy casual, soft, and friendly in Indonesian where it appears in the app.
- Avoid unrelated refactors in feature or fix PRs.

## Mobile-First

Luma is designed mobile-first with a max app width of 480px. Please check changes at small screen sizes and keep finance data readable before adding extra visual polish.
