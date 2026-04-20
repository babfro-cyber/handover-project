# Deploy to DigitalOcean App Platform

Use **App Platform** with a **Static Site** component.

## Exact settings

- Component type: `Static Site`
- Source directory: `/`
- Build command: leave empty
- Output directory: `/`
- Index document: `index.html`

## Deployable files

DigitalOcean should serve the project root directly:

- `index.html`
- `app.js`
- `styles.css`

## Notes

- No build step is required.
- No environment variables are required.
- The `.do/app.yaml` file in this repo preconfigures the static-site component settings.
