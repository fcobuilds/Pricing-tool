import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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
  } catch (err) {
    console.error("GET /api/clients", err);
    return NextResponse.json({ error: "Failed to load clients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.name || !data.location) {
      return NextResponse.json({ error: "name and location are required" }, { status: 400 });
    }
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
    return NextResponse.json(client, { status: 201 });
  } catch (err) {
    console.error("POST /api/clients", err);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
