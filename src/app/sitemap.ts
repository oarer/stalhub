import type { MetadataRoute } from "next"
import meta from "@/constants/meta.json"

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://stalhub.tech"

    const pages = Object.keys(meta).filter(
        (key) => key !== "base" && key !== "notFound"
    )

    return pages.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: route === "/" ? 1 : 0.7,
    }))
}