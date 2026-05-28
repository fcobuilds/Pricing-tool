import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      quotes: {
        select: { serviceType: true, finalPrice: true, recommendedPrice: true, createdAt: true, description: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const client = await prisma.client.create({
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      location: data.location,
      techLevel: data.techLevel,
      clientType: data.clientType,
      notes: data.notes || null,
    },
    include: {
      quotes: { select: { serviceType: true, finalPrice: true, recommendedPrice: true, createdAt: true, description: true } },
    },
  });
  return NextResponse.json(client);
}
