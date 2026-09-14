import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "OWNER") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const profile = await prisma.businessProfile.findFirst({
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("GET business profile error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil informasi usaha",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "OWNER") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const businessName = String(body.businessName ?? "").trim();
    const address = String(body.address ?? "").trim();
    const postalCode = String(body.postalCode ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const whatsapp = String(body.whatsapp ?? "").trim();
    const socialMedia = String(body.socialMedia ?? "").trim();

    if (!businessName) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama usaha wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error: "Alamat wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Nomor telepon wajib diisi",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.businessProfile.findFirst({
      orderBy: {
        id: "asc",
      },
    });

    const profile = existing
      ? await prisma.businessProfile.update({
          where: {
            id: existing.id,
          },
          data: {
            businessName,
            address,
            postalCode: postalCode || null,
            phone,
            whatsapp: whatsapp || null,
            socialMedia: socialMedia || null,
          },
        })
      : await prisma.businessProfile.create({
          data: {
            businessName,
            address,
            postalCode: postalCode || null,
            phone,
            whatsapp: whatsapp || null,
            socialMedia: socialMedia || null,
          },
        });

    return NextResponse.json({
      success: true,
      message: "Informasi usaha berhasil disimpan",
      profile,
    });
  } catch (error) {
    console.error("PUT business profile error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Gagal menyimpan informasi usaha",
      },
      { status: 500 }
    );
  }
}