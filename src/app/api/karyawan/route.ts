import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

async function requireOwner() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      error: NextResponse.json(
        { error: "Belum login" },
        { status: 401 }
      ),
    };
  }

  if (currentUser.role !== "OWNER") {
    return {
      error: NextResponse.json(
        {
          error: "Akses ditolak. Khusus OWNER.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    currentUser,
  };
}

/*
 * =====================================================
 * TAMBAH KARYAWAN
 * =====================================================
 */
export async function POST(request: Request) {
  try {
    const auth = await requireOwner();

    if ("error" in auth) {
      return auth.error;
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();

    const username = String(body.username ?? "")
      .trim()
      .toLowerCase();

    const password = String(body.password ?? "");

    if (!name || !username || !password) {
      return NextResponse.json(
        {
          error:
            "Nama, username, dan password wajib diisi",
        },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          error: "Nama karyawan terlalu pendek",
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

    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "Password minimal 6 karakter",
        },
        { status: 400 }
      );
    }

    const existingUser =
      await prisma.user.findUnique({
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

    const passwordHash =
      await bcrypt.hash(password, 10);

    const employee =
      await prisma.user.create({
        data: {
          name,
          username,
          passwordHash,
          role: "KARYAWAN",
          active: true,
        },
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          active: true,
          createdAt: true,
          deletedAt: true,
        },
      });

    return NextResponse.json({
      success: true,
      message:
        "Karyawan berhasil ditambahkan",
      employee,
    });
  } catch (error) {
    console.error(
      "TAMBAH KARYAWAN ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Gagal menambahkan karyawan",
      },
      { status: 500 }
    );
  }
}

/*
 * =====================================================
 * UBAH PASSWORD / STATUS KARYAWAN
 * =====================================================
 */
export async function PATCH(request: Request) {
  try {
    const auth = await requireOwner();

    if ("error" in auth) {
      return auth.error;
    }

    const body = await request.json();

    const employeeId = Number(
      body.employeeId
    );

    if (
      !Number.isInteger(employeeId) ||
      employeeId <= 0
    ) {
      return NextResponse.json(
        {
          error: "ID karyawan tidak valid",
        },
        { status: 400 }
      );
    }

    const employee =
      await prisma.user.findUnique({
        where: {
          id: employeeId,
        },
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          active: true,
          deletedAt: true,
          createdAt: true,
        },
      });

    if (!employee) {
      return NextResponse.json(
        {
          error: "Karyawan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    /*
     * Pastikan OWNER tidak bisa
     * dimodifikasi melalui endpoint ini.
     */
    if (employee.role !== "KARYAWAN") {
      return NextResponse.json(
        {
          error:
            "Akun yang dipilih bukan akun karyawan",
        },
        { status: 400 }
      );
    }

    const updateData: {
      passwordHash?: string;
      active?: boolean;
      deletedAt?: Date | null;
    } = {};

    /*
     * ---------------------------------------------
     * UBAH PASSWORD
     * ---------------------------------------------
     */
    if (
      body.password !== undefined &&
      body.password !== null
    ) {
      const password = String(
        body.password
      );

      if (password.length < 6) {
        return NextResponse.json(
          {
            error:
              "Password minimal 6 karakter",
          },
          { status: 400 }
        );
      }

      updateData.passwordHash =
        await bcrypt.hash(
          password,
          10
        );
    }

    /*
     * ---------------------------------------------
     * UBAH STATUS
     * ---------------------------------------------
     */
    if (body.active !== undefined) {
      if (
        typeof body.active !== "boolean"
      ) {
        return NextResponse.json(
          {
            error:
              "Status active harus bernilai true atau false",
          },
          { status: 400 }
        );
      }

      updateData.active =
        body.active;

      /*
       * Jika akun diaktifkan kembali,
       * hapus tanda deletedAt.
       */
      if (body.active === true) {
        updateData.deletedAt = null;
      }

      /*
       * Jika hanya dinonaktifkan melalui
       * tombol NONAKTIFKAN, jangan dianggap
       * sebagai penghapusan akun.
       *
       * Karena itu deletedAt tetap null.
       */
      if (body.active === false) {
        updateData.deletedAt =
          employee.deletedAt ?? null;
      }
    }

    /*
     * Tidak ada perubahan
     */
    if (
      updateData.passwordHash ===
        undefined &&
      updateData.active === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Tidak ada perubahan yang dikirim",
        },
        { status: 400 }
      );
    }

    const updatedEmployee =
      await prisma.user.update({
        where: {
          id: employeeId,
        },
        data: updateData,
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          active: true,
          deletedAt: true,
          createdAt: true,
        },
      });

    let message =
      "Data karyawan berhasil diubah";

    if (
      updateData.passwordHash !==
        undefined &&
      updateData.active !== undefined
    ) {
      message =
        "Password dan status karyawan berhasil diubah";
    } else if (
      updateData.passwordHash !==
      undefined
    ) {
      message =
        "Password karyawan berhasil diubah";
    } else if (
      updateData.active !== undefined
    ) {
      message =
        updateData.active
          ? "Karyawan berhasil diaktifkan"
          : "Karyawan berhasil dinonaktifkan";
    }

    return NextResponse.json({
      success: true,
      message,
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error(
      "UBAH KARYAWAN ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Gagal mengubah data karyawan",
      },
      { status: 500 }
    );
  }
}

/*
 * =====================================================
 * HAPUS AKUN KARYAWAN
 * =====================================================
 *
 * Aturan:
 *
 * 1. Hanya OWNER yang boleh menghapus.
 * 2. Hanya akun KARYAWAN yang boleh dihapus.
 *
 * 3. Jika belum pernah memiliki transaksi:
 *      -> akun dihapus permanen.
 *
 * 4. Jika sudah memiliki transaksi:
 *      -> akun TIDAK dihapus dari database.
 *      -> active = false
 *      -> deletedAt = sekarang
 *      -> histori transaksi tetap aman.
 */
export async function DELETE(request: Request) {
  try {
    const auth = await requireOwner();

    if ("error" in auth) {
      return auth.error;
    }

    const body = await request.json();

    const employeeId = Number(
      body.employeeId
    );

    if (
      !Number.isInteger(employeeId) ||
      employeeId <= 0
    ) {
      return NextResponse.json(
        {
          error: "ID karyawan tidak valid",
        },
        { status: 400 }
      );
    }

    const employee =
      await prisma.user.findUnique({
        where: {
          id: employeeId,
        },
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          active: true,
          deletedAt: true,
        },
      });

    if (!employee) {
      return NextResponse.json(
        {
          error: "Karyawan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    /*
     * Jangan pernah izinkan OWNER
     * dihapus melalui endpoint ini.
     */
    if (employee.role !== "KARYAWAN") {
      return NextResponse.json(
        {
          error:
            "Akun yang dipilih bukan akun karyawan",
        },
        { status: 400 }
      );
    }

    /*
     * Cek apakah karyawan sudah
     * pernah melakukan transaksi.
     */
    const transactionCount =
      await prisma.transaction.count({
        where: {
          employeeId: employee.id,
        },
      });

    /*
     * ---------------------------------------------
     * KARYAWAN SUDAH PUNYA TRANSAKSI
     * ---------------------------------------------
     *
     * Jangan hapus User karena transaksi
     * masih menggunakan employeeId.
     *
     * Gunakan soft delete:
     * active = false
     * deletedAt = sekarang
     */
    if (transactionCount > 0) {
      const deletedEmployee =
        await prisma.user.update({
          where: {
            id: employee.id,
          },
          data: {
            active: false,
            deletedAt: new Date(),
          },
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
            active: true,
            deletedAt: true,
          },
        });

      return NextResponse.json({
        success: true,
        softDeleted: true,
        message:
          "Akun karyawan dinonaktifkan dan ditandai terhapus. Histori transaksi tetap aman.",
        transactionCount,
        employee: deletedEmployee,
      });
    }

    /*
     * ---------------------------------------------
     * KARYAWAN BELUM PUNYA TRANSAKSI
     * ---------------------------------------------
     *
     * Aman untuk menghapus akun secara permanen.
     */
    await prisma.user.delete({
      where: {
        id: employee.id,
      },
    });

    return NextResponse.json({
      success: true,
      softDeleted: false,
      message:
        "Akun karyawan berhasil dihapus",
      employeeId: employee.id,
    });
  } catch (error) {
    console.error(
      "HAPUS KARYAWAN ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Gagal menghapus akun karyawan",
      },
      { status: 500 }
    );
  }
}