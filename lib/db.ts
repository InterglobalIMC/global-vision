import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getDB() {
  const ctx = getCloudflareContext();
  return ctx.env.DB;
}
