import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { getUserIdFromAccessToken } from "../../lib/auth";

function parseMonthParam(value: string | null) {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month)) return null;
  if (month < 1 || month > 12) return null;
  return { year, month };
}

function parseYearParam(value: string | null) {
  if (!value) return null;
  const year = Number(value);
  if (!Number.isInteger(year)) return null;
  return year;
}

function getMonthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return { start, end };
}

function getYearRange(year: number) {
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));
  return { start, end };
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "");

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const monthParam = parseMonthParam(searchParams.get("month"));
  const yearParam = parseYearParam(searchParams.get("year"));

  const now = new Date();
  const monthYear = monthParam?.year ?? now.getUTCFullYear();
  const monthValue = monthParam?.month ?? now.getUTCMonth() + 1;
  const yearValue = yearParam ?? now.getUTCFullYear();

  try {
    const userId = await getUserIdFromAccessToken(accessToken);
    const monthRange = getMonthRange(monthYear, monthValue);
    const yearRange = getYearRange(yearValue);

    const [monthSum, yearSum] = await Promise.all([
      prisma.purchase.aggregate({
        where: {
          userId,
          purchasedAt: {
            gte: monthRange.start,
            lt: monthRange.end,
          },
        },
        _sum: { price: true },
      }),
      prisma.purchase.aggregate({
        where: {
          userId,
          purchasedAt: {
            gte: yearRange.start,
            lt: yearRange.end,
          },
        },
        _sum: { price: true },
      }),
    ]);

    return NextResponse.json({
      monthTotal: monthSum._sum.price ?? 0,
      yearTotal: yearSum._sum.price ?? 0,
      month: `${monthYear}-${String(monthValue).padStart(2, "0")}`,
      year: yearValue,
    });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
