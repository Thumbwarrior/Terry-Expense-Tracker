import type { User } from "@/generated/prisma/client";

export function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    balance: user.balance.toString(),
    createdAt: user.createdAt.toISOString(),
  };
}
