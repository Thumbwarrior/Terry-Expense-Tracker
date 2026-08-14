import { createHmac, timingSafeEqual } from "crypto";
import { getPaystackSecretKey } from "@/lib/paystack/client";

export function verifyPaystackSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;

  const hash = createHmac("sha512", getPaystackSecretKey())
    .update(rawBody)
    .digest("hex");

  const hashBuffer = Buffer.from(hash, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (hashBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, signatureBuffer);
}

export type PaystackWebhookEvent = {
  event: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    metadata?: {
      userId?: string;
    };
  };
};
