import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMarketResearch } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const [research, myRate] = await Promise.all([
      getMarketResearch({
        serviceType: data.serviceType,
        location: data.location,
        description: data.description,
        techLevel: data.techLevel,
        needLevel: data.needLevel,
        estimatedHours: data.estimatedHours,
        multiTask: data.multiTask,
        isRepeatClient: data.isRepeatClient,
        previousPrice: data.previousPrice,
        previousService: data.previousService,
      }),
      prisma.serviceRate.findUnique({ where: { serviceType: data.serviceType } }),
    ]);
    return NextResponse.json({
      research,
      myRate: myRate ? { min: myRate.minRate, max: myRate.maxRate, unit: myRate.unit } : null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Research failed" },
      { status: 500 }
    );
  }
}
