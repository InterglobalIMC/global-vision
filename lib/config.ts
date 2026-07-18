import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getEnv() {
  const ctx = getCloudflareContext();
  return {
    WHATSAPP_NUMBER: ctx.env.WHATSAPP_NUMBER,
    BUSINESS_NAME: ctx.env.BUSINESS_NAME,
  };
}
