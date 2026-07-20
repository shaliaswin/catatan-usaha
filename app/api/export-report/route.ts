import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { getAllProjectsFinancials } from "@/lib/actions/projects";
import { getTransactions } from "@/lib/actions/transactions";
import { BUSINESS_TYPE_LABELS, STATUS_LABELS, formatDate } from "@/lib/utils";

function csvEscape(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toRow(values: (string | number)[]): string {
  return values.map(csvEscape).join(",") + "\r\n";
}

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  const [projectFinancials, transactions] = await Promise.all([
    getAllProjectsFinancials(),
    getTransactions(),
  ]);

  let csv = "";

  // Bagian 1: Ringkasan per proyek
  csv += toRow(["RINGKASAN UNTUNG/RUGI PER PROYEK"]);
  csv += toRow([
    "Nama Proyek",
    "Jenis Usaha",
    "Klien",
    "Status",
    "Nilai Kontrak",
    "Total Diterima",
    "Total Pengeluaran",
    "Profit",
  ]);
  for (const { project, totalMasuk, totalKeluar, profit } of projectFinancials) {
    csv += toRow([
      project.name,
      BUSINESS_TYPE_LABELS[project.businessType] || project.businessType,
      project.clientName,
      STATUS_LABELS[project.status] || project.status,
      project.contractValue,
      totalMasuk,
      totalKeluar,
      profit,
    ]);
  }

  csv += "\r\n";

  // Bagian 2: Semua transaksi
  csv += toRow(["SEMUA TRANSAKSI CASH FLOW"]);
  csv += toRow([
    "Tanggal",
    "Tipe",
    "Kategori",
    "Proyek",
    "Keterangan",
    "Jumlah",
  ]);
  for (const t of transactions) {
    csv += toRow([
      formatDate(t.date),
      t.type === "masuk" ? "Masuk" : "Keluar",
      t.category,
      t.projectName || "Operasional Umum",
      t.description || "",
      t.amount,
    ]);
  }

  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laporan-usaha-${today}.csv"`,
    },
  });
}
