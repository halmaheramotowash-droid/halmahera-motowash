import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

async function requireOwner() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "OWNER") {
    return null;
  }

  return currentUser;
}

export async function GET() {
  try {
    const currentUser = await requireOwner();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    let setting = await prisma.receiptSetting.findFirst({
      orderBy: {
        id: "asc",
      },
    });

    if (!setting) {
      setting = await prisma.receiptSetting.create({
        data: {
          paperWidth: 58,
          showBusinessName: true,
          showAddress: true,
          showPhone: true,
          footerText: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      setting,
    });
  } catch (error) {
    console.error("GET receipt settings error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil pengaturan struk",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await requireOwner();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const paperWidth = Number(body.paperWidth);
    const showBusinessName = Boolean(body.showBusinessName);
    const showAddress = Boolean(body.showAddress);
    const showPhone = Boolean(body.showPhone);

    const footerText =
      typeof body.footerText === "string"
        ? body.footerText.trim()
        : "";

    if (paperWidth !== 58 && paperWidth !== 80) {
      return NextResponse.json(
        {
          success: false,
          error: "Ukuran kertas hanya boleh 58 mm atau 80 mm",
        },
        { status: 400 }
      );
    }

    let existing = await prisma.receiptSetting.findFirst({
      orderBy: {
        id: "asc",
      },
    });

    const data = {
      paperWidth,
      showBusinessName,
      showAddress,
      showPhone,
      footerText: footerText || null,
    };

    const setting = existing
      ? await prisma.receiptSetting.update({
          where: {
            id: existing.id,
          },
          data,
        })
      : await prisma.receiptSetting.create({
          data,
        });

    return NextResponse.json({
      success: true,
      message: "Pengaturan struk berhasil disimpan",
      setting,
    });
  } catch (error) {
    console.error("PUT receipt settings error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Gagal menyimpan pengaturan struk",
      },
      { status: 500 }
    );
  }
}