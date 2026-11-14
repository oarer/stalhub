import { join } from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import type { NextRequest } from 'next/server'
import { buildContentOgSvg } from '@/lib/content-og'
import { tierListService } from '@/services/tier-list/tier-list.service'

export const runtime = 'nodejs'

const FONT_FILE = join(
	process.cwd(),
	'public',
	'fonts',
	'mts',
	'MTSExtended-Medium.ttf'
)

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const tierList = await tierListService.get(id)
		const svg = buildContentOgSvg({
			title: tierList.title,
			description: tierList.description,
			author: tierList.author?.username,
			stars: tierList.stars_count ?? 0,
			comments: tierList.comments_count ?? 0,
			type: 'ТИР-ЛИСТ',
		})
		const png = new Resvg(svg, {
			fitTo: { mode: 'width', value: 1200 },
			font: {
				loadSystemFonts: false,
				fontFiles: [FONT_FILE],
				defaultFontFamily: 'MTS Extended',
			},
		})
			.render()
			.asPng()
		return new Response(Buffer.from(png), {
			headers: {
				'Content-Type': 'image/png',
				'Cache-Control': 'public, max-age=3600, s-maxage=86400',
			},
		})
	} catch {
		return new Response('OG render failed', { status: 500 })
	}
}
