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

- Without Supabase environment variables, the app keeps using the local demo fallback.
- For Phase 1 Supabase persistence, set these App Platform environment variables:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `NUMERHYD_MANAGER_TOKEN` optional, but useful if the same manager dashboard should load interviews after clearing browser storage.
- The `.do/app.yaml` file in this repo preconfigures the static-site component settings.
- Expert links use `/interview/:token`.
- Local demo links still include a small encoded demo payload when Supabase config is missing.
- Supabase-backed links load interview data through browser-safe RPC calls with the public anon key. Do not put a service-role key in this app.

## Supabase Phase 1 setup

1. Open the Supabase SQL editor.
2. Run `supabase_phase1.sql` from this repository.
3. Copy the project URL and public anon key from Supabase Project Settings > API.
4. Add the variables above to DigitalOcean App Platform.
5. Redeploy the static site. The build command writes `dist/env.js` from those variables.
