import type { Config } from "drizzle-kit";
import "dotenv/config";

const url =
  process.env.TURSO_DATABASE_URL ||
  `file:${process.env.DATABASE_PATH || "./sqlite.db"}`;

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
