import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: { select: { name: true, location: true } } },
  });
  return NextResponse.json(quotes);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
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
  return NextResponse.json(quote);
}
