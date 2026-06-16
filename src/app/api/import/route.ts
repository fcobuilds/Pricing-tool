import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { rows } = await req.json() as { rows: Record<string, string>[] };
    const created: string[] = [];
    const errors: string[] = [];

    for (const row of rows) {
      const name = row.name || row.Name || row.NAME;
      const location = row.location || row.Location || row.city || row.City || "";
      if (!name) { errors.push(`Row missing name: ${JSON.stringify(row)}`); continue; }

      try {
        const client = await prisma.client.create({
          data: {
            name: name.trim(),
            email: row.email || row.Email || null,
            phone: row.phone || row.Phone || null,
            location: location.trim() || "Unknown",
            techLevel: (row.techLevel || row.tech_level || "beginner").toLowerCase(),
            clientType: (row.clientType || row.client_type || "residential").toLowerCase(),
            notes: row.notes || row.Notes || null,
          },
        });
        created.push(client.id);
      } catch (e) {
        errors.push(`Failed to import ${name}: ${e instanceof Error ? e.message : "unknown error"}`);
      }
    }

    return NextResponse.json({ created: created.length, errors });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Import failed" }, { status: 500 });
  }
}
