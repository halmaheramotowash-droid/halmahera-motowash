import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();

    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const username = String(body.username ?? "")
      .trim()
      .toLowerCase();

    const password = String(body.password ?? "");

    const confirmPassword = String(body.confirmPassword ?? "");

    /*
     * =====================================================
     * VALIDASI INPUT
     * =====================================================
     */

    if (
      !name ||
      !email ||
      !username ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        {
          error:
            "Nama, email, username, password, dan konfirmasi password wajib diisi",
        },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          error: "Nama minimal 2 karakter",
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          error: "Format email tidak valid",
        },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        {
          error: "Username minimal 3 karakter",
        },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9._-]+$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username hanya boleh menggunakan huruf kecil, angka, titik, garis bawah, atau tanda minus",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "Password minimal 6 karakter",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          error: "Konfirmasi password tidak cocok",
        },
        { status: 400 }
      );
    }

    /*
     * =====================================================
     * CEK PENDAFTARAN UMUM
     * =====================================================
     *
     * Hanya akun pertama yang boleh dibuat melalui
     * halaman pendaftaran umum.
     *
     * Akun berikutnya dibuat oleh OWNER.
     */

    const totalUsers = await prisma.user.count();

    if (totalUsers > 0) {
      return NextResponse.json(
        {
          error:
            "Pendaftaran umum sudah ditutup. Akun baru hanya dapat dibuat oleh OWNER.",
        },
        { status: 403 }
      );
    }

    /*
     * =====================================================
     * CEK EMAIL DAN USERNAME
     * =====================================================
     */

    const existingEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          error: "Email sudah digunakan",
        },
        { status: 409 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Username sudah digunakan",
        },
        { status: 409 }
      );
    }

    /*
     * =====================================================
     * HITUNG PERIODE TRIAL 30 HARI
     * =====================================================
     */

    const trialStartedAt = new Date();

    const trialEndsAt = new Date(trialStartedAt);

    trialEndsAt.setDate(trialEndsAt.getDate() + 30);

    /*
     * =====================================================
     * HASH PASSWORD
     * =====================================================
     */

    const passwordHash = await bcrypt.hash(password, 10);

    /*
     * =====================================================
     * BUAT OWNER PERTAMA
     * =====================================================
     */

    const owner = await prisma.user.create({
      data: {
        name,
        email,
        emailVerified: false,
        username,
        passwordHash,
        role: "OWNER",
        active: true,
        trialStartedAt,
        trialEndsAt,
        subscriptionStatus: "TRIAL",
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        username: true,
        role: true,
        active: true,
        trialStartedAt: true,
        trialEndsAt: true,
        subscriptionStatus: true,
        createdAt: true,
        deletedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Akun OWNER berhasil dibuat. Masa trial gratis berlaku selama 30 hari.",
        user: owner,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("PENDAFTARAN AKUN ERROR:", error);

    return NextResponse.json(
      {
        error: "Gagal membuat akun. Silakan coba lagi.",
      },
      { status: 500 }
    );
  }
}