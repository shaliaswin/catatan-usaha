import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { scanReceiptImage } from "@/lib/ai/scan-receipt";

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { imageBase64, mimeType } = body as {
      imageBase64?: string;
      mimeType?: string;
    };

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "Gambar tidak ditemukan" },
        { status: 400 }
      );
    }

    if (imageBase64.length * 0.75 > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Ukuran foto terlalu besar (maks 8MB)" },
        { status: 400 }
      );
    }

    const result = await scanReceiptImage(imageBase64, mimeType);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Scan receipt error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memindai struk" },
      { status: 500 }
    );
  }
}
