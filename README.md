# Digital Zen Monastery V1.3 — GitHub Pages first

## What works
Interactive Three.js environment, stylised fallback monk, optional GLB rigged monk loader, meditation timer, Vietnamese browser speech synthesis, responsive PWA, six navigation areas, sample Dharma references.

## Not yet included
**No photorealistic licensed GLB asset is bundled.** No production-quality lip sync, no tested real-time voice AI, and no verified public deployment. GitHub Pages is static and **cannot host the Node/Express API or keep an API key secret**.

## Publish to GitHub Pages
1. Create a GitHub repository, e.g. `digital-zen-monastery`.
2. Upload all project files, including `.github/workflows/pages.yml`, to branch `main`.
3. In GitHub repository **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
4. Wait for the Pages workflow to complete; the URL will typically be `https://USERNAME.github.io/digital-zen-monastery/` (replace USERNAME and repo name).
5. Open the published address in Safari on iPhone, then Share → Add to Home Screen.

GitHub Pages already serves HTTPS. A custom domain can be connected later; do not put API secrets in the repository.

## Local build
```bash
npm install --no-audit --no-fund
npm run build
npm run preview
```

## 3D asset pipeline
Place a **licensed** rigged, animated model at `public/assets/monk.glb` with idle animation. If missing, a procedural 3D monk remains visible. Check texture budgets, draw calls, polycount, device frame rate and licensing before release. This code does not claim that a photorealistic monk has been produced.

## AI backend
`server.mjs` is a prototype backend, not deployable on GitHub Pages. Live chat needs a separate secured HTTPS server, CORS allowlist, authentication/rate limiting and a source-verified Dharma corpus. `VITE_AI_ENDPOINT` may be set to a *public HTTPS API endpoint URL only*, never an API key. Do not enable it without privacy and safety review.

## QA checklist
- GitHub Action build succeeds; no broken paths under repo subpath.
- iPhone Safari: 3D rendering, touch navigation, timer, layout and text scaling.
- Add to Home Screen; verify manifest and icon.
- Verify browser Vietnamese voice availability; microphone recognition may not be supported.
- Validate GLB licensing, rig, animations and FPS on real devices.
- Validate AI privacy, citations and moderation before turning on live chat.
