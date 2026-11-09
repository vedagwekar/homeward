
import { Keypair, rpc } from "@stellar/stellar-sdk";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const roles = [
  "issuer", "admin", "sponsor1", "sponsor2", "parent",
  "inspector1", "inspector2", "builder", "supplier",
  "labour", "platform",
];

const envPath = ".env";
const publicPath = "scripts/accounts.json";

async function main() {
  const hasSecrets = existsSync(envPath);
  const hasPublic = existsSync(publicPath);

  if (hasSecrets !== hasPublic) {
    throw new Error("Missing an account file. Refusing to replace keys.");
  }

  let publicKeys: Record<string, string>;

  if (hasSecrets && hasPublic) {
    publicKeys = JSON.parse(readFileSync(publicPath, "utf8"));

    for (const role of roles) {
      if (!publicKeys[role]) {
        throw new Error(`Missing public address for ${role}`);
      }
    }

    console.log("Reusing existing 11 keypairs.");
  } else {
    publicKeys = {};
    const secrets = ["# Homeward TESTNET secrets"];

    for (const role of roles) {
      const kp = Keypair.random();
      publicKeys[role] = kp.publicKey();
      secrets.push(`${role.toUpperCase()}_SECRET=${kp.secret()}`);
    }

    writeFileSync(envPath, secrets.join("\n") + "\n", {
      flag: "wx",
      mode: 0o600,
    });

    writeFileSync(publicPath, JSON.stringify(publicKeys, null, 2) + "\n", {
      flag: "wx",
    });
  }

  const server = new rpc.Server("https://soroban-testnet.stellar.org");

  for (const role of roles) {
    const address = publicKeys[role];

    try {
      await server.getAccount(address);
      console.log(`${role}: already active`);
      continue;
    } catch {
      // Account may not exist yet; ask Friendbot to create it.
    }

    const tx = await server.fundAddress(address);
    console.log(`${role}: funded (${tx.txHash})`);
  }

  console.log("All 11 accounts are active on testnet.");
}

main().catch((error) => {
  console.error("Account setup failed:", error);
  process.exitCode = 1;
});
