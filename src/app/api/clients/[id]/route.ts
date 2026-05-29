import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: { quotes: { orderBy: { createdAt: "desc" } } },
    });
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(client);
  } catch (err) {
    console.error("GET /api/clients/[id]", err);
    return NextResponse.json({ error: "Failed to load client" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        name: data.name,
        email: data.email ?? null,
        phone: data.phone ?? null,
        location: data.location,
        techLevel: data.techLevel,
        clientType: data.clientType,
        notes: data.notes ?? null,
      },
    });
    return NextResponse.json(client);
  } catch (err) {
    console.error("PUT /api/clients/[id]", err);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.client.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/clients/[id]", err);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}
