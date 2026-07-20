// Memindai foto struk/kwitansi dan mengekstrak: tanggal, tipe (masuk/keluar),
// kategori, jumlah, dan deskripsi singkat — supaya user tidak perlu ketik manual.
// Mendukung dua provider: OpenAI (GPT-4o mini) dan Gemini. Pilih lewat env AI_PROVIDER.

export type ReceiptScanResult = {
  date: string | null; // format YYYY-MM-DD
  type: "masuk" | "keluar";
  category: string;
  amount: number;
  description: string;
  confidence: "tinggi" | "sedang" | "rendah";
  rawNote?: string; // catatan AI kalau ada bagian yang tidak yakin
};

const EXPENSE_CATEGORIES = [
  "material",
  "tenaga_kerja",
  "transport",
  "sewa_alat",
  "operasional",
  "lainnya",
];
const INCOME_CATEGORIES = ["dp", "termin", "pelunasan", "lainnya"];

const SYSTEM_PROMPT = `Kamu adalah asisten pembukuan untuk usaha kontraktor (landscape, pagar, kanopi, folding gate, potong rumput) dan wedding organizer di Indonesia.
Tugasmu: baca foto struk/nota/kwitansi yang diberikan, lalu ekstrak informasi transaksinya.

Balas HANYA dengan JSON valid, tanpa markdown, tanpa penjelasan tambahan, dengan format persis seperti ini:
{
  "date": "YYYY-MM-DD atau null jika tidak terbaca",
  "type": "masuk" atau "keluar",
  "category": salah satu dari daftar kategori berikut sesuai type,
  "amount": nominal_dalam_rupiah_sebagai_angka_tanpa_titik_atau_koma,
  "description": "ringkasan singkat max 8 kata, contoh: Semen 10 sak toko bangunan",
  "confidence": "tinggi" atau "sedang" atau "rendah",
  "rawNote": "catatan singkat jika ada bagian yang kurang jelas, atau string kosong"
}

Kategori untuk type "keluar" (paling umum untuk struk/nota belanja): material, tenaga_kerja, transport, sewa_alat, operasional, lainnya
Kategori untuk type "masuk" (kwitansi terima uang dari klien): dp, termin, pelunasan, lainnya

Kalau gambar bukan struk/kwitansi/nota, atau tidak terbaca sama sekali, isi amount: 0 dan confidence: "rendah".
Selalu asumsikan type "keluar" kecuali jelas terlihat ini kwitansi tanda terima uang dari klien.`;

function extractJson(text: string): any {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("AI tidak mengembalikan JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function normalizeResult(raw: any): ReceiptScanResult {
  const type = raw.type === "masuk" ? "masuk" : "keluar";
  const allowedCategories = type === "masuk" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const category = allowedCategories.includes(raw.category)
    ? raw.category
    : "lainnya";

  return {
    date: typeof raw.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.date) ? raw.date : null,
    type,
    category,
    amount: Number(raw.amount) || 0,
    description: String(raw.description || "").slice(0, 100),
    confidence: ["tinggi", "sedang", "rendah"].includes(raw.confidence)
      ? raw.confidence
      : "rendah",
    rawNote: raw.rawNote ? String(raw.rawNote) : undefined,
  };
}

async function scanWithOpenAI(
  base64Image: string,
  mimeType: string
): Promise<ReceiptScanResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY belum diatur di .env");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Baca struk/kwitansi ini." },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 400,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI tidak mengembalikan hasil");
  return normalizeResult(extractJson(text));
}

async function scanWithGemini(
  base64Image: string,
  mimeType: string
): Promise<ReceiptScanResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY belum diatur di .env");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT + "\n\nBaca struk/kwitansi ini." },
              {
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: { temperature: 0, maxOutputTokens: 400 },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini tidak mengembalikan hasil");
  return normalizeResult(extractJson(text));
}

export async function scanReceiptImage(
  base64Image: string,
  mimeType: string
): Promise<ReceiptScanResult> {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();

  if (provider === "gemini") {
    return scanWithGemini(base64Image, mimeType);
  }
  return scanWithOpenAI(base64Image, mimeType);
}
