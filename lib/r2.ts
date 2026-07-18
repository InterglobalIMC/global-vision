import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getR2() {
  const ctx = getCloudflareContext();
  return ctx.env.IMAGES_BUCKET;
}

export async function uploadImage(file: File): Promise<string> {
  const bucket = getR2();
  const key = `products/${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();

  await bucket.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type,
    },
  });

  return key;
}

export function getImageUrl(key: string): string {
  return `/api/images/${key}`;
}
