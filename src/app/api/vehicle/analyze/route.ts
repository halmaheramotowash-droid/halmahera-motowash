import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getCurrentUser } from "@/lib/current-user";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const allowedCategories = [
  "Motor Kecil",
  "Motor Sedang",
  "Motor Besar",
  "Mobil Kecil",
  "Mobil Besar",
] as const;

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Silakan login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY belum tersedia.");

      return NextResponse.json(
        {
          success: false,
          error: "Konfigurasi AI belum tersedia di server.",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Foto kendaraan wajib dikirim.",
        },
        { status: 400 }
      );
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          error: "File harus berupa gambar.",
        },
        { status: 400 }
      );
    }

    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const base64Image = imageBuffer.toString("base64");
    const dataUrl = `data:${image.type};base64,${base64Image}`;

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Analisis foto kendaraan untuk aplikasi kasir cuci kendaraan.

Tugas:
1. Tentukan tipe kendaraan: MOTOR atau MOBIL.
2. Identifikasi merek jika terlihat jelas.
3. Identifikasi model kendaraan jika memungkinkan.
4. Pilih tepat satu kategori dari daftar berikut jika kondisi kendaraan cukup terlihat:
   - Motor Kecil
   - Motor Sedang
   - Motor Besar
   - Mobil Kecil
   - Mobil Besar

Panduan kategori:
- Motor Kecil: motor kecil/matic kecil atau bebek kecil.
- Motor Sedang: motor harian ukuran sedang seperti skuter atau motor sport umum.
- Motor Besar: motor berukuran besar, premium, touring, atau mesin besar.
- Mobil Kecil: city car, hatchback kecil, atau mobil kecil.
- Mobil Besar: SUV, MPV besar, pickup, van, atau mobil berukuran besar.

Jangan mengarang model. Jika model tidak cukup jelas, gunakan null.
Kategori adalah rekomendasi awal dan operator tetap dapat mengubahnya.

Jawab HANYA JSON valid dengan format:
{
  "vehicleType": "MOTOR atau MOBIL",
  "brand": "nama merek atau null",
  "model": "nama model atau null",
  "category": "salah satu kategori di atas atau null",
  "confidence": 0
}

confidence adalah angka 0 sampai 100.
      `.trim(),
            },
            {
              type: "input_image",
              image_url: dataUrl,
              detail: "auto",
            },
          ],
        },
      ],
    });

    const resultText = response.output_text.trim();

    console.log("AI vehicle analysis:", resultText);

    let jsonText = resultText;

    if (jsonText.startsWith("```")) {
      jsonText = jsonText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
    }

    let result: {
      vehicleType?: unknown;
      brand?: unknown;
      model?: unknown;
      category?: unknown;
      confidence?: unknown;
    };

    try {
      result = JSON.parse(jsonText);
    } catch {
      console.error(
        "AI mengembalikan format bukan JSON:",
        resultText
      );

      return NextResponse.json(
        {
          success: false,
          error: "AI memberikan hasil yang tidak dapat diproses.",
        },
        { status: 500 }
      );
    }

    const vehicleType =
      result.vehicleType === "MOTOR" ||
      result.vehicleType === "MOBIL"
        ? result.vehicleType
        : null;

    const brand =
      typeof result.brand === "string"
        ? result.brand.trim() || null
        : null;

    const model =
      typeof result.model === "string"
        ? result.model.trim() || null
        : null;

    const category =
      typeof result.category === "string" &&
      allowedCategories.includes(
        result.category as (typeof allowedCategories)[number]
      )
        ? result.category
        : null;

    const confidence =
      typeof result.confidence === "number"
        ? Math.max(0, Math.min(100, result.confidence))
        : 0;

    return NextResponse.json({
      success: true,
      result: {
        vehicleType,
        brand,
        model,
        category,
        confidence,
      },
    });
  } catch (error) {
    console.error("Vehicle AI analysis error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Gagal menganalisis kendaraan.",
      },
      { status: 500 }
    );
  }
}
