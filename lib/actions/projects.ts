"use server";

import { db } from "@/lib/db";
import { projects, transactions } from "@/lib/db/schema";
import { getServerSession } from "@/lib/get-session";
import { nanoid } from "nanoid";
import { eq, and, sql, desc } from "drizzle-orm";
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
  const clientName = String(formData.get("clientName") || "").trim();
  const clientPhone = String(formData.get("clientPhone") || "").trim();
  const businessType = String(formData.get("businessType") || "lainnya");
  const contractValue = Number(formData.get("contractValue") || 0);
  const location = String(formData.get("location") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const startDateStr = String(formData.get("startDate") || "");

  if (!name || !clientName) {
    throw new Error("Nama proyek dan nama klien wajib diisi");
  }

  await db.insert(projects).values({
    id: nanoid(),
    userId,
    name,
    clientName,
    clientPhone: clientPhone || null,
    businessType,
    contractValue,
    location: location || null,
    notes: notes || null,
    startDate: startDateStr ? new Date(startDateStr) : null,
    status: "berjalan",
    stage: "survei",
  });

  revalidatePath("/proyek");
  revalidatePath("/kanban");
  redirect("/proyek");
}

// Pindahkan proyek ke tahap kanban lain. Kalau dipindah ke "selesai",
// status proyek otomatis ikut jadi "selesai"; kalau dipindah keluar dari
// "selesai", status otomatis kembali jadi "berjalan".
export async function updateProjectStage(projectId: string, stage: string) {
  const userId = await requireUserId();

  const [current] = await db
    .select({ status: projects.status })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

  const nextStatus =
    stage === "selesai"
      ? "selesai"
      : current?.status === "selesai"
        ? "berjalan"
        : current?.status;

  await db
    .update(projects)
    .set({ stage, status: nextStatus, updatedAt: new Date() })
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

  revalidatePath("/kanban");
  revalidatePath("/proyek");
  revalidatePath(`/proyek/${projectId}`);
}

// Semua proyek yang belum batal, untuk ditampilkan di papan Kanban
export async function getKanbanProjects() {
  const userId = await requireUserId();
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.userId, userId), sql`${projects.status} != 'batal'`))
    .orderBy(desc(projects.createdAt));
  return rows;
}

export async function updateProjectStatus(projectId: string, status: string) {
  const userId = await requireUserId();
  await db
    .update(projects)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
  revalidatePath(`/proyek/${projectId}`);
  revalidatePath("/proyek");
}

export async function deleteProject(projectId: string) {
  const userId = await requireUserId();
  await db
    .delete(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
  revalidatePath("/proyek");
  redirect("/proyek");
}

export async function getProjects() {
  const userId = await requireUserId();
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));
  return rows;
}

export async function getProjectById(id: string) {
  const userId = await requireUserId();
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)));
  return rows[0] || null;
}

// Ringkasan untung/rugi per proyek: total masuk, total keluar, profit
export async function getProjectFinancials(projectId: string) {
  const userId = await requireUserId();

  const rows = await db
    .select({
      type: transactions.type,
      total: sql<number>`sum(${transactions.amount})`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.projectId, projectId),
        eq(transactions.userId, userId)
      )
    )
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
    profit: totalMasuk - totalKeluar,
  };
}

// Dashboard: semua proyek + profit masing-masing, plus total keseluruhan
export async function getAllProjectsFinancials() {
  const userId = await requireUserId();

  const allProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));

  const results = [];
  for (const p of allProjects) {
    const fin = await getProjectFinancials(p.id);
    results.push({ project: p, ...fin });
  }
  return results;
}
