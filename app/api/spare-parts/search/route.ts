import { NextResponse } from "next/server";
import { searchSpareParts } from "@/lib/tools/searchSpareParts";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const brand = searchParams.get("brand") || undefined;
    const model = searchParams.get("model") || undefined;

    const yearParam = searchParams.get("year");
    const year = yearParam ? Number(yearParam) : undefined;

    const partName = searchParams.get("partName") || undefined;

    const results = await searchSpareParts({
      brand,
      model,
      year,
      partName,
    });

    return NextResponse.json({
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Spare parts search error:", error);

    return NextResponse.json(
      {
        error: "Failed to search spare parts",
      },
      {
        status: 500,
      }
    );
  }
}