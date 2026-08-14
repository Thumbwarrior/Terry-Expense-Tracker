import { z } from "zod";

export const EXPENSE_CATEGORIES = [
  "FOOD",
  "TRANSPORT",
  "UTILITIES",
  "ENTERTAINMENT",
  "SHOPPING",
  "HEALTH",
  "EDUCATION",
  "OTHER",
] as const;

export type ExpenseCategoryValue = (typeof EXPENSE_CATEGORIES)[number];

const categorySchema = z.enum(EXPENSE_CATEGORIES);

const amountSchema = z
  .number({ error: "Amount must be a number" })
  .positive("Amount must be greater than zero")
  .max(999_999_999.99, "Amount is too large")
  .refine(
    (value) => Math.round(value * 100) / 100 === value,
    "Amount can have at most 2 decimal places"
  );

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date");

export const createExpenseSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100),
  amount: amountSchema,
  category: categorySchema,
  date: dateSchema,
  description: z.string().trim().max(500).optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
