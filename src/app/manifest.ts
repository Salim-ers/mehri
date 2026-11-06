import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mohamed Merhi — Ostéopathe D.O. à Creil",
    short_name: "M. Merhi Ostéo",
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
