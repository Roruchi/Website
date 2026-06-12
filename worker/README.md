# Interaction Worker

Cloudflare Worker and D1 storage for the homepage koi feed count and article ripples.

## Production deployment

The production API runs as a Cloudflare Pages Function because this Cloudflare account
did not provision a `workers.dev` namespace. Pages Functions use the same Workers runtime
and D1 binding.

Production URL:

```text
https://personal-website-interactions-api.pages.dev
```

Deploy updates with:

```powershell
cd worker
npm run pages:deploy
```

The GitHub repository variable `INTERACTIONS_API_URL` points to this URL.

## Worker setup

```powershell
cd worker
npm install
npx wrangler login
npx wrangler d1 create personal-website-interactions
```

Copy the returned database ID into `wrangler.toml`, then initialize and deploy:

```powershell
npm run db:remote
npx wrangler secret put VISITOR_PEPPER
npm run pages:deploy
```

Use a long random value for `VISITOR_PEPPER`. It is combined with the browser's private
visitor ID before anything is stored.

Add the deployed Worker URL as a GitHub Actions repository variable named
`INTERACTIONS_API_URL`, for example:

```text
https://personal-website-interactions.<account>.workers.dev
```

The website remains usable without the Worker. Counts then use local storage and pending
interactions are retried when the API becomes available.
