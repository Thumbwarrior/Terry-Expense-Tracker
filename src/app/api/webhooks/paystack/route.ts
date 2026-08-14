import { NextResponse } from "next/server";
import { paystackConfigured } from "@/lib/paystack/client";
import {
  verifyPaystackSignature,
  type PaystackWebhookEvent,
} from "@/lib/paystack/webhook";
import { completeWalletTopUp } from "@/lib/wallet/credit";

export async function POST(request: Request) {
  if (!paystackConfigured()) {
    return NextResponse.json({ error: "Paystack not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: PaystackWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PaystackWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    try {
      await completeWalletTopUp(event.data.reference);
    } catch (error) {
      console.error("[paystack webhook]", error);
    }
  }

  return NextResponse.json({ received: true });
}
