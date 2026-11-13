import { createHash, randomInt } from "node:crypto";

export const newStageCode = () => `HW-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`;

/** 32 bytes, ready for a BytesN<32> argument. */
export const sha256 = (data: Buffer | string) => createHash("sha256").update(data).digest();
