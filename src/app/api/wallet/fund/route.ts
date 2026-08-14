import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthError, requireAuth } from "@/lib/auth/require-auth";
import {
  getAppUrl,
  getPaystackPublicKey,
  initializePaystackTransaction,
  paystackConfigured,
} from "@/lib/paystack/client";
import { createWalletReference } from "@/lib/wallet/credit";
import { fundWalletSchema } from "@/lib/validations/wallet";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const limit = rateLimit(`wallet-fund:${auth.userId}`, 10, 60 * 60 * 1000);
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSeconds);
  }

  if (!paystackConfigured()) {
    return NextResponse.json(
      {
        error:
          "Paystack is not configured. Set PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY.",
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const parsed = fundWalletSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: auth.userId } });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = parsed.data;
    const amountKobo = Math.round(amount * 100);
    const reference = createWalletReference(auth.userId);

    await prisma.walletTransaction.create({
      data: {
        userId: auth.userId,
        reference,
        amount,
        amountKobo,
      },
    });

    const callbackUrl = `${getAppUrl()}/wallet/callback`;
    const paystack = await initializePaystackTransaction({
      email: user.email,
      amountKobo,
      reference,
      callbackUrl,
      metadata: {
        userId: auth.userId,
        purpose: "wallet_top_up",
      },
    });

    if (!paystack.status || !paystack.data?.authorization_url) {
      await prisma.walletTransaction.updateMany({
        where: { reference },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        { error: paystack.message ?? "Could not initialize Paystack payment" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorizationUrl: paystack.data.authorization_url,
      reference,
      publicKey: getPaystackPublicKey(),
    });
  } catch (error) {
    console.error("[wallet fund]", error);
    return NextResponse.json(
      { error: "Something went wrong while starting the payment" },
      { status: 500 }
    );
  }
}
