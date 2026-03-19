import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payment";

// Simple input validation
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

function sanitizeString(str: string, maxLen: number): string {
  return str.trim().slice(0, maxLen);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, address, items } = body;

    // Input validation
    if (!name || typeof name !== "string" || !email || typeof email !== "string" ||
        !address || typeof address !== "string" || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cleanName = sanitizeString(name, 100);
    const cleanEmail = sanitizeString(email, 255).toLowerCase();
    const cleanAddress = sanitizeString(address, 500);

    if (!cleanName || cleanName.length < 1) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!validateEmail(cleanEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
    if (!cleanAddress || cleanAddress.length < 5) {
      return NextResponse.json({ error: "Address is too short" }, { status: 400 });
    }

    // Validate items
    if (items.length > 50) {
      return NextResponse.json({ error: "Too many items" }, { status: 400 });
    }
    for (const item of items) {
      if (!item.cardId || typeof item.cardId !== "string" || item.cardId.length > 50) {
        return NextResponse.json({ error: "Invalid card ID" }, { status: 400 });
      }
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
        return NextResponse.json({ error: "Invalid quantity (1-100)" }, { status: 400 });
      }
    }

    // Use transaction for atomicity — stock check + decrement + order creation
    const order = await prisma.$transaction(async (tx) => {
      // Fetch card prices
      const cardIds = items.map((i: { cardId: string }) => i.cardId);
      const cards = await tx.card.findMany({ where: { id: { in: cardIds }, published: true } });
      const cardMap = Object.fromEntries(cards.map((c) => [c.id, c]));

      let total = 0;
      const orderItems: { cardId: string; quantity: number; price: number }[] = [];

      for (const item of items as { cardId: string; quantity: number }[]) {
        const card = cardMap[item.cardId];
        if (!card) throw new Error(`Card not found: ${item.cardId}`);
        if (card.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${card.name} (${card.stock} available)`);
        }
        total += card.price * item.quantity;
        orderItems.push({ cardId: item.cardId, quantity: item.quantity, price: card.price });
      }

      // Process payment
      const payment = getPaymentProvider();
      const paymentResult = await payment.createCheckoutSession({
        id: "pending", total, email: cleanEmail, name: cleanName,
      });
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || "Payment failed");
      }

      // Create order
      const newOrder = await tx.order.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          address: cleanAddress,
          total,
          transactionId: paymentResult.transactionId,
          statusHistory: JSON.stringify([{ status: "pending", timestamp: new Date().toISOString() }]),
          items: { create: orderItems },
        },
        include: { items: { include: { card: true } } },
      });

      // Decrement stock atomically within transaction
      for (const item of items as { cardId: string; quantity: number }[]) {
        const result = await tx.card.updateMany({
          where: { id: item.cardId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          throw new Error(`Stock no longer available for card ${item.cardId}`);
        }
      }

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    // Only expose safe error messages
    const safeMessages = ["Card not found", "Insufficient stock", "Payment failed", "Stock no longer available"];
    const isSafe = safeMessages.some((m) => message.includes(m));

    if (!isSafe && process.env.NODE_ENV !== "production") {
      console.error("orders POST error:", err);
    }

    return NextResponse.json(
      { error: isSafe ? message : "Failed to create order" },
      { status: isSafe ? 400 : 500 }
    );
  }
}
