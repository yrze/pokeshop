# Pokeshop

Pokemon card shop built with Next.js 16, Prisma 7, and PostgreSQL.

## Local development

Requirements:

- Node.js 20+
- PostgreSQL

Install dependencies:

```bash
npm ci
```

Start the dev server:

```bash
npm run dev
```

Important:

- `prisma/schema.prisma` is configured for PostgreSQL only.
- Your local `DATABASE_URL` must use a PostgreSQL connection string such as `postgresql://...`.

## Environment variables

Required:

- `DATABASE_URL`: PostgreSQL connection string
- `ADMIN_PASSWORD`: password used for the admin area

Recommended:

- `NEXT_PUBLIC_BASE_URL`: public site URL used for sitemap links

Optional:

- `ALLOW_STUB_PAYMENTS=true`: only for non-production testing if you want the built-in stub checkout flow

## Railway deployment

This repo is configured for Railway with a Dockerfile-based deploy.

Deployment flow:

1. Railway builds the image using [Dockerfile](./Dockerfile).
2. Railway runs the pre-deploy command from [railway.json](./railway.json) to apply Prisma migrations.
3. Railway starts the app using the Dockerfile `CMD` (`node server.js`).
4. Railway health-checks [`/api/health`](./app/api/health/route.ts).

Notes:

- The app expects Railway to provide `DATABASE_URL` dynamically at runtime.
- `startCommand` is explicitly set to `null` in `railway.json` so old dashboard overrides do not replace the Dockerfile startup command.
- The production image uses Next.js standalone output.

## Useful commands

```bash
npm run build
npm run lint
npm run db:deploy
```
