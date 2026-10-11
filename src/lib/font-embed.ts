/**
 * Builds the `@font-face` CSS needed to render captured nodes.
 *
 * `html-to-image` normally scrapes `document.styleSheets`, but in production
 * Next.js serves the CSS from a CDN (`assetPrefix`), which makes the sheets
 * cross-origin. Reading `sheet.cssRules` then throws and the web fonts are
 * never embedded into the exported SVG, so users without a locally cached
 * font end up with the Arial fallback. The cross-origin sheet can still be
 * fetched (CORS is enabled), so we resolve the faces ourselves and pass the
 * result to `html-to-image` via the `fontEmbedCSS` option.
 */

const FONT_FACE_REGEX = /@font-face\s*\{[^}]*\}/gi
const FONT_FAMILY_REGEX = /font-family\s*:\s*([^;}]+)/i
const FONT_URL_REGEX = /url\(\s*(['"]?)([^'")]+?)\1\s*\)/gi

type FontFaceSource = {
	baseUrl: string
	family: string
	text: string
}

let sourcesCache: Promise<FontFaceSource[]> | null = null
const cssCache = new Map<string, Promise<string>>()
const dataUrlCache = new Map<string, Promise<string | null>>()

function normalizeFamily(value: string): string {
	return value
		.trim()
		.replace(/^["']|["']$/g, '')
		.trim()
		.toLowerCase()
}

function getUsedFamilies(root: HTMLElement): Set<string> {
	const families = new Set<string>()
	const walk = (element: Element) => {
		const family = window.getComputedStyle(element).fontFamily
		for (const part of family.split(',')) {
			const normalized = normalizeFamily(part)
			if (normalized) families.add(normalized)
		}
		for (const child of Array.from(element.children)) walk(child)
	}
	walk(root)
	return families
}

async function fetchText(url: string): Promise<string | null> {
	try {
		const response = await fetch(url)
		if (!response.ok) return null
		return await response.text()
	} catch {
		return null
	}
}

function fetchDataUrl(url: string): Promise<string | null> {
	const cached = dataUrlCache.get(url)
	if (cached) return cached

	const request = (async () => {
		try {
			const response = await fetch(url)
			if (!response.ok) return null
			const blob = await response.blob()
			return await new Promise<string | null>((resolve, reject) => {
				const reader = new FileReader()
				reader.onload = () => resolve(String(reader.result))
				reader.onerror = () => reject(reader.error)
				reader.readAsDataURL(blob)
			})
		} catch {
			return null
		}
	})()

	dataUrlCache.set(url, request)
	return request
}

function extractSources(cssText: string, baseUrl: string): FontFaceSource[] {
	const sources: FontFaceSource[] = []
	for (const match of cssText.matchAll(FONT_FACE_REGEX)) {
		const text = match[0]
		const familyMatch = text.match(FONT_FAMILY_REGEX)
		if (!familyMatch) continue
		sources.push({
			baseUrl,
			family: normalizeFamily(familyMatch[1]),
			text,
		})
	}
	return sources
}

async function collectFontFaceSources(): Promise<FontFaceSource[]> {
	const sources: FontFaceSource[] = []

	for (const sheet of Array.from(document.styleSheets)) {
		try {
			for (const rule of Array.from(sheet.cssRules)) {
				if (rule.type !== CSSRule.FONT_FACE_RULE) continue
				const familyMatch = rule.cssText.match(FONT_FAMILY_REGEX)
				if (!familyMatch) continue
				sources.push({
					baseUrl: sheet.href ?? document.baseURI,
					family: normalizeFamily(familyMatch[1]),
					text: rule.cssText,
				})
			}
		} catch {
			if (!sheet.href) continue
			const cssText = await fetchText(sheet.href)
			if (!cssText) continue
			sources.push(...extractSources(cssText, sheet.href))
		}
	}

	return sources
}

async function embedUrls(text: string, baseUrl: string): Promise<string> {
	let result = text
	for (const match of text.matchAll(FONT_URL_REGEX)) {
		const rawUrl = match[2]
		if (!rawUrl || rawUrl.startsWith('data:')) continue
		let absoluteUrl: string
		try {
			absoluteUrl = new URL(rawUrl, baseUrl).href
		} catch {
			continue
		}
		const dataUrl = await fetchDataUrl(absoluteUrl)
		if (dataUrl) result = result.replaceAll(rawUrl, dataUrl)
	}
	return result
}

export async function getFontEmbedCss(root: HTMLElement): Promise<string> {
	sourcesCache ??= collectFontFaceSources()

	const usedFamilies = Array.from(getUsedFamilies(root)).sort()
	const key = usedFamilies.join('|')

	const cached = cssCache.get(key)
	if (cached) return cached

	const request = (async () => {
		const sources = await sourcesCache
		const used = sources.filter((source) =>
			usedFamilies.includes(source.family)
		)
		const embedded = await Promise.all(
			used.map((source) => embedUrls(source.text, source.baseUrl))
		)
		return embedded.join('\n')
	})()

	cssCache.set(key, request)
	return request
}
