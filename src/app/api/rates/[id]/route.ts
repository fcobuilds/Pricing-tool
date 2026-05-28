import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
}
