# Deploy to DigitalOcean App Platform

Use **App Platform** with a **Static Site** component.

## Exact settings

- Component type: `Static Site`
- Source directory: `/`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Index document: `index.html`
- Catch-all document: `index.html`

## Deployable files

DigitalOcean should serve the generated `dist` directory:

- `index.html`
- `404.html`
- `app.js`
- `styles.css`

## Notes

- No environment variables are required.
- The `.do/app.yaml` file in this repo preconfigures the static-site component settings.
- Expert links use `/interview/:token` and include a small encoded demo payload so a different browser can open the flow without a backend.
