# Homeward API

The web app talks only to this server. The server holds the demo keys and signs on Stellar Testnet, so keys never reach the browser.

## Run it

Needs Node 22.13 or newer and a `.env` file in the repo root (see `.env.example`).

```bash
cd packages/homeward-client && npm install && npm run build
cd ../../backend && npm install
npm start          # http://localhost:4000/api/health
npm run smoke      # tests every route on testnet, takes about 10 minutes
```

Set up a build once before using it:

```bash
curl -X POST localhost:4000/api/project -H 'content-type: application/json' -d '{"slug":"thrissur"}'
```

This takes a minute or two. Pass `"fresh":true` to restart a build from scratch.

## Connecting the app

`GET` routes return the same `Project` shape as `web/lib/store.ts`, in whole rupees, so screens keep working when `store.ts` calls the API. Set `NEXT_PUBLIC_API_URL`, and set `WEB_ORIGIN` on the server to the app's address.

`project` is the app's id, such as `thrissur`. `:stage` is the stage slug, such as `foundation`.

| Route | Body | Who signs |
|---|---|---|
| `GET /api/projects` | | |
| `GET /api/project/:id` | | |
| `GET /api/timeline/:id` | Newest first, with explorer links | |
| `POST /api/project` | `{slug, fresh?}` | admin |
| `POST /api/fund` | `{project, sponsor, amount}` (name such as `Anil`, whole rupees) | that sponsor |
| `POST /api/stages/:stage/open` | `{project}`, returns the stage `code` | admin |
| `POST /api/stages/:stage/proof` | Multipart: `project`, and the file in `video` | builder |
| `POST /api/stages/:stage/decide` | `{project, as, approve, note?}`, `as` is `inspector1`, `inspector2` or `parent` | that role |
| `POST /api/stages/:stage/recheck` | `{project, as}`, `as` is `parent`, `sponsor1` or `sponsor2` | that role |
| `POST /api/stages/:stage/release` | `{project}`, after the handover hold | admin |
| `POST /api/project/:id/freeze` | `{as}`, same roles as recheck | that role |
| `POST /api/project/:id/resolve` | `{refundBps?}`, default is a full refund | admin |

Every write returns `{hash, explorer}`, plus anything listed above. `decide` also returns `paid`.

Errors return `{error}` in plain words that are safe to show on screen. Refusals from the contract also include `code`.

A write takes about 10 seconds. Show a loading state, and fetch the project again afterwards.

## Good to know

- `as` is the demo role switcher, not real sign-in.
- Only one stage can be active at a time. A rejected stage still counts until new proof passes.
- An approved handover shows as `submitted` with `holdUntil` (Unix seconds). Call `release` after that time.
- Money and status come from the contract. Names and photos come from `web/mock/projects.json`.
- Partial refunds while a build continues are not supported by the contract.
- `/api/timeline` is built from the API's own actions until the indexer is ready. `/api/anchor/deposit` isn't built yet.
