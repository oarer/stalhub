import { join } from 'node:path'
import { Resvg } from '@resvg/resvg-js'
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

export const runtime = 'nodejs'

const CACHE_HEADERS = {
	'Content-Type': 'image/png',
	'Cache-Control': 'public, max-age=3600, s-maxage=86400',
}

// resvg/fontdb cannot parse woff2 (rejects it as malformed), so the route
// uses a decompressed TTF copy of the cover font (see public/fonts/mts).
// The SVG font stack is 'CoverExtended', 'MTS Extended', … — browsers use
// the @font-face woff2, resvg resolves 'MTS Extended' from fontFiles below.
const COVER_FONT_FILE = join(
	process.cwd(),
	'public',
	'fonts',
	'mts',
	'MTSExtended-Medium.ttf'
)

function renderPng(svg: string): Uint8Array {
	const resvg = new Resvg(svg, {
		fitTo: { mode: 'width', value: 1200 },
		font: {
			loadSystemFonts: false,
			fontFiles: [COVER_FONT_FILE],
			defaultFontFamily: 'MTS Extended',
		},
	})
	return resvg.render().asPng()
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
			seed: article.id,
		})
		return new Response(Buffer.from(renderPng(svg)), {
			status: 200,
			headers: CACHE_HEADERS,
		})
	} catch {
		try {
			const fallback = buildBlogCoverSvg({
				title: 'Stalhub',
				seed: 'fallback',
			})
			return new Response(Buffer.from(renderPng(fallback)), {
				status: 200,
				headers: CACHE_HEADERS,
			})
		} catch {
			return new Response('OG render failed', { status: 500 })
		}
	}
}
