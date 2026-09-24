import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function PATCH(
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

    if (
      !Number.isInteger(transactionId) ||
      transactionId <= 0
    ) {
      return NextResponse.json(
        { error: "ID transaksi tidak valid" },
        { status: 400 }
      );
    }

    const transaction =
      await prisma.transaction.findUnique({
        where: {
          id: transactionId,
        },
        select: {
          id: true,
          employeeId: true,
          paymentMethod: true,
          paymentStatus: true,
        },
      });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    if (
      currentUser.role === "KARYAWAN" &&
      transaction.employeeId !== currentUser.userId
    ) {
      return NextResponse.json(
        {
          error:
            "Anda tidak memiliki akses ke transaksi ini",
        },
        { status: 403 }
      );
    }

    if (transaction.paymentMethod !== "QRIS") {
      return NextResponse.json(
        {
          error:
            "Konfirmasi pembayaran hanya berlaku untuk transaksi QRIS",
        },
        { status: 400 }
      );
    }

    if (transaction.paymentStatus === "PAID") {
      return NextResponse.json({
        success: true,
        message: "Pembayaran sudah dikonfirmasi",
        paymentStatus: "PAID",
      });
    }

    const updatedTransaction =
      await prisma.transaction.update({
        where: {
          id: transactionId,
        },
        data: {
          paymentStatus: "PAID",
        },
        select: {
          id: true,
          transactionNumber: true,
          paymentMethod: true,
          paymentStatus: true,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Pembayaran QRIS berhasil dikonfirmasi",
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error(
      "PATCH /api/transactions/[id]/payment error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Gagal mengonfirmasi pembayaran",
      },
      { status: 500 }
    );
  }
}