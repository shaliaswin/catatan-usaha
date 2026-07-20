export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | number | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "number" ? new Date(date * 1000) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export const BUSINESS_TYPE_LABELS: Record<string, string> = {
  landscape: "Landscape",
  pagar_brc: "Pagar BRC",
  pagar_seng: "Pagar Seng",
  kanopi: "Kanopi",
  folding_gate: "Folding Gate",
  potong_rumput: "Potong Rumput",
  wedding_organizer: "Wedding Organizer",
  lainnya: "Lainnya",
};

export const INCOME_CATEGORY_LABELS: Record<string, string> = {
  dp: "DP (Uang Muka)",
  termin: "Termin",
  pelunasan: "Pelunasan",
  lainnya: "Lainnya",
};

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  material: "Material",
  tenaga_kerja: "Tenaga Kerja / Tukang",
  transport: "Transport",
  sewa_alat: "Sewa Alat",
  operasional: "Operasional Umum",
  lainnya: "Lainnya",
};

export const STATUS_LABELS: Record<string, string> = {
  berjalan: "Berjalan",
  selesai: "Selesai",
  batal: "Batal",
};

export const STAGE_LABELS: Record<string, string> = {
  survei: "Survei",
  penawaran: "Penawaran",
  rab: "RAB",
  belanja_mulai: "Belanja & Mulai Kerja",
  tagihan: "Tagihan / Termin",
  monitoring_pencairan: "Monitoring Pencairan",
  selesai: "Selesai",
};

export const STAGE_ORDER = [
  "survei",
  "penawaran",
  "rab",
  "belanja_mulai",
  "tagihan",
  "monitoring_pencairan",
  "selesai",
];

export const STAGE_COLORS: Record<string, string> = {
  survei: "border-t-slate-400",
  penawaran: "border-t-amber-400",
  rab: "border-t-orange-400",
  belanja_mulai: "border-t-blue-400",
  tagihan: "border-t-purple-400",
  monitoring_pencairan: "border-t-cyan-400",
  selesai: "border-t-green-500",
};

export function statusColor(status: string): string {
  switch (status) {
    case "berjalan":
      return "bg-blue-100 text-blue-700";
    case "selesai":
      return "bg-green-100 text-green-700";
    case "batal":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
