"use server";

import { db } from "@/lib/db";
import { transactions, projects } from "@/lib/db/schema";
import { getServerSession } from "@/lib/get-session";
import { nanoid } from "nanoid";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireUserId() {
  const session = await getServerSession();
  if (!session) redirect("/login");
  return session.user.id;
}

export async function createTransaction(formData: FormData) {
  const userId = await requireUserId();

  const type = String(formData.get("type") || "keluar");
  const category = String(formData.get("category") || "lainnya");
  const amount = Number(formData.get("amount") || 0);
  const description = String(formData.get("description") || "").trim();
  const projectId = String(formData.get("projectId") || "") || null;
  const dateStr = String(formData.get("date") || "");

  if (!amount || amount <= 0) {
    throw new Error("Jumlah harus lebih dari 0");
  }

  await db.insert(transactions).values({
    id: nanoid(),
    userId,
    projectId,
    type,
    category,
    amount,
    description: description || null,
    date: dateStr ? new Date(dateStr) : new Date(),
  });

  const redirectTo = String(formData.get("redirectTo") || "/transaksi");
  revalidatePath("/transaksi");
  revalidatePath("/dashboard");
  if (projectId) revalidatePath(`/proyek/${projectId}`);
  redirect(redirectTo);
}

export async function deleteTransaction(id: string, redirectTo?: string) {
  const userId = await requireUserId();
  await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
  revalidatePath("/transaksi");
  revalidatePath("/dashboard");
  if (redirectTo) revalidatePath(redirectTo);
}

export async function getTransactions(filters?: {
  projectId?: string;
  type?: string;
}) {
  const userId = await requireUserId();

  const conditions = [eq(transactions.userId, userId)];
  if (filters?.projectId) {
    conditions.push(eq(transactions.projectId, filters.projectId));
  }
  if (filters?.type) {
    conditions.push(eq(transactions.type, filters.type));
  }

  const rows = await db
    .select({
      id: transactions.id,
      projectId: transactions.projectId,
      projectName: projects.name,
      type: transactions.type,
      category: transactions.category,
      amount: transactions.amount,
      description: transactions.description,
      date: transactions.date,
    })
    .from(transactions)
    .leftJoin(projects, eq(transactions.projectId, projects.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.date));

  return rows;
}

// Ringkasan cash flow keseluruhan (semua proyek + operasional umum)
export async function getCashFlowSummary() {
  const userId = await requireUserId();

  const rows = await db
    .select({
      type: transactions.type,
      total: sql<number>`sum(${transactions.amount})`,
    })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .groupBy(transactions.type);

  let totalMasuk = 0;
  let totalKeluar = 0;
  for (const r of rows) {
    if (r.type === "masuk") totalMasuk = r.total || 0;
    if (r.type === "keluar") totalKeluar = r.total || 0;
  }

  return {
    totalMasuk,
    totalKeluar,
    saldo: totalMasuk - totalKeluar,
  };
}

// Cash flow bulan berjalan
export async function getMonthlyCashFlow() {
  const userId = await requireUserId();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const rows = await db
    .select({
      type: transactions.type,
      total: sql<number>`sum(${transactions.amount})`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        sql`${transactions.date} >= ${startOfMonth}`
      )
    )
    .groupBy(transactions.type);

  let totalMasuk = 0;
  let totalKeluar = 0;
  for (const r of rows) {
    if (r.type === "masuk") totalMasuk = r.total || 0;
    if (r.type === "keluar") totalKeluar = r.total || 0;
  }

  return { totalMasuk, totalKeluar, profit: totalMasuk - totalKeluar };
}
