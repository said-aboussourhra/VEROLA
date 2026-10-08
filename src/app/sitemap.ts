import type { MetadataRoute } from "next";
import { SHOP } from "@/lib/shop";
import { CATALOG } from "@/lib/pricing";
import { POSTS } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SHOP.siteUrl.replace(/\/$/, "");
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/order`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/customize`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/designs`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/portfolio`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/legal`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    ...CATALOG.map((p) => ({
      url: `${base}/products/${p.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...POSTS.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
