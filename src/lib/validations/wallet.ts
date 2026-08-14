import { z } from "zod";

export const fundWalletSchema = z.object({
  amount: z
    .number({ error: "Amount must be a number" })
    .min(100, "Minimum top-up is ₦100")
    .max(1_000_000, "Maximum top-up is ₦1,000,000")
    .refine(
      (value) => Math.round(value * 100) / 100 === value,
      "Amount can have at most 2 decimal places"
    ),
});

export const verifyWalletSchema = z.object({
  reference: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9=.\-_]+$/, "Invalid payment reference"),
});

export type FundWalletInput = z.infer<typeof fundWalletSchema>;
