import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getUserIdFromAccessToken } from "../../../lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "");

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = await getUserIdFromAccessToken(accessToken);
    const purchase = await prisma.purchase.findFirst({
      where: { id, userId },
      select: {
        id: true,
        title: true,
        price: true,
        purchasedAt: true,
      },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json({
      purchase: {
        ...purchase,
        purchasedAt: purchase.purchasedAt.toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
