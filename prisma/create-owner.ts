import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("owner123", 12);

  const owner = await prisma.user.upsert({
    where: {
      username: "owner",
    },
    update: {
      passwordHash,
      name: "Owner",
      role: "OWNER",
      active: true,
    },
    create: {
      username: "owner",
      passwordHash,
      name: "Owner",
      role: "OWNER",
      active: true,
    },
  });

  console.log("OWNER BERHASIL DIBUAT");
  console.log("ID:", owner.id);
  console.log("USERNAME: owner");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
