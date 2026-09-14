import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
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

    const user = await prisma.user.findUnique({
      where: {
        id: currentUser.userId,
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        active: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Akun Owner tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET /api/owner/account error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil data akun" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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

    const name = String(body.name ?? "").trim();
    const username = String(body.username ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Nama wajib diisi" },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { error: "Username wajib diisi" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username minimal 3 karakter" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        NOT: {
          id: currentUser.userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username sudah digunakan" },
        { status: 409 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.userId,
      },
      data: {
        name,
        username,
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        active: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil akun berhasil diperbarui",
      user: updatedUser,
    });
  } catch (error) {
    console.error("PATCH /api/owner/account error:", error);

    return NextResponse.json(
      { error: "Gagal memperbarui profil akun" },
      { status: 500 }
    );
  }
}