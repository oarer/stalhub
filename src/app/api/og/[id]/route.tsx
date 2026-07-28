import type { NextRequest } from 'next/server'
import { articleService } from '@/services/article/article.service'

const color = {
	bg: '#012E46',
	text: '#f8fafc',
	muted: '#c2c2c2',
	subtle: '#64748b',
	border: '#263449',
	accent: '#b8e6fe',
}

const TAG_OFFSET = 150

const GRID = {
	cellSize: 40,
	lineWidth: 1,
	color: 'rgba(255,255,255,0.06)',
}

function esc(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
}

function truncate(str: string, max: number): string {
	return str.length > max ? `${str.slice(0, max - 1)}…` : str
}

async function fetchAvatarDataUri(userId: number): Promise<string | null> {
	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/v1/users/avatar/${userId}`, {
			headers: { Accept: 'image/*' },
		})

		if (!res.ok) return null

		const mime = res.headers.get('content-type')?.includes('png')
			? 'image/png'
			: 'image/jpeg'

		const buf = await res.arrayBuffer()
		const b64 = Buffer.from(buf).toString('base64')
		return `data:${mime};base64,${b64}`
	} catch {
		return null
	}
}

function svgAvatar(dataUri: string | null, initial: string): string {
	if (dataUri) {
		return `
			<clipPath id="avatarClip">
				<circle cx="100" cy="535" r="24"/>
			</clipPath>
			<image
				x="76" y="511" width="48" height="48"
				href="${dataUri}"
				clip-path="url(#avatarClip)"
				preserveAspectRatio="xMidYMid slice"
			/>`
	}

	return `
		<circle cx="100" cy="535" r="24" fill="${color.accent}"/>
		<text
			x="100" y="542"
			fill="#fff"
			font-family="Arial, sans-serif"
			font-size="20" font-weight="700"
			text-anchor="middle"
		>${initial}</text>`
}

function svgTags(tags: string[]): string {
	return tags
		.map(
			(tag, i) => `
		<text
			x="${80 + i * TAG_OFFSET}" y="600"
			fill="${color.accent}"
			font-family="Arial, sans-serif"
			font-size="17"
		>#${tag}</text>`
		)
		.join('\n')
}

function gridDefs(): string {
	const { cellSize, lineWidth, color } = GRID
	return `
	<pattern
		id="grid"
		width="${cellSize}" height="${cellSize}"
		patternUnits="userSpaceOnUse"
	>
		<line
			x1="0" y1="0" x2="${cellSize}" y2="0"
			stroke="${color}" stroke-width="${lineWidth}"
		/>
		<line
			x1="0" y1="0" x2="0" y2="${cellSize}"
			stroke="${color}" stroke-width="${lineWidth}"
		/>
	</pattern>`
}

function svgMain(
	title: string,
	author: string,
	avatarUri: string | null,
	tags: string[]
): string {
	return `
<svg
	xmlns="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink"
	width="1200" height="630"
	viewBox="0 0 1200 630"
>
	<defs>${gridDefs()}</defs>

	<rect width="1200" height="630" fill="${color.bg}"/>
	<rect width="1200" height="630" fill="url(#grid)"/>
	<rect width="1200" height="6" fill="${color.accent}70"/>

	<text
		x="80" y="100"
		fill="${color.accent}"
		font-family="Arial, sans-serif"
		font-size="20" font-weight="700"
		letter-spacing="1"
	>STALHUB / СТАТЬИ</text>

	<text
		x="80" y="180"
		fill="${color.text}"
		font-family="Arial, sans-serif"
		font-size="52" font-weight="700"
	>${title}</text>

	<line
		x1="80" y1="440" x2="1120" y2="440"
		stroke="${color.accent}50" stroke-width="2"
	/>

	${svgAvatar(avatarUri, author[0]?.toUpperCase() ?? '?')}

	<text
		x="140" y="530"
		fill="${color.text}"
		font-family="Arial, sans-serif"
		font-size="20" font-weight="600"
	>${author}</text>

	<text
		x="140" y="558"
		fill="${color.subtle}"
		font-family="Arial, sans-serif"
		font-size="16" font-weight="700"
	>stalhub.dev</text>

	${svgTags(tags)}
</svg>`
}

function svgFallback(): string {
	return `
<svg
	xmlns="http://www.w3.org/2000/svg"
	width="1200" height="630"
	viewBox="0 0 1200 630"
>
	<defs>${gridDefs()}</defs>

	<rect width="1200" height="630" fill="${color.bg}"/>
	<rect width="1200" height="630" fill="url(#grid)"/>
	<rect width="1200" height="6" fill="${color.accent}"/>

	<text
		x="600" y="300"
		fill="${color.text}"
		font-family="Arial, sans-serif"
		font-size="52" font-weight="700"
		text-anchor="middle"
	>STALHUB</text>

	<text
		x="600" y="350"
		fill="${color.muted}"
		font-family="Arial, sans-serif"
		font-size="22"
		text-anchor="middle"
	>stalhub.tech</text>
</svg>`
}

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const article = await articleService.get(id)

		const title = esc(truncate(article.title, 100))
		const author = esc(article.author.username)
		const tags = article.tags.slice(0, 4).map(esc)
		const avatarUri = await fetchAvatarDataUri(article.author.id)

		const svg = svgMain(title, author, avatarUri, tags)
		return new Response(svg, {
			status: 200,
			headers: { 'Content-Type': 'image/svg+xml' },
		})
	} catch {
		return new Response(svgFallback(), {
			status: 200,
			headers: { 'Content-Type': 'image/svg+xml' },
		})
	}
}
