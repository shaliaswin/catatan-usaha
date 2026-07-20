import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db"; // sesuaikan path db Anda
import * as schema from "@/lib/db/schema"; // sesuaikan path schema Anda

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // HARUS "pg" (PostgreSQL), bukan "sqlite"
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
});