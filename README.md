# Homeward

**Pay for your parents' house from abroad, one checked stage at a time.**

Families abroad send money home to build or fix a house for their parents, then can't see what happens to it. Homeward locks the money in a Soroban smart contract on Stellar and releases it stage by stage:

1. Family members abroad fund the build, with every fee shown up front.
2. When a stage opens, the supplier is paid for materials first.
3. The builder sends proof with a one-time stage code.
4. An independent engineer checks the work before concrete covers it. The contract refuses anyone with a stake in the project as the engineer.
5. The parent approves, or asks for a second check. A second check blocks payment until a second engineer rules.
6. One approval pays the builder and labour in a single transaction and records a stage certificate.
7. If the build stops, unspent money goes back to each family member by what they paid in.

Built for the Blockchain Innovation Challenge powered by Stellar (UWaterloo Velocity, Nov 2026), Problem 3: Cross-Border Remittances.

## Links

- Live app: https://homeward-ecru.vercel.app
- 60-second demo video: [docs/showcase/video/homeward-demo-v2.mp4](docs/showcase/video/homeward-demo-v2.mp4) ([the 12 Testnet transactions in it](docs/showcase/video/README.md))
- One-pager: [docs/homeward-one-pager-v1.pdf](docs/homeward-one-pager-v1.pdf) · Demo limits: [docs/technical-limits.md](docs/technical-limits.md)
- Contract on Stellar Testnet: `CC2NYVUTHJWBRTDG7J4O6VB7TINL5MTNOTTXOMVMHKSCUYZR4W3M6QF2`
  ([Stellar Expert](https://stellar.expert/explorer/testnet/contract/CC2NYVUTHJWBRTDG7J4O6VB7TINL5MTNOTTXOMVMHKSCUYZR4W3M6QF2))
- First version of the contract, before the builder's deposit: `CC2T4LZMG2UX7TCYX63MSCWSRYZO3XWNP3IACH47WQVM7NSI7XZP3JNO`
  ([Stellar Expert](https://stellar.expert/explorer/testnet/contract/CC2T4LZMG2UX7TCYX63MSCWSRYZO3XWNP3IACH47WQVM7NSI7XZP3JNO))

## What's real and what's simulated

**Real on Stellar Testnet:** creating a project, funding, opening stages, supplier payment, proof hashes, engineer and parent approvals, the second check, split payouts, certificates, the builder's deposit and held-back payments, reporting a builder who stopped, freezing and refunds. `scripts/demo.sh` runs the whole story on Testnet, and `scripts/security.sh` runs the deposit paths.

**Simulated:** Interac and UAE bank transfers, rupee payouts, SMS, KYC, engineer licences, site photos and the site camera. The web app runs on demo data in the browser and is being connected to the backend API.

## Repo layout

| Folder | What it is |
|---|---|
| `contracts/homeward` | Soroban contract (Rust) and its tests |
| `scripts` | Testnet account setup and the end-to-end demo |
| `backend` | API the web app calls; signs on the server so keys never reach the browser |
| `web` | Next.js app: family, builder, engineer and parent screens |

## Run it

**Web app** (Node 20+):

```bash
cd web
npm install
npm run dev     # http://localhost:3000
npm test        # logic tests
```

**Contract** (Rust 1.84+, Stellar CLI):

```bash
cd contracts/homeward
cargo test
stellar contract build
```

**Testnet demo:** copy `.env.example` to `.env` in the repo root, fill in your own Testnet keys, then:

```bash
./scripts/demo.sh
```

Never commit a real `.env`.

## Team

Ved Agwekar (technical lead, backend, presenter), Youdis (contract and backend), Krish Singh (web app, Devpost, video), Rivan (product, research, pitch).
