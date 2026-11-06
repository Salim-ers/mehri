import type { MetadataRoute } from "next";
import { identity } from "@/content/practice";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${identity.name} — ${identity.title} à ${identity.city}`,
    short_name: identity.name,
    start_url: "/",
    display: "browser",
    background_color: "#F6F1E9",
    theme_color: "#241A15",
    lang: "fr",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
