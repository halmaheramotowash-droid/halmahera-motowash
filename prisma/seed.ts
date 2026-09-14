import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // ================================
  // KOMPENSASI KARYAWAN
  // MOTOR = Rp7.000
  // MOBIL = Rp15.000
  // ================================
  const compensations = [
    ["MOTOR", 7000],
    ["MOBIL", 15000],
  ] as const;

  for (const [vehicleType, amount] of compensations) {
    await prisma.employeeCompensation.upsert({
      where: {
        vehicleType,
      },
      update: {
        amount,
        active: true,
      },
      create: {
        vehicleType,
        amount,
        active: true,
      },
    });
  }

  // ================================
  // KATEGORI KENDARAAN
  // ================================
  const categories = [
    ["MATIC / BEBEK KECIL", "MOTOR", 15000],
    ["MATIC BODI BESAR", "MOTOR", 20000],
    ["MOTOR KOPLING / SPORT", "MOTOR", 20000],
    ["CRF / SPORT KHUSUS", "MOTOR", 25000],
    ["MOBIL KECIL", "MOBIL", 40000],
    ["MPV / MOBIL SEDANG", "MOBIL", 45000],
    ["MPV BESAR", "MOBIL", 50000],
    ["SUV SEDANG", "MOBIL", 45000],
    ["SUV BESAR", "MOBIL", 60000],
    ["SUV PREMIUM / BESAR", "MOBIL", 75000],
    ["PICKUP", "MOBIL", 45000],
    ["DOUBLE CABIN", "MOBIL", 60000],
    ["MINIBUS / VAN BESAR", "MOBIL", 70000],
  ] as const;

  const categoryMap = new Map<string, number>();

  for (const [name, vehicleType, price] of categories) {
    const category = await prisma.vehicleCategory.upsert({
      where: {
        name_vehicleType: {
          name,
          vehicleType,
        },
      },
      update: {
        price,
        active: true,
      },
      create: {
        name,
        vehicleType,
        price,
        active: true,
      },
    });

    categoryMap.set(`${name}|${vehicleType}`, category.id);
  }

  // ================================
  // MODEL KENDARAAN
  // ================================
  const models = [
    ["Beat", "MATIC / BEBEK KECIL", "MOTOR"],
    ["Scoopy", "MATIC / BEBEK KECIL", "MOTOR"],
    ["Vario 125", "MATIC / BEBEK KECIL", "MOTOR"],
    ["Vario 150", "MATIC / BEBEK KECIL", "MOTOR"],
    ["Supra", "MATIC / BEBEK KECIL", "MOTOR"],
    ["Revo", "MATIC / BEBEK KECIL", "MOTOR"],
    ["PCX", "MATIC BODI BESAR", "MOTOR"],
    ["NMAX", "MATIC BODI BESAR", "MOTOR"],
    ["Aerox", "MATIC BODI BESAR", "MOTOR"],
    ["CBR", "MOTOR KOPLING / SPORT", "MOTOR"],
    ["Vixion", "MOTOR KOPLING / SPORT", "MOTOR"],
    ["CRF", "CRF / SPORT KHUSUS", "MOTOR"],

    ["Agya", "MOBIL KECIL", "MOBIL"],
    ["Ayla", "MOBIL KECIL", "MOBIL"],
    ["Brio", "MOBIL KECIL", "MOBIL"],
    ["Calya", "MOBIL KECIL", "MOBIL"],
    ["Sigra", "MOBIL KECIL", "MOBIL"],
    ["Karimun", "MOBIL KECIL", "MOBIL"],
    ["Wagon R", "MOBIL KECIL", "MOBIL"],
    ["Avanza", "MPV / MOBIL SEDANG", "MOBIL"],
    ["Xenia", "MPV / MOBIL SEDANG", "MOBIL"],
    ["Ertiga", "MPV / MOBIL SEDANG", "MOBIL"],
    ["Mobilio", "MPV / MOBIL SEDANG", "MOBIL"],
    ["Livina", "MPV / MOBIL SEDANG", "MOBIL"],
    ["Xpander", "MPV / MOBIL SEDANG", "MOBIL"],
    ["Innova Reborn", "MPV BESAR", "MOBIL"],
    ["Innova Zenix", "MPV BESAR", "MOBIL"],
    ["Rush", "SUV SEDANG", "MOBIL"],
    ["Terios", "SUV SEDANG", "MOBIL"],
    ["BR-V", "SUV SEDANG", "MOBIL"],
    ["HR-V", "SUV SEDANG", "MOBIL"],
    ["Creta", "SUV SEDANG", "MOBIL"],
    ["Raize", "SUV SEDANG", "MOBIL"],
    ["Rocky", "SUV SEDANG", "MOBIL"],
    ["Fortuner", "SUV BESAR", "MOBIL"],
    ["Pajero Sport", "SUV BESAR", "MOBIL"],
    ["Everest", "SUV BESAR", "MOBIL"],
    ["Terra", "SUV BESAR", "MOBIL"],
    ["Land Cruiser", "SUV PREMIUM / BESAR", "MOBIL"],
    ["Lexus SUV", "SUV PREMIUM / BESAR", "MOBIL"],
    ["Large Jeep", "SUV PREMIUM / BESAR", "MOBIL"],
    ["Carry Pickup", "PICKUP", "MOBIL"],
    ["L300", "PICKUP", "MOBIL"],
    ["Gran Max Pickup", "PICKUP", "MOBIL"],
    ["Hilux", "DOUBLE CABIN", "MOBIL"],
    ["Triton", "DOUBLE CABIN", "MOBIL"],
    ["Ranger", "DOUBLE CABIN", "MOBIL"],
    ["D-Max", "DOUBLE CABIN", "MOBIL"],
    ["Hiace", "MINIBUS / VAN BESAR", "MOBIL"],
    ["Elf", "MINIBUS / VAN BESAR", "MOBIL"],
  ] as const;

  for (const [modelName, categoryName, vehicleType] of models) {
    const brandName = modelName.split(" ")[0];

    const brand = await prisma.vehicleBrand.upsert({
      where: {
        name: brandName,
      },
      update: {
        active: true,
      },
      create: {
        name: brandName,
        active: true,
      },
    });

    const categoryId = categoryMap.get(`${categoryName}|${vehicleType}`);

    if (!categoryId) {
      throw new Error(`Kategori tidak ditemukan: ${categoryName}`);
    }

    await prisma.vehicleModel.upsert({
      where: {
        brandId_name: {
          brandId: brand.id,
          name: modelName,
        },
      },
      update: {
        vehicleType,
        categoryId,
        active: true,
      },
      create: {
        brandId: brand.id,
        name: modelName,
        vehicleType,
        categoryId,
        active: true,
      },
    });
  }

  console.log("SEED MASTER DATA BERHASIL");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });