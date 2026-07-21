import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Lokal (development di laptop): cukup pakai file lokal, tidak perlu isi
// TURSO_DATABASE_URL/TURSO_AUTH_TOKEN.
// Production/HP: isi TURSO_DATABASE_URL & TURSO_AUTH_TOKEN di .env (lihat README)
// supaya data tersimpan di cloud dan bisa diakses dari mana saja.
const url =
  process.env.TURSO_DATABASE_URL ||
  `file:${process.env.DATABASE_PATH || "./sqlite.db"}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
