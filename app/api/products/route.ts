import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const db = getDB();
    const result = await db.prepare(
      "SELECT * FROM products ORDER BY sort_order ASC"
    );
    const products = await result.all();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const db = getDB();
    const body: {
      name: string;
      price: number;
      description?: string;
      image_url?: string;
      available?: boolean;
      sort_order?: number;
    } = await request.json();
    const { name, price, description, image_url, available, sort_order } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    const result = await db
      .prepare(
        `INSERT INTO products (name, price, description, image_url, available, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        name.trim(),
        price,
        description || null,
        image_url || null,
        available !== undefined ? (available ? 1 : 0) : 1,
        sort_order || 0
      )
      .run();

    const row = await db
      .prepare("SELECT * FROM products WHERE id = ?")
      .bind(result.meta.last_row_id)
      .first();

    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
