import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [orderCount, cardCount, revenueResult, lowStockCards, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.card.count({ where: { published: true } }),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.card.findMany({
      where: { published: true, stock: { lt: 3 } },
      orderBy: { stock: "asc" },
      take: 10,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { items: true },
    }),
  ]);

  const totalRevenue = revenueResult._sum.total || 0;
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  return NextResponse.json({
    totalRevenue,
    orderCount,
    cardCount,
    avgOrderValue,
    lowStockCards,
    recentOrders,
  });
}
