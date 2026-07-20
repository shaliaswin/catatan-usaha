// GANTI DARI: import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
// MENJADI:
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

// Pastikan pembuatan tabel menggunakan pgTable, contoh:
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});