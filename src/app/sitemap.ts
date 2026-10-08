import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://velora.ma";
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/order`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/portfolio`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/legal`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
