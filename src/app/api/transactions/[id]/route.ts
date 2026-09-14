import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const transactionId = Number(id);

    if (!Number.isInteger(transactionId) || transactionId <= 0) {
      return NextResponse.json(
        { error: "ID transaksi tidak valid" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
      select: {
        id: true,
        transactionNumber: true,
        licensePlateSnapshot: true,
        brandSnapshot: true,
        modelSnapshot: true,
        categorySnapshot: true,
        vehicleType: true,
        price: true,
        status: true,
        createdAt: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    if (currentUser.role === "KARYAWAN") {
      const ownerCheck = await prisma.transaction.findFirst({
        where: {
          id: transactionId,
          employeeId: currentUser.userId,
        },
        select: {
          id: true,
        },
      });

      if (!ownerCheck) {
        return NextResponse.json(
          {
            error:
              "Anda tidak memiliki akses ke transaksi ini",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error(
      "GET /api/transactions/[id] error:",
      error
    );

    return NextResponse.json(
      { error: "Gagal mengambil detail transaksi" },
      { status: 500 }
    );
  }
}