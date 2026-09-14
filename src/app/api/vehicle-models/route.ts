import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "Silakan login terlebih dahulu",
        },
        {
          status: 401,
        }
      );
    }

    const { searchParams } = new URL(request.url);

    const query = String(
      searchParams.get("q") ?? ""
    ).trim();

    const vehicleType = String(
      searchParams.get("vehicleType") ?? ""
    );

    /*
     * MODE OWNER:
     *
     * Jika tidak ada q dan vehicleType,
     * kembalikan seluruh model aktif
     * beserta merek dan kategori.
     */
    if (!query && !vehicleType) {
      const models =
        await prisma.vehicleModel.findMany({
          where: {
            active: true,
          },

          orderBy: [
            {
              vehicleType: "asc",
            },
            {
              name: "asc",
            },
          ],

          include: {
            brand: {
              select: {
                id: true,
                name: true,
              },
            },

            category: {
              select: {
                id: true,
                name: true,
                vehicleType: true,
                price: true,
              },
            },
          },
        });

      return NextResponse.json({
        success: true,
        models,
      });
    }

    /*
     * MODE PENCARIAN:
     *
     * Tetap digunakan oleh halaman Cuci.
     */
    if (
      vehicleType !== "MOTOR" &&
      vehicleType !== "MOBIL"
    ) {
      return NextResponse.json(
        {
          error: "Tipe kendaraan tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    if (!query) {
      return NextResponse.json({
        success: true,
        models: [],
      });
    }

    const models =
      await prisma.vehicleModel.findMany({
        where: {
          active: true,
          vehicleType,
          name: {
            startsWith: query,
          },
        },

        orderBy: {
          name: "asc",
        },

        take: 10,

        select: {
          id: true,
          name: true,
          vehicleType: true,
        },
      });

    return NextResponse.json({
      success: true,
      models,
    });
  } catch (error) {
    console.error(
      "GET /api/vehicle-models error:",
      error
    );

    return NextResponse.json(
      {
        error: "Gagal mengambil model kendaraan",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "Silakan login terlebih dahulu",
        },
        {
          status: 401,
        }
      );
    }

    if (currentUser.role !== "OWNER") {
      return NextResponse.json(
        {
          error: "Akses hanya untuk Owner",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const brandId = Number(body.brandId);
    const categoryId = Number(body.categoryId);

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const vehicleType = body.vehicleType;

    if (!Number.isInteger(brandId) || brandId <= 0) {
      return NextResponse.json(
        {
          error: "Merek kendaraan tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Kategori kendaraan tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          error: "Nama model wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    if (
      vehicleType !== "MOTOR" &&
      vehicleType !== "MOBIL"
    ) {
      return NextResponse.json(
        {
          error: "Tipe kendaraan harus MOTOR atau MOBIL",
        },
        {
          status: 400,
        }
      );
    }

    const brand =
      await prisma.vehicleBrand.findUnique({
        where: {
          id: brandId,
        },
      });

    if (!brand || !brand.active) {
      return NextResponse.json(
        {
          error:
            "Merek kendaraan tidak ditemukan atau tidak aktif",
        },
        {
          status: 404,
        }
      );
    }

    const category =
      await prisma.vehicleCategory.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!category || !category.active) {
      return NextResponse.json(
        {
          error:
            "Kategori kendaraan tidak ditemukan atau tidak aktif",
        },
        {
          status: 404,
        }
      );
    }

    if (category.vehicleType !== vehicleType) {
      return NextResponse.json(
        {
          error:
            "Tipe kendaraan model dan kategori harus sama",
        },
        {
          status: 400,
        }
      );
    }

    const existingModel =
      await prisma.vehicleModel.findFirst({
        where: {
          brandId,
          name,
        },
      });

    if (existingModel) {
      return NextResponse.json(
        {
          error:
            "Model dengan merek tersebut sudah ada",
        },
        {
          status: 409,
        }
      );
    }

    const model =
      await prisma.vehicleModel.create({
        data: {
          brandId,
          name,
          vehicleType,
          categoryId,
          active: true,
        },
        include: {
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              vehicleType: true,
              price: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,
        message: "Model kendaraan berhasil ditambahkan",
        model,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/vehicle-models error:",
      error
    );

    return NextResponse.json(
      {
        error: "Gagal menambahkan model kendaraan",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "Silakan login terlebih dahulu",
        },
        {
          status: 401,
        }
      );
    }

    if (currentUser.role !== "OWNER") {
      return NextResponse.json(
        {
          error: "Akses hanya untuk Owner",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const id = Number(body.id);
    const brandId = Number(body.brandId);
    const categoryId = Number(body.categoryId);

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const vehicleType = body.vehicleType;

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          error: "ID model tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    if (!Number.isInteger(brandId) || brandId <= 0) {
      return NextResponse.json(
        {
          error: "Merek kendaraan tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      return NextResponse.json(
        {
          error: "Kategori kendaraan tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          error: "Nama model wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    if (
      vehicleType !== "MOTOR" &&
      vehicleType !== "MOBIL"
    ) {
      return NextResponse.json(
        {
          error: "Tipe kendaraan harus MOTOR atau MOBIL",
        },
        {
          status: 400,
        }
      );
    }

    const existingModel =
      await prisma.vehicleModel.findUnique({
        where: {
          id,
        },
      });

    if (!existingModel) {
      return NextResponse.json(
        {
          error: "Model kendaraan tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    const brand =
      await prisma.vehicleBrand.findUnique({
        where: {
          id: brandId,
        },
      });

    if (!brand || !brand.active) {
      return NextResponse.json(
        {
          error:
            "Merek kendaraan tidak ditemukan atau tidak aktif",
        },
        {
          status: 404,
        }
      );
    }

    const category =
      await prisma.vehicleCategory.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!category || !category.active) {
      return NextResponse.json(
        {
          error:
            "Kategori kendaraan tidak ditemukan atau tidak aktif",
        },
        {
          status: 404,
        }
      );
    }

    if (category.vehicleType !== vehicleType) {
      return NextResponse.json(
        {
          error:
            "Tipe kendaraan model dan kategori harus sama",
        },
        {
          status: 400,
        }
      );
    }

    const duplicateModel =
      await prisma.vehicleModel.findFirst({
        where: {
          brandId,
          name,
          NOT: {
            id,
          },
        },
      });

    if (duplicateModel) {
      return NextResponse.json(
        {
          error:
            "Model dengan merek tersebut sudah ada",
        },
        {
          status: 409,
        }
      );
    }

    const model =
      await prisma.vehicleModel.update({
        where: {
          id,
        },
        data: {
          brandId,
          name,
          vehicleType,
          categoryId,
        },
        include: {
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              vehicleType: true,
              price: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      message: "Model kendaraan berhasil diperbarui",
      model,
    });
  } catch (error) {
    console.error(
      "PUT /api/vehicle-models error:",
      error
    );

    return NextResponse.json(
      {
        error: "Gagal memperbarui model kendaraan",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "Silakan login terlebih dahulu",
        },
        {
          status: 401,
        }
      );
    }

    if (currentUser.role !== "OWNER") {
      return NextResponse.json(
        {
          error: "Akses hanya untuk Owner",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          error: "ID model tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    const existingModel =
      await prisma.vehicleModel.findUnique({
        where: {
          id,
        },
      });

    if (!existingModel) {
      return NextResponse.json(
        {
          error: "Model kendaraan tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    if (!existingModel.active) {
      return NextResponse.json(
        {
          error: "Model kendaraan sudah tidak aktif",
        },
        {
          status: 400,
        }
      );
    }

    const model =
      await prisma.vehicleModel.update({
        where: {
          id,
        },
        data: {
          active: false,
        },
        include: {
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              vehicleType: true,
              price: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      message: "Model kendaraan berhasil dinonaktifkan",
      model,
    });
  } catch (error) {
    console.error(
      "DELETE /api/vehicle-models error:",
      error
    );

    return NextResponse.json(
      {
        error: "Gagal menonaktifkan model kendaraan",
      },
      {
        status: 500,
      }
    );
  }
}