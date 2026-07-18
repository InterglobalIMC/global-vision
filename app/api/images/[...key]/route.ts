import { NextResponse } from "next/server";
import { getR2 } from "@/lib/r2";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await params;
    const objectKey = key.join("/");
    const bucket = getR2();
    const object = await bucket.get(objectKey);

    if (!object) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      object.httpMetadata?.contentType || "image/jpeg"
    );
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(object.body, { headers });
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
