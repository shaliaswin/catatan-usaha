"use server";

import { db } from "@/lib/db";
import { projects, invoices, transactions } from "@/lib/db/schema";
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

export async function createProject(formData: FormData) {
  const userId = await requireUserId();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const status = String(formData.get("status") || "berjalan");

  if (!name) {
    throw new Error("Nama proyek wajib diisi");
  }

  await db.insert(projects).values({
    id: nanoid(),
    userId,
    name,
    status,
  });

  revalidatePath("/proyek");
  revalidatePath("/dashboard");
  redirect("/proyek");
}

export async function getProjects() {
  const userId = await requireUserId();
  return await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));
}

export async function getAllProjectsFinancials() {
  const userId = await requireUserId();

  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId));

  if (!userProjects || userProjects.length === 0) {
    return [];
  }

  const result = await Promise.all(
    userProjects.map(async (project) => {
      // Hitung total invoice proyek
      const invoiceRows = await db
        .select({
          total: sql<number>`sum(${invoices.amount})`,
        })
        .from(invoices)
        .where(
          and(eq(invoices.projectId, project.id), eq(invoices.userId, userId))
        );

      // Hitung transaksi pengeluaran/pemasukan proyek
      const txRows = await db
        .select({
          type: transactions.type,
          total: sql<number>`sum(${transactions.amount})`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.projectId, project.id),
            eq(transactions.userId, userId)
          )
        )
        .groupBy(transactions.type);

      const totalInvoice = Number(invoiceRows[0]?.total) || 0;

      let totalMasuk = 0;
      let totalKeluar = 0;
      for (const t of txRows) {
        if (t.type === "masuk") totalMasuk = Number(t.total) || 0;
        if (t.type === "keluar") totalKeluar = Number(t.total) || 0;
      }

      return {
        project,
        totalInvoice,
        totalMasuk,
        totalKeluar,
        profit: totalMasuk - totalKeluar,
      };
    })
  );

  return result;
}