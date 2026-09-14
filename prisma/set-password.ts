import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL!,
  }),
});

async function main() {
  const passwordHash = await bcrypt.hash("karyawan123", 12);

  await prisma.user.update({
    where: { username: "karyawan" },
    data: { passwordHash },
  });

  console.log("PASSWORD KARYAWAN BERHASIL DIHASH");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
