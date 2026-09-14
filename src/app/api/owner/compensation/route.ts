import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

const allowedVehicleTypes = [
  "MOTOR",
  "MOBIL",
] as const;

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "Silakan login terlebih dahulu",
        },
        { status: 401 }
      );
    }

    if (currentUser.role !== "OWNER") {
      return NextResponse.json(
        {
          error: "Akses hanya untuk Owner",
        },
        { status: 403 }
      );
    }

    const compensations =
      await prisma.employeeCompensation.findMany({
        where: {
          vehicleType: {
            in: [...allowedVehicleTypes],
          },
          active: true,
        },
        orderBy: {
          vehicleType: "asc",
        },
      });

    return NextResponse.json({
      success: true,
      compensations,
    });
  } catch (error) {
    console.error(
      "GET /api/owner/compensation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Gagal mengambil data kompensasi karyawan",
      },
      { status: 500 }
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
        { status: 401 }
      );
    }

    if (currentUser.role !== "OWNER") {
      return NextResponse.json(
        {
          error: "Akses hanya untuk Owner",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const vehicleType =
      typeof body.vehicleType === "string"
        ? body.vehicleType.trim()
        : "";

    const amount = Number(body.amount);

    if (
      !allowedVehicleTypes.includes(
        vehicleType as (typeof allowedVehicleTypes)[number]
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Tipe kendaraan harus MOTOR atau MOBIL",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Kompensasi harus berupa angka bulat lebih dari Rp0",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.employeeCompensation.findUnique({
        where: {
          vehicleType:
            vehicleType as "MOTOR" | "MOBIL",
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            `Data kompensasi ${vehicleType} belum tersedia`,
        },
        { status: 404 }
      );
    }

    const updated =
      await prisma.employeeCompensation.update({
        where: {
          vehicleType:
            vehicleType as "MOTOR" | "MOBIL",
        },
        data: {
          amount,
          active: true,
        },
      });

    return NextResponse.json({
      success: true,
      message: `Kompensasi ${vehicleType} berhasil disimpan`,
      compensation: updated,
    });
  } catch (error) {
    console.error(
      "PUT /api/owner/compensation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Gagal menyimpan kompensasi karyawan",
      },
      { status: 500 }
    );
  }
}