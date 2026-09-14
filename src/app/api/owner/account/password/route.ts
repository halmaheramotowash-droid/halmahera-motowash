import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Belum login" },
        { status: 401 }
      );
    }

    if (currentUser.role !== "OWNER") {
      return NextResponse.json(
        { error: "Akses hanya untuk Owner" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const currentPassword = String(
      body.currentPassword ?? ""
    );

    const newPassword = String(
      body.newPassword ?? ""
    );

    const confirmPassword = String(
      body.confirmPassword ?? ""
    );

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return NextResponse.json(
        {
          error:
            "Password lama, password baru, dan konfirmasi password wajib diisi",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          error: "Password baru minimal 6 karakter",
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          error:
            "Konfirmasi password tidak cocok",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: currentUser.userId,
      },
      select: {
        id: true,
        passwordHash: true,
        role: true,
        active: true,
      },
    });

    if (!user || user.role !== "OWNER") {
      return NextResponse.json(
        {
          error: "Akun Owner tidak ditemukan",
        },
        { status: 404 }
      );
    }

    if (!user.active) {
      return NextResponse.json(
        {
          error: "Akun Owner tidak aktif",
        },
        { status: 403 }
      );
    }

    const passwordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          error: "Password lama salah",
        },
        { status: 401 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          error:
            "Password baru harus berbeda dari password lama",
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(
      newPassword,
      10
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Password berhasil diubah. Silakan login kembali.",
    });
  } catch (error) {
    console.error(
      "POST /api/owner/account/password error:",
      error
    );

    return NextResponse.json(
      {
        error: "Gagal mengubah password",
      },
      { status: 500 }
    );
  }
}