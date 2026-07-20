"use server";

import { db } from "@/lib/db";
import { invoices, projects } from "@/lib/db/schema";
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

async function nextInvoiceNumber(userId: string) {
  const now = new Date();
  const prefix = `INV/${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const countRow = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices)
    .where(
      and(
        eq(invoices.userId, userId),
        sql`${invoices.invoiceNumber} like ${prefix + "%"}`
      )
    );
  const count = (countRow[0]?.count || 0) + 1;
  return `${prefix}/${String(count).padStart(3, "0")}`;
}

export async function createInvoice(formData: FormData) {
  const userId = await requireUserId();

  const projectId = String(formData.get("projectId") || "");
  const dpAmount = Number(formData.get("dpAmount") || 0);
  const dueDateStr = String(formData.get("dueDate") || "");
  const notes = String(formData.get("notes") || "").trim();
  const terminPercentRaw = formData.get("terminPercent");
  const terminPercent = terminPercentRaw ? Number(terminPercentRaw) : null;

  const descs = formData.getAll("itemDesc") as string[];
  const qtys = formData.getAll("itemQty") as string[];
  const prices = formData.getAll("itemPrice") as string[];

  const items = descs
    .map((desc, i) => ({
      desc: desc.trim(),
      qty: Number(qtys[i] || 1),
      price: Number(prices[i] || 0),
    }))
    .filter((it) => it.desc);

  if (!projectId || items.length === 0) {
    throw new Error("Proyek dan minimal 1 item wajib diisi");
  }

  const invoiceNumber = await nextInvoiceNumber(userId);

  const [created] = await db
    .insert(invoices)
    .values({
      id: nanoid(),
      userId,
      projectId,
      invoiceNumber,
      itemsJson: JSON.stringify(items),
      dpAmount,
      terminPercent,
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
      notes: notes || null,
      status: "draft",
    })
    .returning();

  revalidatePath("/invoice");
  redirect(`/invoice/${created.id}`);
}

export async function updateInvoiceStatus(id: string, status: string) {
  const userId = await requireUserId();
  await db
    .update(invoices)
    .set({ status })
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
  revalidatePath(`/invoice/${id}`);
}

export async function getInvoiceById(id: string) {
  const userId = await requireUserId();
  const rows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      itemsJson: invoices.itemsJson,
      dpAmount: invoices.dpAmount,
      terminPercent: invoices.terminPercent,
      status: invoices.status,
      issuedDate: invoices.issuedDate,
      dueDate: invoices.dueDate,
      notes: invoices.notes,
      projectId: invoices.projectId,
      projectName: projects.name,
      clientName: projects.clientName,
      clientPhone: projects.clientPhone,
      location: projects.location,
    })
    .from(invoices)
    .leftJoin(projects, eq(invoices.projectId, projects.id))
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

  const row = rows[0];
  if (!row) return null;
  return {
    ...row,
    items: JSON.parse(row.itemsJson) as {
      desc: string;
      qty: number;
      price: number;
    }[],
  };
}

export async function getInvoices() {
  const userId = await requireUserId();
  const rows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      issuedDate: invoices.issuedDate,
      dueDate: invoices.dueDate,
      dpAmount: invoices.dpAmount,
      itemsJson: invoices.itemsJson,
      projectName: projects.name,
      clientName: projects.clientName,
    })
    .from(invoices)
    .leftJoin(projects, eq(invoices.projectId, projects.id))
    .where(eq(invoices.userId, userId))
    .orderBy(desc(invoices.issuedDate));

  return rows.map((r) => {
    const items = JSON.parse(r.itemsJson) as {
      qty: number;
      price: number;
    }[];
    const total = items.reduce((sum, it) => sum + it.qty * it.price, 0);
    return { ...r, total };
  });
}
