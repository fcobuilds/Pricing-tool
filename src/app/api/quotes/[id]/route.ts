import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: { client: true },
    });
    if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(quote);
  } catch (err) {
    console.error("GET /api/quotes/[id]", err);
    return NextResponse.json({ error: "Failed to load quote" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const quote = await prisma.quote.update({
      where: { id: params.id },
      data: {
        serviceType: data.serviceType,
        description: data.description,
        estimatedHours: data.estimatedHours ?? null,
        finalPrice: data.finalPrice ?? null,
        recommendedPrice: data.recommendedPrice ?? null,
        marketLow: data.marketLow ?? null,
        marketHigh: data.marketHigh ?? null,
        marketResearch: data.marketResearch ?? null,
        needLevel: data.needLevel,
        status: data.status,
        notes: data.notes ?? null,
      },
    });
    return NextResponse.json(quote);
  } catch (err) {
    console.error("PUT /api/quotes/[id]", err);
    return NextResponse.json({ error: "Failed to update quote" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.quote.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/quotes/[id]", err);
    return NextResponse.json({ error: "Failed to delete quote" }, { status: 500 });
  }
}
