import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/* ---------------------------------------------------------
   AUTH TABLES (dipakai oleh Better Auth — jangan diubah strukturnya)
--------------------------------------------------------- */
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

/* ---------------------------------------------------------
   BUSINESS TABLES
--------------------------------------------------------- */

// Jenis lini usaha — sesuai usaha kamu. Bisa ditambah dari UI kalau perlu.
export const BUSINESS_TYPES = [
  "landscape",
  "pagar_brc",
  "pagar_seng",
  "kanopi",
  "folding_gate",
  "potong_rumput",
  "wedding_organizer",
  "lainnya",
] as const;

// Tahapan alur kerja proyek — dipakai untuk tampilan Kanban.
// Urutan array ini menentukan urutan kolom kanban dari kiri ke kanan.
export const PROJECT_STAGES = [
  "survei",
  "penawaran",
  "rab",
  "belanja_mulai",
  "tagihan",
  "monitoring_pencairan",
  "selesai",
] as const;

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // contoh: "Pagar BRC - Bpk. Andi"
  clientName: text("clientName").notNull(),
  clientPhone: text("clientPhone"),
  businessType: text("businessType").notNull(), // salah satu dari BUSINESS_TYPES
  contractValue: real("contractValue").notNull().default(0), // nilai kontrak/kesepakatan ke klien
  status: text("status").notNull().default("berjalan"), // berjalan | selesai | batal
  stage: text("stage").notNull().default("survei"), // salah satu dari PROJECT_STAGES — posisi di kanban
  location: text("location"),
  startDate: integer("startDate", { mode: "timestamp" }),
  targetDate: integer("targetDate", { mode: "timestamp" }),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Semua uang masuk & keluar. project_id NULL = biaya/pemasukan operasional umum
// (bukan milik proyek tertentu — misal beli bensin motor, gaji admin, dll)
export const TRANSACTION_TYPES = ["masuk", "keluar"] as const;

export const INCOME_CATEGORIES = [
  "dp",
  "termin",
  "pelunasan",
  "lainnya",
] as const;

export const EXPENSE_CATEGORIES = [
  "material",
  "tenaga_kerja",
  "transport",
  "sewa_alat",
  "operasional",
  "lainnya",
] as const;

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  projectId: text("projectId").references(() => projects.id, {
    onDelete: "set null",
  }), // nullable: biaya/pemasukan umum non-proyek
  type: text("type").notNull(), // masuk | keluar
  category: text("category").notNull(),
  amount: real("amount").notNull(),
  description: text("description"),
  date: integer("date", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  projectId: text("projectId")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  invoiceNumber: text("invoiceNumber").notNull(),
  itemsJson: text("itemsJson").notNull(), // JSON string: [{desc, qty, price}]
  dpAmount: real("dpAmount").notNull().default(0),
  terminPercent: real("terminPercent"), // diisi kalau invoice dibuat berdasarkan % progres pekerjaan
  status: text("status").notNull().default("draft"), // draft | terkirim | lunas
  issuedDate: integer("issuedDate", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  dueDate: integer("dueDate", { mode: "timestamp" }),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
