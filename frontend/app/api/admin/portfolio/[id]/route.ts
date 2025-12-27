import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pool = getDbPool();
    const result = await pool.query(
      "SELECT * FROM portfolio_items WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const pool = getDbPool();

    const result = await pool.query(
      `UPDATE portfolio_items 
       SET title = $1, description = $2, type = $3, screenshot = $4, 
           website_url = $5, app_store_url = $6, play_store_url = $7
       WHERE id = $8
       RETURNING *`,
      [
        data.title,
        data.description,
        data.type,
        data.screenshot,
        data.website_url,
        data.app_store_url,
        data.play_store_url,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to update portfolio item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pool = getDbPool();

    const result = await pool.query(
      "DELETE FROM portfolio_items WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to delete portfolio item" },
      { status: 500 }
    );
  }
}
