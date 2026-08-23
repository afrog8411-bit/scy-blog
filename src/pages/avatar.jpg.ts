import type { APIRoute } from "astro";
import { createAvatarJpeg } from "../lib/avatar";
import { SITE_SETTINGS } from "../lib/siteSettings";

export const GET: APIRoute = async () => {
  const jpeg = await createAvatarJpeg(SITE_SETTINGS.shared.profileImage);
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg" },
  });
};
