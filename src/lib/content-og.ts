import { escapeXml, hashSeed } from './blog-cover'

export interface ContentOgData {
	title: string
	description?: string | null
	author?: string | null
	stars: number
	comments: number
	type: string
}

export function buildContentOgSvg(data: ContentOgData): string {
	const title = data.title.trim() || 'Stalhub'
	const description = (data.description ?? '').trim().slice(0, 180)
	const author = data.author?.trim() || 'stalhub'
	const initial = author.charAt(0).toUpperCase()
	const seed = hashSeed(title)
	const glow = `hsl(${seed % 360} 75% 60% / 0.3)`

	return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
	<defs>
		<pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
			<path d="M32 0H0V32" fill="none" stroke="rgba(255,255,255,.08)" />
		</pattern>
		<radialGradient id="glow" cx="80%" cy="12%" r="65%">
			<stop offset="0" stop-color="${glow}" />
			<stop offset="1" stop-color="rgba(0,0,0,0)" />
		</radialGradient>
	</defs>
	<rect width="1200" height="630" fill="#0b0b0e" />
	<rect width="1200" height="630" fill="url(#grid)" />
	<rect width="1200" height="630" fill="url(#glow)" />
	<text x="84" y="96" fill="#b2e7fe" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="3">${escapeXml(data.type)}</text>
	<text x="84" y="224" fill="#fff" font-family="Arial, sans-serif" font-size="68" font-weight="700">${escapeXml(title.slice(0, 34))}</text>
	${description ? `<text x="88" y="286" fill="rgba(255,255,255,.68)" font-family="Arial, sans-serif" font-size="28">${escapeXml(description.slice(0, 68))}</text>` : ''}
	<rect x="72" y="430" width="1056" height="122" rx="24" fill="rgba(255,255,255,.045)" stroke="rgba(255,255,255,.2)" />
	<circle cx="128" cy="491" r="31" fill="#b2e7fe" />
	<text x="128" y="502" text-anchor="middle" fill="#0b0b0e" font-family="Arial, sans-serif" font-size="28" font-weight="700">${escapeXml(initial)}</text>
	<text x="182" y="486" fill="#fff" font-family="Arial, sans-serif" font-size="28" font-weight="700">@${escapeXml(author)}</text>
	<text x="182" y="521" fill="rgba(255,255,255,.58)" font-family="Arial, sans-serif" font-size="22">★ ${data.stars} · 💬 ${data.comments}</text>
	<text x="1080" y="503" text-anchor="end" fill="#b2e7fe" font-family="Arial, sans-serif" font-size="26" font-weight="700">stalhub.dev</text>
</svg>`.trim()
}
