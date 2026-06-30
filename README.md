# RESCUE — The Last-Minute Life Saver

An AI-powered agentic productivity companion that plans, prioritizes, and helps you finish before deadlines slip. Built with React, TypeScript, Vite, Tailwind, Three.js, and Framer Motion.

## Live demo

Deployed via GitHub Pages: `https://nagarjunareddydondeti.github.io/The-Last-Minute-Life-Saver/`

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build locally
```

## Gemini API key

The agent uses Google's Gemini API for planning, task decomposition, drafting, and reflection. There is no key bundled with the app — you provide your own at runtime in **Settings**, and it is stored locally in your browser. If no key is set (or a request fails), RESCUE falls back to a built-in local reasoning engine, so the app stays fully functional offline.

## Deployment

Pushing to `main` triggers the GitHub Actions workflow in `.github/workflows/deploy.yml`, which builds the app and publishes `dist/` to GitHub Pages.

To enable it once: in the repo, go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.

The Vite `base` path in `vite.config.ts` is set to `/The-Last-Minute-Life-Saver/` for production so assets resolve correctly on the project Pages URL. If you rename the repo, update that value to match.

## Tech stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS
- Three.js / React Three Fiber / Drei (agent orb)
- Framer Motion
- Zustand (state)
- Google Gemini API (optional, user-supplied key)
