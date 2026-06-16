import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const quotes = await prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: { select: { name: true, location: true } } },
    });
    return NextResponse.json(quotes);
  } catch (err) {
    console.error("GET /api/quotes", err);
    return NextResponse.json({ error: "Failed to load quotes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.clientId || !data.serviceType) {
      return NextResponse.json({ error: "clientId and serviceType are required" }, { status: 400 });
    }
    const quote = await prisma.quote.create({
      data: {
        clientId: data.clientId,
        serviceType: data.serviceType,
        description: data.description,
        estimatedHours: data.estimatedHours ?? null,
        finalPrice: data.finalPrice ?? null,
        recommendedPrice: data.recommendedPrice ?? null,
        marketLow: data.marketLow ?? null,
        marketHigh: data.marketHigh ?? null,
        marketResearch: data.marketResearch ?? null,
        needLevel: data.needLevel ?? "medium",
        status: data.status ?? "draft",
        notes: data.notes ?? null,
      },
    });
    return NextResponse.json(quote, { status: 201 });
  } catch (err) {
    console.error("POST /api/quotes", err);
    return NextResponse.json({ error: "Failed to create quote" }, { status: 500 });
  }
}
