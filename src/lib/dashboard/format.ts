import type { ExpenseCategoryValue } from "@/lib/validations/expense";

export type CategorySummary = {
  category: ExpenseCategoryValue;
  total: string;
  count: number;
};

export type DashboardSummary = {
  total: string;
  expenseCount: number;
  byCategory: CategorySummary[];
  period: {
    from: string;
    to: string;
  };
};

export function formatCategoryLabel(category: ExpenseCategoryValue) {
  return category.charAt(0) + category.slice(1).toLowerCase();
}

export function formatNaira(amount: string | number) {
  return `₦${Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export const CATEGORY_COLORS: Record<ExpenseCategoryValue, string> = {
  FOOD: "#10b981",
  TRANSPORT: "#3b82f6",
  UTILITIES: "#f59e0b",
  ENTERTAINMENT: "#ec4899",
  SHOPPING: "#8b5cf6",
  HEALTH: "#ef4444",
  EDUCATION: "#06b6d4",
  OTHER: "#71717a",
};
