import { join } from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import type { NextRequest } from 'next/server'
import { buildContentOgSvg } from '@/lib/content-og'
import { postService } from '@/services/post/post.service'

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
		const post = await postService.get(id)
		const svg = buildContentOgSvg({
			author: post.author?.username ?? post.author_name ?? post.source,
			comments: post.comments_count ?? 0,
			description: post.content,
			stars: post.stars_count,
			title: post.title || 'Post',
			type: 'ПОСТ',
		})
		const png = new Resvg(svg, {
			fitTo: { mode: 'width', value: 1200 },
			font: {
				defaultFontFamily: 'MTS Extended',
				fontFiles: [FONT_FILE],
				loadSystemFonts: false,
			},
		})
			.render()
			.asPng()
		return new Response(Buffer.from(png), {
			headers: {
				'Cache-Control': 'public, max-age=3600, s-maxage=86400',
				'Content-Type': 'image/png',
			},
		})
	} catch {
		return new Response('OG render failed', { status: 500 })
	}
}
