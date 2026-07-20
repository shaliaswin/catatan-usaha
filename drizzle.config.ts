import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts", // sesuaikan path schema Anda
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});