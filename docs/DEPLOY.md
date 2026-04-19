# Deploy — Cloudflare Pages

## One-time setup

1. Sign in at https://dash.cloudflare.com/ and create a Pages project.
2. Connect the GitHub repository `quantum-physics-demo`.
3. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node.js version: `20`
4. Production branch: `main`.
5. Create a deploy hook under Pages settings → Builds & deployments → Deploy hooks. Copy the URL.
6. Add a GitHub Actions secret `CLOUDFLARE_PAGES_DEPLOY_HOOK` with that URL. The scheduled workflow uses it.
7. (Optional) Add a custom domain later.

## Preview deploys

Every push to a non-main branch gets a preview URL. Every PR gets a comment with the preview link.

## Production

Push to `main`. Cloudflare Pages rebuilds and deploys in ~1–2 minutes.

Future-dated issues go live on their release date thanks to the scheduled rebuild workflow.

## Env vars

None required at MVP.
