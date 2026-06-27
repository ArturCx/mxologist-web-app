import type { MetadataRoute } from "next";

// PWA manifest (App Router file convention). Colors track the default
// "midnight" theme (deep navy); icons come from the generated favicon set
// in /public.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mxologist",
    short_name: "Mxologist",
    description:
      "Find cocktails you can make with the bottles you already have.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c1322",
    theme_color: "#0c1322",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
