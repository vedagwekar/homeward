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
| `POST /api/project/:id/resolve` | `{refundBps?}`, default is a full refund. Also returns the builder's security to the builder | admin |
| `POST /api/project/:id/deposit` | `{amount?}` in rupees, default is whatever is still to post | builder |
| `POST /api/project/:id/return-deposit` | After the last stage and the defects period | admin (anyone could) |
| `POST /api/project/:id/default/claim` | `{as, stage}`, `as` is `parent`, `sponsor1` or `sponsor2`, `stage` is a stage slug | that role |
| `POST /api/project/:id/default/confirm` | `{as}`, `as` is `inspector1` or `inspector2` | that engineer |
| `POST /api/project/:id/default/contest` | The builder disputes during their response window | builder |
| `POST /api/project/:id/default/finalize` | After the response window with no dispute: money goes back to the family | admin (anyone could) |
| `POST /api/project/:id/default/withdraw` | `{as}`, the family takes the report back | that role |
| `POST /api/project/:id/default/settle` | `{forfeit}`, only for a disputed report | admin |

Every write returns `{hash, explorer}`, plus anything listed above. `decide` also returns `paid`. Proof uploads return `videoHash` and `videoReview`. Project reads include the current proof video URL and its review when available.

Errors return `{error}` in plain words that are safe to show on screen. Refusals from the contract also include `code`.

A write takes about 10 seconds. Show a loading state, and fetch the project again afterwards.

## AI video review

Set `GEMINI_API_KEY` on the backend or in the repository-root `.env`. `GEMINI_MODEL` defaults to `gemini-3.5-flash-lite`. Homeward sends eligible uploads to Google Gemini with the expected stage code and checklist. Use short MP4, MOV, or WebM clips up to 14 MB.

The submission is recorded on Stellar before the AI review starts. The review checks clarity, code visibility, and whether the work appears relevant. Provider errors, missing configuration, and larger uploads leave the proof available for the engineer. The existing approval and payout rules apply.

## Good to know

- `as` is the demo role switcher, not real sign-in.
- Only one stage can be active at a time. A rejected stage still counts until new proof passes.
- An approved handover shows as `submitted` with `holdUntil` (Unix seconds). Call `release` after that time.
- Money and status come from the contract. Names and photos come from `web/mock/projects.json`.
- Partial refunds while a build continues are not supported by the contract.
- Each home's security terms (deposit %, retention %, whether the deposit is posted up front, and the three time windows) come from the `security` block in `web/mock/projects.json`. They are fixed on chain when the build is set up. The demo windows are seconds; a launch would use days.
- The project view returns a `security` block: what the builder has posted and had held back, any open report, and whether the build ended. Sponsors also carry a fee `credit`.
- `/api/timeline` is built from the API's own actions until the indexer is ready. `/api/anchor/deposit` isn't built yet.

## Hosting (Railway)

The repo-root `Dockerfile` builds the API, and `railway.json` tells Railway to use it and check `/api/health`.

1. In Railway, create a project, choose **Deploy from GitHub repo**, and pick `homeward`.
2. Right-click the service, choose **Attach volume**, and mount it at `/data`. SQLite and videos live there, so they survive redeploys.
3. In **Variables**, open the **Raw Editor** and paste your local `.env`. Never commit it. Then add `WEB_ORIGIN=https://homeward-tan.vercel.app,http://localhost:3000`. Leave `PORT`, `DB_PATH` and `UPLOAD_DIR` out, because Railway and the Dockerfile set them (blank values are ignored).
4. In **Settings → Networking**, click **Generate Domain**. `https://<name>.up.railway.app/api/health` should return `{"ok":true,...}` with the contract ID you expect (`CC2NYVUT…` for the deposit contract). If it shows another ID, fix `CONTRACT_ID` in Variables.
5. In Vercel, set `NEXT_PUBLIC_API_URL` to that domain and redeploy. The variable is read at build time.
6. Open the app and press **Reset demo** once. That sets up the builds on chain for the new disk, and takes about a minute.
