import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const transactionId = Number(id);

    if (!Number.isInteger(transactionId) || transactionId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "ID transaksi tidak valid",
        },
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
        {
          success: false,
          error: "Transaksi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    if (
      currentUser.role === "KARYAWAN"
    ) {
      const employeeTransaction =
        await prisma.transaction.findFirst({
          where: {
            id: transactionId,
            employeeId: currentUser.userId,
          },
          select: {
            id: true,
          },
        });

      if (!employeeTransaction) {
        return NextResponse.json(
          {
            success: false,
            error: "Anda tidak memiliki akses ke transaksi ini",
          },
          { status: 403 }
        );
      }
    }

    const businessProfile =
      await prisma.businessProfile.findFirst({
        orderBy: {
          id: "asc",
        },
      });

    let receiptSetting =
      await prisma.receiptSetting.findFirst({
        orderBy: {
          id: "asc",
        },
      });

    if (!receiptSetting) {
      receiptSetting =
        await prisma.receiptSetting.create({
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
      transaction,
      businessProfile,
      receiptSetting,
    });
  } catch (error) {
    console.error("GET receipt data error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Gagal mengambil data struk",
      },
      { status: 500 }
    );
  }
}