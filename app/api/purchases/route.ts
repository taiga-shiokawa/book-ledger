import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { getUserIdFromAccessToken } from "../../lib/auth";

type PurchaseRow = {
  id: string;
  title: string;
  price: number;
  purchasedAt: Date;
};

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "");
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : null;
  const safeLimit =
    Number.isInteger(limit) && limit && limit > 0 ? Math.min(limit, 100) : 50;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = await getUserIdFromAccessToken(accessToken);
    const purchases = (await prisma.purchase.findMany({
      where: { userId },
      orderBy: [{ purchasedAt: "desc" }, { createdAt: "desc" }],
      take: safeLimit,
      select: {
        id: true,
        title: true,
        price: true,
        purchasedAt: true,
      },
    })) as PurchaseRow[];

    const response = purchases.map((purchase: PurchaseRow) => ({
      ...purchase,
      purchasedAt: purchase.purchasedAt.toISOString(),
    }));

    return NextResponse.json({ purchases: response });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
