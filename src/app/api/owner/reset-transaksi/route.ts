import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "OWNER") {
      return NextResponse.json(
        {
          success: false,
          error: "Akses ditolak. Hanya OWNER yang dapat mereset transaksi.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const password = String(body.password ?? "");

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          error: "Password Owner wajib diisi.",
        },
        { status: 400 }
      );
    }

    const owner = await prisma.user.findUnique({
      where: {
        id: currentUser.userId,
      },
    });

    if (!owner || owner.role !== "OWNER" || !owner.active) {
      return NextResponse.json(
        {
          success: false,
          error: "Akun Owner tidak ditemukan atau tidak aktif.",
        },
        { status: 403 }
      );
    }

    const passwordValid = await bcrypt.compare(
      password,
      owner.passwordHash
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Password Owner salah.",
        },
        { status: 401 }
      );
    }

    const result = await prisma.transaction.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Berhasil menghapus ${result.count} transaksi.`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("RESET TRANSAKSI ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Gagal menghapus transaksi.",
      },
      { status: 500 }
    );
  }
}