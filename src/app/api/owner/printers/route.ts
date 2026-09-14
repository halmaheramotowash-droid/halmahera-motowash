import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

const allowedConnectionTypes = [
  "BLUETOOTH",
  "USB",
  "NETWORK",
] as const;

function isValidConnectionType(
  value: string
): value is "BLUETOOTH" | "USB" | "NETWORK" {
  return allowedConnectionTypes.includes(
    value as (typeof allowedConnectionTypes)[number]
  );
}

function optionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

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

    const printers = await prisma.printer.findMany({
      orderBy: [
        {
          isDefault: "desc",
        },
        {
          id: "asc",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      printers,
    });
  } catch (error) {
    console.error(
      "GET /api/owner/printers error:",
      error
    );

    return NextResponse.json(
      {
        error: "Gagal mengambil data printer",
      },
      { status: 500 }
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

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const connectionType =
      typeof body.connectionType === "string"
        ? body.connectionType.trim()
        : "";

    const paperWidth = Number(body.paperWidth);

    const isDefault =
      body.isDefault === true;

    const bluetoothDeviceId =
      optionalString(body.bluetoothDeviceId);

    const bluetoothServiceUuid =
      optionalString(body.bluetoothServiceUuid);

    const bluetoothCharacteristicUuid =
      optionalString(body.bluetoothCharacteristicUuid);

    const bluetoothWriteMode =
      optionalString(body.bluetoothWriteMode);

    if (!name) {
      return NextResponse.json(
        {
          error: "Nama printer wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!isValidConnectionType(connectionType)) {
      return NextResponse.json(
        {
          error:
            "Jenis koneksi harus BLUETOOTH, USB, atau NETWORK",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(paperWidth) ||
      paperWidth <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Lebar kertas harus berupa angka bulat lebih dari 0",
        },
        { status: 400 }
      );
    }

    /*
     * Konfigurasi Bluetooth hanya disimpan
     * jika jenis koneksi adalah BLUETOOTH.
     */
    const bluetoothData =
      connectionType === "BLUETOOTH"
        ? {
            bluetoothDeviceId,
            bluetoothServiceUuid,
            bluetoothCharacteristicUuid,
            bluetoothWriteMode,
          }
        : {
            bluetoothDeviceId: null,
            bluetoothServiceUuid: null,
            bluetoothCharacteristicUuid: null,
            bluetoothWriteMode: null,
          };

    const printer = await prisma.$transaction(
      async (tx) => {
        if (isDefault) {
          await tx.printer.updateMany({
            where: {
              isDefault: true,
            },
            data: {
              isDefault: false,
            },
          });
        }

        return tx.printer.create({
          data: {
            name,
            connectionType,
            paperWidth,
            isDefault,
            isActive: true,

            ...bluetoothData,
          },
        });
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Printer berhasil ditambahkan",
        printer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/owner/printers error:",
      error
    );

    return NextResponse.json(
      {
        error: "Gagal menambahkan printer",
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

    const id = Number(body.id);

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const connectionType =
      typeof body.connectionType === "string"
        ? body.connectionType.trim()
        : "";

    const paperWidth = Number(body.paperWidth);

    const isDefault =
      body.isDefault === true;

    const bluetoothDeviceId =
      optionalString(body.bluetoothDeviceId);

    const bluetoothServiceUuid =
      optionalString(body.bluetoothServiceUuid);

    const bluetoothCharacteristicUuid =
      optionalString(body.bluetoothCharacteristicUuid);

    const bluetoothWriteMode =
      optionalString(body.bluetoothWriteMode);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          error: "ID printer tidak valid",
        },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          error: "Nama printer wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!isValidConnectionType(connectionType)) {
      return NextResponse.json(
        {
          error:
            "Jenis koneksi harus BLUETOOTH, USB, atau NETWORK",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(paperWidth) ||
      paperWidth <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Lebar kertas harus berupa angka bulat lebih dari 0",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.printer.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error: "Printer tidak ditemukan",
        },
        { status: 404 }
      );
    }

    /*
     * Jika bukan Bluetooth, konfigurasi Bluetooth
     * dibersihkan agar tidak menyimpan konfigurasi
     * yang sudah tidak digunakan.
     */
    const bluetoothData =
      connectionType === "BLUETOOTH"
        ? {
            bluetoothDeviceId,
            bluetoothServiceUuid,
            bluetoothCharacteristicUuid,
            bluetoothWriteMode,
          }
        : {
            bluetoothDeviceId: null,
            bluetoothServiceUuid: null,
            bluetoothCharacteristicUuid: null,
            bluetoothWriteMode: null,
          };

    const printer = await prisma.$transaction(
      async (tx) => {
        if (isDefault) {
          await tx.printer.updateMany({
            where: {
              isDefault: true,
              id: {
                not: id,
              },
            },
            data: {
              isDefault: false,
            },
          });
        }

        return tx.printer.update({
          where: {
            id,
          },
          data: {
            name,
            connectionType,
            paperWidth,
            isDefault,

            ...bluetoothData,
          },
        });
      }
    );

    return NextResponse.json({
      success: true,
      message: "Printer berhasil diperbarui",
      printer,
    });
  } catch (error) {
    console.error(
      "PUT /api/owner/printers error:",
      error
    );

    return NextResponse.json(
      {
        error: "Gagal memperbarui printer",
      },
      { status: 500 }
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

    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          error: "ID printer tidak valid",
        },
        { status: 400 }
      );
    }

    const existing =
      await prisma.printer.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error: "Printer tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const printer =
      await prisma.printer.update({
        where: {
          id,
        },
        data: {
          isActive: false,
          isDefault: false,
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Printer berhasil dinonaktifkan",
      printer,
    });
  } catch (error) {
    console.error(
      "DELETE /api/owner/printers error:",
      error
    );

    return NextResponse.json(
      {
        error: "Gagal menonaktifkan printer",
      },
      { status: 500 }
    );
  }
}