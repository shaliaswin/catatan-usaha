import type { Config } from "drizzle-kit";
import "dotenv/config";

const url =
  process.env.TURSO_DATABASE_URL ||
  `file:${process.env.DATABASE_PATH || "./sqlite.db"}`;

// Ensure dialect is 'postgresql', not 'sqlite' or 'turso'
export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});