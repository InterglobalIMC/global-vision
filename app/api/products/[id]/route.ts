import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDB();
    const result = await db.prepare("SELECT * FROM products WHERE id = ?");
    const product = await result.bind(id).first();
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
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
    const db = getDB();
    const body: {
      name?: string;
      price?: number;
      description?: string;
      image_url?: string;
      available?: boolean;
      sort_order?: number;
    } = await request.json();
    const { name, price, description, image_url, available, sort_order } = body;

    const existing = await db
      .prepare("SELECT * FROM products WHERE id = ?")
      .bind(id)
      .first();

    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
      return NextResponse.json(
        { error: "Name cannot be empty" },
        { status: 400 }
      );
    }

    if (price !== undefined && (typeof price !== "number" || price < 0)) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    await db
      .prepare(
        `UPDATE products 
         SET name = ?, price = ?, description = ?, image_url = ?, available = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      )
      .bind(
        name !== undefined ? name.trim() : existing.name,
        price !== undefined ? price : existing.price,
        description !== undefined ? description : existing.description,
        image_url !== undefined ? image_url : existing.image_url,
        available !== undefined ? (available ? 1 : 0) : existing.available,
        sort_order !== undefined ? sort_order : existing.sort_order,
        id
      );

    const updated = await db
      .prepare("SELECT * FROM products WHERE id = ?")
      .bind(id)
      .first();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
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
    const db = getDB();

    const existing = await db
      .prepare("SELECT * FROM products WHERE id = ?")
      .bind(id)
      .first();

    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    await db.prepare("DELETE FROM products WHERE id = ?").bind(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
