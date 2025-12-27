import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db/client";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const pool = getDbPool();

    const result = await pool.query(
      `INSERT INTO portfolio_items (title, description, type, screenshot, website_url, app_store_url, play_store_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.title,
        data.description,
        data.type,
        data.screenshot,
        data.website_url,
        data.app_store_url,
        data.play_store_url,
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to create portfolio item" },
      { status: 500 }
    );
  }
}
