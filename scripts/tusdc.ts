
import {
  Asset, BASE_FEE, Horizon, Keypair,
  Networks, Operation, TransactionBuilder,
} from "@stellar/stellar-sdk";
import { config } from "dotenv";
import { readFileSync } from "node:fs";

config({ path: ".env", quiet: true });

const addresses: Record<string, string> = JSON.parse(
  readFileSync("scripts/accounts.json", "utf8")
);

const roles = [
  "admin", "sponsor1", "sponsor2", "parent",
  "inspector1", "inspector2", "builder",
  "supplier", "labour", "platform",
];

const server = new Horizon.Server(
  "https://horizon-testnet.stellar.org"
);

function getKeypair(role: string): Keypair {
  const secret = process.env[`${role.toUpperCase()}_SECRET`];
  if (!secret) throw new Error(`Missing secret for ${role}`);

  const kp = Keypair.fromSecret(secret);
  if (kp.publicKey() !== addresses[role]) {
    throw new Error(`Key mismatch for ${role}`);
  }
  return kp;
}

const issuer = getKeypair("issuer");
const asset = new Asset("TUSDC", issuer.publicKey());

async function submit(kp: Keypair, operation: any) {
  const account = await server.loadAccount(kp.publicKey());

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(operation)
    .setTimeout(180)
    .build();

  tx.sign(kp);
  return server.submitTransaction(tx);
}

function tokenBalance(account: any): string | undefined {
  return account.balances.find(
    (b: any) =>
      b.asset_code === "TUSDC" &&
      b.asset_issuer === issuer.publicKey()
  )?.balance;
}

async function main() {
  // Step 1: Establish trustlines for all non-issuer accounts.
  for (const role of roles) {
    const kp = getKeypair(role);
    const account = await server.loadAccount(kp.publicKey());

    if (tokenBalance(account) !== undefined) {
      console.log(`${role}: trustline already exists`);
      continue;
    }

    await submit(kp, Operation.changeTrust({
      asset,
      limit: "1000000",
    }));

    console.log(`${role}: trustline created`);
  }

  // Step 2: Check before issuing tokens.
  const s1 = await server.loadAccount(addresses.sponsor1);
  const s2 = await server.loadAccount(addresses.sponsor2);

  if (
    Number(tokenBalance(s1)) !== 0 ||
    Number(tokenBalance(s2)) !== 0
  ) {
    throw new Error(
      "Sponsor TUSDC balances are nonzero. Review before issuing more."
    );
  }

  // Step 3: Issue 50,000 TUSDC to each sponsor atomically.
  const account = await server.loadAccount(issuer.publicKey());

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.payment({
      destination: addresses.sponsor1,
      asset,
      amount: "50000",
    }))
    .addOperation(Operation.payment({
      destination: addresses.sponsor2,
      asset,
      amount: "50000",
    }))
    .setTimeout(180)
    .build();

  tx.sign(issuer);
  const result = await server.submitTransaction(tx);

  console.log("TUSDC issued successfully!");
  console.log("Issuer:", issuer.publicKey());
  console.log("Transaction:", result.hash);
}

main().catch((err) => {
  console.error("TUSDC setup failed:", err);
  process.exitCode = 1;
});
