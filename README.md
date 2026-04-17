# Photography Portfolio (Next.js + Tailwind + Vercel Blob)

Single-page portfolio site with:
- Hero (featured photo)
- Gallery (tag filter, 10 + “Load more”, lightbox with EXIF)
- Contact (links only)

## Develop

```bash
npm install
npm run dev        # Webpack (recommended)
npm run dev:turbo  # Turbopack
```

If you see `Can't resolve 'tailwindcss'`, check for lockfiles (e.g. `package-lock.json`) in parent folders; Turbopack uses lockfiles to detect the filesystem root.

## Content

- `src/content/site.ts` — hero + contact links + featured photo id
- `src/content/photos.json` — photo metadata (description/tags/EXIF + URLs)

## Photo Sync (local → Vercel Blob → `photos.json`)

1) Put original photos in `photos-src/` (gitignored)
2) Create `.env.local` with `BLOB_READ_WRITE_TOKEN` (see `.env.example`)
3) Run:

```bash
npm run photos:sync
```

Re-running the script updates URLs/dimensions/EXIF while preserving existing `description` and `tags` edits per photo.
