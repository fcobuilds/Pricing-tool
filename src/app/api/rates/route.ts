import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_RATES = [
  { serviceType: "it-support", displayName: "IT Support / Tech Help", minRate: 75, maxRate: 150, unit: "hour", notes: "Residential in-home and remote support" },
  { serviceType: "social-media", displayName: "Social Media Management", minRate: 300, maxRate: 1500, unit: "month", notes: "Per month, varies by post count and platforms" },
  { serviceType: "consulting", displayName: "Tech Consulting / Advisory", minRate: 100, maxRate: 250, unit: "hour", notes: "Strategy, tech selection, workshops" },
  { serviceType: "web-dev", displayName: "Website / Web Development", minRate: 500, maxRate: 5000, unit: "project", notes: "Depends on complexity and features" },
  { serviceType: "system-migration", displayName: "System Migration", minRate: 500, maxRate: 3000, unit: "project", notes: "SMB system and data migrations" },
  { serviceType: "lead-generation", displayName: "Lead Generation", minRate: 300, maxRate: 1000, unit: "month", notes: "Monthly retainer for lead gen services" },
  { serviceType: "workshop", displayName: "Workshop / Training", minRate: 150, maxRate: 500, unit: "hour", notes: "Group or individual training sessions" },
];

export async function GET() {
  let rates = await prisma.serviceRate.findMany({ orderBy: { displayName: "asc" } });
  if (rates.length === 0) {
    for (const rate of DEFAULT_RATES) {
      await prisma.serviceRate.upsert({ where: { serviceType: rate.serviceType }, update: {}, create: rate });
    }
    rates = await prisma.serviceRate.findMany({ orderBy: { displayName: "asc" } });
  }
  return NextResponse.json(rates);
}
