import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, address, items } = await req.json();
    // items: Array<{ cardId: string; quantity: number }>

    if (!name || !email || !address || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch card prices
    const cardIds = items.map((i: { cardId: string }) => i.cardId);
    const cards = await prisma.card.findMany({ where: { id: { in: cardIds } } });
    const cardMap = Object.fromEntries(cards.map((c) => [c.id, c]));

    let total = 0;
    const orderItems = items.map((item: { cardId: string; quantity: number }) => {
      const card = cardMap[item.cardId];
      if (!card) throw new Error(`Card not found: ${item.cardId}`);
      total += card.price * item.quantity;
      return { cardId: item.cardId, quantity: item.quantity, price: card.price };
    });

    const order = await prisma.order.create({
      data: {
        name,
        email,
        address,
        total,
        items: { create: orderItems },
      },
      include: { items: { include: { card: true } } },
    });

    // Decrement stock
    for (const item of items as { cardId: string; quantity: number }[]) {
      await prisma.card.update({
        where: { id: item.cardId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error("orders POST error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
