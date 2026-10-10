import { COVER_ICON_NAMES } from './blog-cover'

export interface ParsedIconName {
	prefix: string
	name: string
}

const BUNDLED = new Set<string>([...COVER_ICON_NAMES])

export function parseIconifyName(input: string): ParsedIconName | null {
	const v = input.trim().toLowerCase().replace(/\s+/g, '-')
	if (!v) return null
	const prefixed = v.match(/^([a-z0-9-]+):([a-z0-9-]+)$/)
	if (prefixed) return { prefix: prefixed[1], name: prefixed[2] }
	if (/^[a-z0-9-]+$/.test(v)) return { prefix: 'lucide', name: v }
	return null
}

export function isBundledCoverIcon(input: string): boolean {
	const parsed = parseIconifyName(input)
	if (!parsed || parsed.prefix !== 'lucide') return false
	return BUNDLED.has(parsed.name)
}

function sanitizeBody(body: unknown): string | null {
	if (typeof body !== 'string' || !body || body.length > 20000) return null
	if (/<script|on\w+\s*=|javascript:/i.test(body)) return null
	return body
}

const bodyCache = new Map<string, string | null>()

export async function fetchIconifyBody(
	prefix: string,
	name: string,
	signal?: AbortSignal
): Promise<string | null> {
	const key = `${prefix}:${name}`
	if (bodyCache.has(key)) return bodyCache.get(key) ?? null
	try {
		const res = await fetch(
			`https://api.iconify.design/${prefix}.json?icons=${name}`,
			{ signal }
		)
		if (!res.ok) {
			bodyCache.set(key, null)
			return null
		}
		const json = (await res.json()) as {
			icons?: Record<string, { body?: unknown }>
		}
		const clean = sanitizeBody(json?.icons?.[name]?.body)
		bodyCache.set(key, clean)
		return clean
	} catch {
		return null
	}
}
