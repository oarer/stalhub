import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { NextRequest } from 'next/server'
import {
	buildBlogCoverSvg,
	estimateReadingMinutes,
	extractExcerpt,
} from '@/lib/blog-cover'
import {
	fetchIconifyBody,
	isBundledCoverIcon,
	parseIconifyName,
} from '@/lib/iconify'
import { articleService } from '@/services/article/article.service'

const CACHE_HEADERS = {
	'Content-Type': 'image/svg+xml; charset=utf-8',
	'Cache-Control': 'public, max-age=3600, s-maxage=86400',
}

let fontFaceCssPromise: Promise<string | null> | null = null

/** Embed the cover font as base64 — standalone SVG has no page CSS. */
function getFontFaceCss(): Promise<string | null> {
	if (!fontFaceCssPromise) {
		fontFaceCssPromise = readFile(
			join(
				process.cwd(),
				'public',
				'fonts',
				'mts',
				'MTSExtended-Medium.woff2'
			)
		)
			.then(
				(buf) =>
					`@font-face{font-family:'CoverExtended';src:url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2');font-weight:500;font-style:normal;}`
			)
			.catch(() => null)
	}
	return fontFaceCssPromise
}

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const article = await articleService.get(id)

		const icon = article.cover_config?.icon ?? null
		const parsed = icon ? parseIconifyName(icon) : null
		let iconBody: string | null = null
		if (parsed && !isBundledCoverIcon(icon ?? '')) {
			try {
				const controller = new AbortController()
				const timeout = setTimeout(() => controller.abort(), 4000)
				iconBody = await fetchIconifyBody(
					parsed.prefix,
					parsed.name,
					controller.signal
				)
				clearTimeout(timeout)
			} catch {
				iconBody = null
			}
		}

		const svg = buildBlogCoverSvg({
			title: article.title,
			subtitle: extractExcerpt(article.content ?? '', 110),
			tags: article.tags.slice(0, 3),
			readingMinutes: estimateReadingMinutes(article.content ?? ''),
			panel: article.cover_config?.panel ?? null,
			mode: article.cover_config?.mode ?? null,
			icon,
			iconBody,
			fontFaceCss: await getFontFaceCss(),
			seed: article.id,
		})
		return new Response(svg, { status: 200, headers: CACHE_HEADERS })
	} catch {
		return new Response(
			buildBlogCoverSvg({ title: 'Stalhub', seed: 'fallback' }),
			{ status: 200, headers: CACHE_HEADERS }
		)
	}
}
