import type { MetadataRoute } from 'next'
import { GITHUB_RAW_BASE } from '@/constants/github.const'
import meta from '@/constants/meta.json'

const SITE_URL =
	process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
	'https://stalhub.dev'

type ItemListingEntry = {
	data?: string
	updated_at?: string
	updatedAt?: string
}

async function fetchJson<T>(url: string, timeoutMs = 8000): Promise<T | null> {
	try {
		const controller = new AbortController()
		const timeout = setTimeout(() => controller.abort(), timeoutMs)
		const res = await fetch(url, {
			next: { revalidate: 3600 },
			signal: controller.signal,
		})
		clearTimeout(timeout)
		if (!res.ok) return null
		return (await res.json()) as T
	} catch {
		return null
	}
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const staticRoutes = Object.keys(meta).filter(
		(key) =>
			key !== 'base' &&
			key !== 'notFound' &&
			!key.startsWith('/me') &&
			!key.startsWith('/admin') &&
			!key.startsWith('/auth')
	)

	const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
		url: `${SITE_URL}${route}`,
		lastModified: new Date(),
		changeFrequency: route === '/' ? 'daily' : 'weekly',
		priority: route === '/' ? 1 : 0.7,
	}))

	const [articles, arts, items, tierLists] = await Promise.all([
		fetchJson<{ data?: Array<{ id: string; updated_at?: string }> }>(
			`${process.env.NEXT_PUBLIC_API}/api/v1/articles/public?take=100&page=1`
		),
		fetchJson<{ data?: Array<{ id: string; updated_at?: string }> }>(
			`${process.env.NEXT_PUBLIC_API}/api/v1/arts/public?take=100&page=1`
		),
		fetchJson<ItemListingEntry[]>(`${GITHUB_RAW_BASE}/listing.json`),
		fetchJson<{ data?: Array<{ id: string; updated_at?: string }> }>(
			`${process.env.NEXT_PUBLIC_API}/api/v1/tier-lists?take=100&page=1`
		),
	])

	const dynamicEntries: MetadataRoute.Sitemap = []

	for (const a of articles?.data ?? []) {
		dynamicEntries.push({
			url: `${SITE_URL}/articles/${a.id}`,
			lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
			changeFrequency: 'weekly',
			priority: 0.8,
		})
		dynamicEntries.push({
			url: `${SITE_URL}/blog/${a.id}`,
			lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
			changeFrequency: 'weekly',
			priority: 0.8,
		})
	}

	for (const art of arts?.data ?? []) {
		dynamicEntries.push({
			url: `${SITE_URL}/arts/${art.id}`,
			lastModified: art.updated_at
				? new Date(art.updated_at)
				: new Date(),
			changeFrequency: 'weekly',
			priority: 0.8,
		})
	}

	if (Array.isArray(items)) {
		for (const item of items.slice(0, 5000)) {
			if (!item.data) continue
			const route = item.data.replace(/\.json$/, '')
			dynamicEntries.push({
				url: `${SITE_URL}${route}`,
				lastModified:
					item.updated_at || item.updatedAt
						? new Date(
								(item.updated_at ?? item.updatedAt) as string
							)
						: new Date(),
				changeFrequency: 'monthly',
				priority: 0.6,
			})
		}
	}

	for (const t of tierLists?.data ?? []) {
		dynamicEntries.push({
			url: `${SITE_URL}/tierlists/${t.id}`,
			lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
			changeFrequency: 'weekly',
			priority: 0.6,
		})
	}

	return [...staticEntries, ...dynamicEntries]
}
