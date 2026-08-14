import { NextResponse } from "next/server";
import { getSessionPayload } from "@/lib/auth/session";
import { completeWalletTopUp } from "@/lib/wallet/credit";
import { verifyWalletSchema } from "@/lib/validations/wallet";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifyWalletSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const session = await getSessionPayload();
    const result = await completeWalletTopUp(
      parsed.data.reference,
      session?.userId
    );

    if (!result.ok) {
      const messages: Record<typeof result.reason, string> = {
        not_found: "Payment reference not found",
        not_owned: "This payment does not belong to your account",
        failed: "Payment was not successful",
        invalid_amount: "Payment amount mismatch",
      };

      return NextResponse.json(
        { error: messages[result.reason] },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      alreadyProcessed: result.alreadyProcessed,
      amount: result.amount,
    });
  } catch (error) {
    console.error("[wallet verify]", error);
    return NextResponse.json(
      { error: "Something went wrong while verifying the payment" },
      { status: 500 }
    );
  }
}
