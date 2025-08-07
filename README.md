# Multimodal

This repository contains a React Native (Expo) walking skeleton for a multimodal interface to large language models. The app lets users swipe between different input and output modalities.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

3. Run tests:

```bash
npm test
```

## Project Structure

- `App.js` – main application component with swipable modality selectors.
- `index.js` – entry point registering the app.
- `app.json` – Expo configuration.
- `__tests__/` – example Jest test.
- `.vibe/` – notes and task tracking.

## Next Steps

- Hook up modality selections to real inputs (text, images, audio, etc.).
- Connect to an LLM service for multi‑modal responses.
- Flesh out UI/UX for selecting and composing modalities.
