import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const categories = await prisma.vehicleCategory.findMany({
      where: {
        active: true,
      },
      orderBy: [
        { vehicleType: "asc" },
        { price: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("GET /api/vehicle-categories error:", error);

    return NextResponse.json(
      { error: "Gagal mengambil kategori kendaraan" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
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

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const vehicleType = body.vehicleType;

    const price = Number(body.price);

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    if (!name) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    if (
      vehicleType !== "MOTOR" &&
      vehicleType !== "MOBIL"
    ) {
      return NextResponse.json(
        { error: "Tipe kendaraan harus MOTOR atau MOBIL" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(price) || price <= 0) {
      return NextResponse.json(
        {
          error:
            "Harga harus berupa angka bulat lebih dari Rp0",
        },
        { status: 400 }
      );
    }

    const existingCategory =
      await prisma.vehicleCategory.findFirst({
        where: {
          name,
          vehicleType,
        },
      });

    if (existingCategory) {
      return NextResponse.json(
        {
          error:
            "Kategori dengan nama dan tipe kendaraan tersebut sudah ada",
        },
        { status: 409 }
      );
    }

    const category =
      await prisma.vehicleCategory.create({
        data: {
          name,
          vehicleType,
          price,
          active: true,
          description: description || null,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message: "Kategori kendaraan berhasil ditambahkan",
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/vehicle-categories error:",
      error
    );

    return NextResponse.json(
      { error: "Gagal menambahkan kategori kendaraan" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
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

    const id = Number(body.id);

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const vehicleType = body.vehicleType;

    const price = Number(body.price);

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "ID kategori tidak valid" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    if (
      vehicleType !== "MOTOR" &&
      vehicleType !== "MOBIL"
    ) {
      return NextResponse.json(
        { error: "Tipe kendaraan harus MOTOR atau MOBIL" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(price) || price <= 0) {
      return NextResponse.json(
        {
          error:
            "Harga harus berupa angka bulat lebih dari Rp0",
        },
        { status: 400 }
      );
    }

    const existingCategory =
      await prisma.vehicleCategory.findUnique({
        where: { id },
      });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategori kendaraan tidak ditemukan" },
        { status: 404 }
      );
    }

    const duplicateCategory =
      await prisma.vehicleCategory.findFirst({
        where: {
          name,
          vehicleType,
          NOT: {
            id,
          },
        },
      });

    if (duplicateCategory) {
      return NextResponse.json(
        {
          error:
            "Kategori dengan nama dan tipe kendaraan tersebut sudah ada",
        },
        { status: 409 }
      );
    }

    const category =
      await prisma.vehicleCategory.update({
        where: { id },
        data: {
          name,
          vehicleType,
          price,
          description: description || null,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Kategori kendaraan berhasil diperbarui",
      category,
    });
  } catch (error) {
    console.error(
      "PUT /api/vehicle-categories error:",
      error
    );

    return NextResponse.json(
      { error: "Gagal memperbarui kategori kendaraan" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
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

    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "ID kategori tidak valid" },
        { status: 400 }
      );
    }

    const existingCategory =
      await prisma.vehicleCategory.findUnique({
        where: { id },
      });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategori kendaraan tidak ditemukan" },
        { status: 404 }
      );
    }

    if (!existingCategory.active) {
      return NextResponse.json(
        { error: "Kategori kendaraan sudah tidak aktif" },
        { status: 400 }
      );
    }

    const category =
      await prisma.vehicleCategory.update({
        where: { id },
        data: {
          active: false,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Kategori kendaraan berhasil dinonaktifkan",
      category,
    });
  } catch (error) {
    console.error(
      "DELETE /api/vehicle-categories error:",
      error
    );

    return NextResponse.json(
      { error: "Gagal menonaktifkan kategori kendaraan" },
      { status: 500 }
    );
  }
}