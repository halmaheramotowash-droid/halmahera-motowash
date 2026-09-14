import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getCurrentUser } from "@/lib/current-user";

const allowedCategories = [
  "Motor Kecil",
  "Motor Sedang",
  "Motor Besar",
  "Mobil Kecil",
  "Mobil Besar",
];

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Belum login" },
        { status: 401 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY belum tersedia.");

      return NextResponse.json(
        { error: "GEMINI_API_KEY belum tersedia" },
        { status: 500 }
      );
    }

    // =========================================================
    // TERIMA FOTO DARI FORM DATA
    // =========================================================

    const formData = await request.formData();
    const imageFile = formData.get("image");

    if (!(imageFile instanceof File)) {
      return NextResponse.json(
        { error: "Foto kendaraan tidak ditemukan" },
        { status: 400 }
      );
    }

    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File yang dikirim bukan gambar" },
        { status: 400 }
      );
    }

    console.log(
      "Gemini menerima foto:",
      imageFile.name,
      imageFile.type,
      imageFile.size
    );

    // =========================================================
    // UBAH FILE MENJADI BASE64
    // =========================================================

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    // =========================================================
    // GEMINI
    // =========================================================

    const ai = new GoogleGenAI({
      apiKey,
    });

    const prompt = `
Anda adalah sistem identifikasi kendaraan untuk aplikasi kasir cuci kendaraan.

Analisis foto kendaraan yang diberikan.

Tentukan:

1. vehicleType
   Hanya boleh:
   - "MOTOR"
   - "MOBIL"

2. brand
   Merek kendaraan jika dapat dikenali.

3. model
   Model kendaraan jika dapat dikenali.
   Usahakan mengenali model secara spesifik.

4. category
   Pilih tepat SATU kategori dari daftar berikut:
   - Motor Kecil
   - Motor Sedang
   - Motor Besar
   - Mobil Kecil
   - Mobil Besar

5. confidence
   Angka antara 0 dan 1.

=========================================================
ATURAN KATEGORI MOTOR
=========================================================

Gunakan NAMA MODEL sebagai dasar utama klasifikasi.

JANGAN menentukan kategori hanya berdasarkan ukuran fisik
atau perkiraan ukuran motor.

---------------------------------------------------------
MOTOR KECIL
---------------------------------------------------------

Kategori: "Motor Kecil"

Contoh model:

- Honda Grand
- Honda Beat
- Honda Scoopy
- Yamaha Mio
- Semua Honda Vario
- Honda Vario 125
- Honda Vario 150
- Honda Vario 160

PENTING:
Semua Honda Vario termasuk Vario 160 adalah Motor Kecil.

---------------------------------------------------------
MOTOR SEDANG
---------------------------------------------------------

Kategori: "Motor Sedang"

Contoh model:

- Honda MegaPro
- Yamaha Vixion
- Honda CBR
- Kawasaki Ninja R
- Kawasaki Ninja SS
- Honda PCX
- Yamaha NMAX

PENTING:

- Yamaha Vixion HARUS Motor Sedang.
- Honda MegaPro HARUS Motor Sedang.
- Honda CBR HARUS Motor Sedang.
- Kawasaki Ninja R HARUS Motor Sedang.
- Kawasaki Ninja SS HARUS Motor Sedang.
- Honda PCX HARUS Motor Sedang.
- Yamaha NMAX HARUS Motor Sedang.

JANGAN menganggap semua motor sport sebagai Motor Besar.

JANGAN menganggap semua motor Kawasaki sebagai Motor Besar.

---------------------------------------------------------
MOTOR BESAR
---------------------------------------------------------

Kategori: "Motor Besar"

Contoh model:

- Kawasaki KLX
- Yamaha XMAX
- Harley-Davidson
- Kawasaki Ninja 250

PENTING:

- Kawasaki Ninja 250 HARUS Motor Besar.
- Kawasaki KLX HARUS Motor Besar.
- Yamaha XMAX HARUS Motor Besar.
- Harley-Davidson HARUS Motor Besar.

=========================================================
ATURAN KHUSUS NINJA
=========================================================

Perhatikan perbedaan model Kawasaki Ninja:

- Kawasaki Ninja R = Motor Sedang
- Kawasaki Ninja SS = Motor Sedang
- Kawasaki Ninja 250 = Motor Besar

Jangan menyamakan semua model Kawasaki Ninja.

Jika terlihat jelas tulisan atau ciri model "Ninja 250",
gunakan "Motor Besar".

Jika terlihat jelas "Ninja R" atau "Ninja SS",
gunakan "Motor Sedang".

=========================================================
ATURAN KHUSUS VIXION
=========================================================

Semua Yamaha Vixion yang dapat dikenali
harus dikategorikan sebagai:

"Motor Sedang"

Jangan mengategorikan Yamaha Vixion sebagai Motor Besar
hanya karena bentuknya adalah motor sport.

=========================================================
ATURAN MOBIL
=========================================================

Mobil:
- Mobil Kecil = mobil kecil, city car, atau kendaraan kecil.
- Mobil Besar = kendaraan yang lebih besar seperti SUV besar,
  MPV besar, dan kendaraan besar lainnya.

=========================================================
ATURAN PENTING
=========================================================

- Jangan membuat kategori baru.
- Jangan menggunakan kategori selain lima kategori yang diberikan.
- Jangan memberikan markdown.
- Jangan memberikan penjelasan.
- Hasil harus JSON valid.
- Jika brand tidak yakin, gunakan null.
- Jika model tidak yakin, gunakan null.
- Tetap tentukan vehicleType jika kendaraan terlihat jelas.
- Tetap tentukan category jika kendaraan terlihat jelas.
- confidence harus berupa angka antara 0 dan 1.

Jika model cocok dengan daftar model yang diberikan,
ikuti aturan kategori tersebut.

Jika model tidak dapat dikenali dengan cukup yakin,
gunakan penilaian terbaik berdasarkan kendaraan yang terlihat.

Kembalikan JSON dengan format:

{
  "vehicleType": "MOTOR",
  "brand": "Honda",
  "model": "Beat",
  "category": "Motor Kecil",
  "confidence": 0.9
}
`;

    console.log("Mengirim foto ke Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: [
        {
          inlineData: {
            mimeType: imageFile.type,
            data: base64Data,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim();

    console.log("Gemini response:", text);

    if (!text) {
      return NextResponse.json(
        { error: "Gemini tidak memberikan hasil" },
        { status: 500 }
      );
    }

    // =========================================================
    // PARSE JSON GEMINI
    // =========================================================

    let result: {
      vehicleType?: unknown;
      brand?: unknown;
      model?: unknown;
      category?: unknown;
      confidence?: unknown;
    };

    try {
      let cleanedText = text.trim();

      cleanedText = cleanedText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const jsonStart = cleanedText.indexOf("{");
      const jsonEnd = cleanedText.lastIndexOf("}");

      if (
        jsonStart === -1 ||
        jsonEnd === -1 ||
        jsonEnd <= jsonStart
      ) {
        throw new Error(
          "Response Gemini tidak mengandung JSON object."
        );
      }

      cleanedText = cleanedText.slice(
        jsonStart,
        jsonEnd + 1
      );

      result = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(
        "Gemini JSON parse error:",
        parseError
      );

      console.error(
        "Gemini response mentah:",
        text
      );

      return NextResponse.json(
        {
          error:
            "Gemini memberikan hasil yang tidak dapat diproses",
        },
        { status: 500 }
      );
    }

    // =========================================================
    // VALIDASI HASIL
    // =========================================================

    const vehicleType =
      result.vehicleType === "MOTOR" ||
      result.vehicleType === "MOBIL"
        ? result.vehicleType
        : null;

    const brand =
      typeof result.brand === "string" &&
      result.brand.trim()
        ? result.brand.trim()
        : null;

    const model =
      typeof result.model === "string" &&
      result.model.trim()
        ? result.model.trim()
        : null;

    const category =
      typeof result.category === "string" &&
      allowedCategories.includes(result.category)
        ? result.category
        : null;

    let confidence = 0;

    if (typeof result.confidence === "number") {
      confidence = Math.max(
        0,
        Math.min(1, result.confidence)
      );
    }

    if (!vehicleType) {
      return NextResponse.json(
        {
          error:
            "Gemini tidak dapat menentukan tipe kendaraan.",
        },
        { status: 422 }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          error:
            "Gemini tidak dapat menentukan kategori kendaraan.",
        },
        { status: 422 }
      );
    }

    // =========================================================
    // HASIL
    // =========================================================

    console.log("Hasil akhir Gemini:", {
      vehicleType,
      brand,
      model,
      category,
      confidence,
    });

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
    console.error("Gemini analyze error:", error);

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      "Detail error Gemini:",
      message
    );

    return NextResponse.json(
      {
        error:
          "Gagal menganalisis kendaraan dengan Gemini",
      },
      { status: 500 }
    );
  }
}