import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

type PrintAction =
  | "START"
  | "SUCCESS"
  | "FAILED";

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
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

    if (
      !Number.isInteger(transactionId) ||
      transactionId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "ID transaksi tidak valid",
        },
        { status: 400 }
      );
    }

    const body = await request
      .json()
      .catch(() => null);

    const action = body?.action as PrintAction;

    if (
      action !== "START" &&
      action !== "SUCCESS" &&
      action !== "FAILED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Aksi cetak tidak valid",
        },
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
          printStatus: true,
          printAttemptCount: true,
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
      currentUser.role === "KARYAWAN" &&
      transaction.employeeId !== currentUser.userId
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Anda tidak memiliki akses ke transaksi ini",
        },
        { status: 403 }
      );
    }

    if (action === "START") {
      const updated =
        await prisma.transaction.update({
          where: {
            id: transactionId,
          },
          data: {
            printStatus: "PRINTING",
            printAttemptCount: {
              increment: 1,
            },
            lastPrintError: null,
          },
          select: {
            id: true,
            printStatus: true,
            printedAt: true,
            printAttemptCount: true,
            lastPrintError: true,
          },
        });

      return NextResponse.json({
        success: true,
        message: "Proses cetak dimulai",
        transaction: updated,
      });
    }

    if (action === "SUCCESS") {
      const updated =
        await prisma.transaction.update({
          where: {
            id: transactionId,
          },
          data: {
            printStatus: "PRINTED",
            printedAt: new Date(),
            lastPrintError: null,
          },
          select: {
            id: true,
            printStatus: true,
            printedAt: true,
            printAttemptCount: true,
            lastPrintError: true,
          },
        });

      return NextResponse.json({
        success: true,
        message: "Struk berhasil dicetak",
        transaction: updated,
      });
    }

    const errorMessage =
      typeof body?.error === "string" &&
      body.error.trim()
        ? body.error.trim()
        : "Proses cetak gagal";

    const updated =
      await prisma.transaction.update({
        where: {
          id: transactionId,
        },
        data: {
          printStatus: "PRINT_FAILED",
          lastPrintError: errorMessage,
        },
        select: {
          id: true,
          printStatus: true,
          printedAt: true,
          printAttemptCount: true,
          lastPrintError: true,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Status cetak ditandai gagal",
      transaction: updated,
    });
  } catch (error) {
    console.error(
      "POST print status error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Gagal memperbarui status cetak",
      },
      { status: 500 }
    );
  }
}