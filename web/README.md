# Homeward web

```sh
npm install
npm run dev
npm test
```

Open http://localhost:3000. Screens use `mock/projects.json` until `NEXT_PUBLIC_API_URL` is set.

The funding page fetches a live INR-to-USDC estimate through the Next.js server. Set `COINGECKO_DEMO_API_KEY` in `web/.env.local` or the web host's environment for CoinGecko Demo API access. The estimate uses the market price, and testnet funding uses the contract's fixed demo rate.

For real proof uploads and AI review, connect the backend with `NEXT_PUBLIC_API_URL` and configure Gemini on the backend.
