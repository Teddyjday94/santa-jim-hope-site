# Santa Jim Hope Website

Official website project for Santa Jim Hope, built with **Next.js App Router** and deployed on **Vercel**.

## Where the homepage is

This project does **not** use a hand-written `index.html` file. Next.js generates the HTML for the site.

- `app/page.tsx` — homepage content (the closest equivalent to `index.html`)
- `app/layout.tsx` — site-wide HTML shell, metadata, favicon, and global styles
- `components/santa/` — Santa-specific reusable sections and interactive components
- `lib/` — booking form validation and inquiry delivery logic
- `public/` — images, icons, decorative artwork, and video assets
- `tests/` — lightweight regression tests for the site

## Main project structure

```text
santa-jim-hope-site/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── *.css
├── components/
│   └── santa/
├── lib/
├── public/
│   ├── decor/
│   ├── icons/
│   ├── images/
│   └── videos/
├── tests/
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── vercel.json
```

## Local development

```bash
npm install
npm run dev
```

Then open the local URL shown by Next.js.

## Checks

```bash
npm run lint
npm test
npm run build
```

## Deployment

Vercel is configured to build the project as a Next.js application with `next build`.

### Acceptance email settings

Accepted booking emails are sent server-side through Resend. Configure these server-only environment variables in Vercel:

- `RESEND_API_KEY` — Resend API key
- `SANTA_EMAIL_FROM` — sender on a verified domain, such as `Santa Jim <bookings@example.com>`
- `SANTA_EMAIL_DELIVERY_MODE` — use `test` in previews and `live` only when customer delivery is approved

In test mode, email is routed to the business test inbox and clearly identifies the intended customer. Until Resend is configured, previews use the site's existing FormSubmit test channel; live customer delivery never falls back and remains disabled without Resend. Never expose the API key through a `NEXT_PUBLIC_` variable.

## Repository cleanup note

Generated build output and unrelated starter/framework examples should not be committed. The repository is intentionally organized around the files that actually power the Santa Jim Hope website.
