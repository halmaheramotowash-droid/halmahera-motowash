import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const plate = (searchParams.get("plate") ?? "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .trim();

  if (!plate) {
    return NextResponse.json(
      { error: "Nomor polisi wajib diisi" },
      { status: 400 }
    );
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: {
      licensePlate: plate,
    },
    include: {
      brand: true,
      model: true,
      category: true,
    },
  });

  return NextResponse.json({
    found: Boolean(vehicle),
    vehicle,
  });
}

