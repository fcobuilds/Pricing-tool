import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const rate = await prisma.serviceRate.update({
      where: { id: params.id },
      data: {
        minRate: data.minRate,
        maxRate: data.maxRate,
        unit: data.unit,
        notes: data.notes ?? null,
      },
    });
    return NextResponse.json(rate);
  } catch (err) {
    console.error("PUT /api/rates/[id]", err);
    return NextResponse.json({ error: "Failed to update rate" }, { status: 500 });
  }
}
