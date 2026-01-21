import "dotenv/config";
import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();

  const userId = process.env.TEST_USER_ID ?? randomUUID();

  const created = await prisma.purchase.create({
    data: {
      userId,
      title: "Prisma Test",
      price: 1200,
      purchasedAt: new Date(),
    },
  });

  const fetched = await prisma.purchase.findUnique({
    where: { id: created.id },
  });

  console.log("[prisma] connection ok", {
    createdId: created.id,
    fetched: Boolean(fetched),
  });
}

main()
  .catch((error) => {
    console.error("[prisma] connection failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
