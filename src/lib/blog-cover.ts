import type { IconifyIcon } from '@iconify/types'
import activity from '@iconify-icons/lucide/activity'
import bug from '@iconify-icons/lucide/bug'
import cpu from '@iconify-icons/lucide/cpu'
import flame from '@iconify-icons/lucide/flame'
import gauge from '@iconify-icons/lucide/gauge'
import packageIcon from '@iconify-icons/lucide/package'
import rocket from '@iconify-icons/lucide/rocket'
import sparkles from '@iconify-icons/lucide/sparkles'
import star from '@iconify-icons/lucide/star'
import trophy from '@iconify-icons/lucide/trophy'
import wrench from '@iconify-icons/lucide/wrench'
import zap from '@iconify-icons/lucide/zap'

export type BlogCoverPanelMode = 'auto' | 'custom' | 'hidden'

export const COVER_ICON_NAMES = [
	'zap',
	'flame',
	'gauge',
	'cpu',
	'rocket',
	'star',
	'wrench',
	'activity',
	'trophy',
	'bug',
	'sparkles',
	'package',
] as const

const COVER_ICONIFY_ICONS: Record<string, IconifyIcon> = {
	zap,
	flame,
	gauge,
	cpu,
	rocket,
	star,
	wrench,
	activity,
	trophy,
	bug,
	sparkles,
	package: packageIcon,
}

function resolveIconifyBody(icon: string): string | null {
	const name = icon.startsWith('lucide:')
		? icon.slice('lucide:'.length)
		: icon
	return COVER_ICONIFY_ICONS[name]?.body ?? null
}

export interface BlogCoverPanelRow {
	label: string
	value: string
	fill: number
	accent?: boolean
}

export interface BlogCoverPanel {
	title?: string | null
	rows?: BlogCoverPanelRow[]
}

export interface BlogCoverData {
	title: string
	subtitle?: string | null
	tags?: string[]
	readingMinutes?: number | null
	panel?: BlogCoverPanel | null
	mode?: BlogCoverPanelMode | null
	icon?: string | null
	iconBody?: string | null
	/**
	 * Raw CSS for a `<style>` block (e.g. embedded `@font-face`).
	 * Needed for standalone SVG contexts (OG images) without page CSS.
	 */
	fontFaceCss?: string | null
	seed?: string | number | null
	brand?: string | null
}

export const BLOG_COVER_WIDTH = 1200
export const BLOG_COVER_HEIGHT = 630

export const COVER_ACCENT_FALLBACK = '#b2e7fe'
const ACCENT_VAR = `var(--primary, ${COVER_ACCENT_FALLBACK})`

const BRAND_MARK = `
		<g>
			<g>
				<circle cx="256" cy="256" r="37.625" />
			</g>
		</g>
		<g>
			<g>
				<path d="M431.971,165.836c-3.742-1.656-7.59-3.247-11.516-4.784c0.632-4.169,1.179-8.297,1.615-12.365c6.022-56.115-7.497-96.739-38.069-114.389c-30.568-17.65-72.51-9.047-118.098,24.225c-3.305,2.412-6.606,4.95-9.902,7.582c-3.295-2.632-6.596-5.169-9.902-7.582C200.51,25.251,158.569,16.647,128,34.299c-30.572,17.65-44.091,58.273-38.069,114.389c0.436,4.068,0.983,8.195,1.615,12.365c-3.927,1.537-7.775,3.128-11.516,4.784C28.422,188.679,0,220.699,0,256s28.422,67.321,80.029,90.164c3.742,1.656,7.59,3.247,11.516,4.784c-0.632,4.169-1.179,8.297-1.615,12.365c-6.022,56.115,7.497,96.739,38.069,114.389c10.384,5.996,22.076,8.961,34.781,8.961c24.698,0,53.216-11.215,83.317-33.185c3.305-2.412,6.606-4.95,9.902-7.582c3.295,2.632,6.596,5.169,9.902,7.582c30.106,21.973,58.617,33.185,83.317,33.185c12.702,0,24.4-2.966,34.781-8.961c30.572-17.65,44.091-58.273,38.069-114.389c-0.436-4.068-0.983-8.195-1.615-12.365c3.927-1.537,7.775-3.128,11.516-4.784C483.578,323.323,512,291.302,512,256S483.578,188.679,431.971,165.836z M349.24,58.816c6.867,0,12.955,1.45,18.065,4.4c18.714,10.804,26.531,43.004,20.905,87.101c-19.906-5.576-41.377-9.838-63.865-12.693c-13.716-18.048-28.143-34.512-42.926-48.963C307.134,69.092,330.958,58.816,349.24,58.816z M139.084,297.838c3.424,6.514,6.997,13.009,10.728,19.47c3.731,6.462,7.57,12.802,11.497,19.024c-11.02-2.195-21.463-4.75-31.284-7.601C132.465,318.802,135.474,308.481,139.084,297.838z M130.023,183.267c9.822-2.851,20.263-5.405,31.284-7.601c-3.927,6.222-7.766,12.563-11.497,19.024c-3.731,6.461-7.304,12.959-10.728,19.47C135.474,203.518,132.465,193.199,130.023,183.267z M155.724,256c6.628-14.568,14.274-29.492,23.004-44.613c8.728-15.117,17.826-29.206,27.126-42.227c15.932-1.544,32.682-2.385,50.146-2.385c17.46,0,34.208,0.84,50.138,2.384c9.302,13.024,18.403,27.107,27.134,42.228c8.731,15.121,16.376,30.046,23.004,44.613c-6.628,14.568-14.275,29.492-23.004,44.613c-8.731,15.121-17.832,29.204-27.134,42.228c-15.93,1.544-32.678,2.384-50.138,2.384s-34.208-0.84-50.138-2.384c-9.302-13.024-18.403-27.107-27.134-42.228C169.997,285.493,162.352,270.568,155.724,256z M350.692,175.668c11.02,2.195,21.463,4.75,31.284,7.601c-2.442,9.931-5.451,20.251-9.06,30.894c-3.424-6.512-6.997-13.008-10.727-19.47C358.458,188.229,354.619,181.889,350.692,175.668z M362.189,317.31c3.731-6.461,7.304-12.958,10.727-19.47c3.61,10.643,6.618,20.962,9.06,30.894c-9.822,2.85-20.263,5.405-31.284,7.601C354.619,330.112,358.458,323.771,362.189,317.31z M255.999,110.533c7.381,7.081,14.815,14.848,22.226,23.295c-7.352-0.289-14.763-0.444-22.225-0.444c-7.461,0-14.871,0.155-22.221,0.444C241.189,125.384,248.621,117.612,255.999,110.533z M144.696,63.216c18.714-10.805,50.509-1.476,85.886,25.444c-14.782,14.451-29.21,30.915-42.926,48.963c-22.488,2.855-43.96,7.117-63.865,12.693C118.165,106.219,125.982,74.02,144.696,63.216z M98.371,317.656C57.368,300.479,33.391,277.609,33.391,256s23.977-44.478,64.978-61.656c5.123,20.028,12.169,40.753,20.941,61.656C110.539,276.903,103.494,297.628,98.371,317.656z M144.696,448.785c-18.714-10.804-26.531-43.004-20.905-87.101c19.906,5.576,41.377,9.838,63.865,12.693c13.716,18.048,28.143,34.512,42.926,48.963C195.204,450.26,163.411,459.589,144.696,448.785z M256,401.466c-7.379-7.08-14.813-14.847-22.225-23.294c7.352,0.289,14.763,0.444,22.225,0.444c7.462,0,14.874-0.155,22.225-0.444C270.813,386.619,263.38,394.386,256,401.466z M367.304,448.785c-18.715,10.805-50.509,1.476-85.885-25.445c14.782-14.451,29.208-30.915,42.926-48.963c22.488-2.855,43.96-7.117,63.865-12.693C393.835,405.781,386.018,437.981,367.304,448.785z M413.63,317.656c-5.123-20.027-12.169-40.753-20.94-61.656c8.772-20.903,15.816-41.628,20.94-61.656c41.001,17.178,64.978,40.047,64.978,61.656S454.632,300.479,413.63,317.656z" />
			</g>
		</g>`.trim()

export function escapeXml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;')
}

/** Deterministic 32-bit hash for decor variation. */
export function hashSeed(seed: string | number | null | undefined): number {
	const s = String(seed ?? '')
	let h = 2166136261
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i)
		h = Math.imul(h, 16777619)
	}
	return h >>> 0
}

/** Strip markdown to plain text for subtitle/excerpt. */
export function extractExcerpt(markdown: string, maxLen = 140): string {
	const plain = markdown
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[#>*_`~|-]/g, ' ')
		.replace(/<\/?[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
	if (plain.length <= maxLen) return plain
	const cut = plain.slice(0, maxLen)
	const lastSpace = cut.lastIndexOf(' ')
	return `${cut.slice(0, lastSpace > 40 ? lastSpace : maxLen).trim()}…`
}

export function estimateReadingMinutes(markdown: string): number {
	const words = markdown.trim().split(/\s+/).filter(Boolean).length
	return Math.max(1, Math.round(words / 180))
}

/**
 * Hard cap for any wrapped line. With min title size 40 and the 0.8
 * width factor, 20 chars always fit into 660px (20×40×0.8=640),
 * so the size formula can never overflow the panel.
 */
const HARD_LINE_CAP = 20

function wrapWords(text: string, maxChars: number, maxLines: number): string[] {
	const words = text.trim().split(/\s+/).filter(Boolean)
	if (!words.length) return []
	const lines: string[] = []
	let current = ''
	for (let i = 0; i < words.length; i++) {
		const word = words[i]
		const next = current ? `${current} ${word}` : word
		if (next.length <= maxChars) {
			current = next
		} else {
			if (current) lines.push(current)
			current = word
			if (lines.length === maxLines - 1) {
				lines.push(truncate(words.slice(i).join(' '), HARD_LINE_CAP))
				return lines.slice(0, maxLines)
			}
		}
	}
	if (current) {
		if (lines.length >= maxLines) {
			lines[maxLines - 1] = truncate(
				`${lines[maxLines - 1]} ${current}`,
				HARD_LINE_CAP
			)
		} else {
			lines.push(current)
		}
	}
	return lines.slice(0, maxLines)
}

function truncate(value: string, max: number): string {
	const v = value.trim()
	if (v.length <= max) return v
	const cut = v.slice(0, max - 1)
	const space = cut.lastIndexOf(' ')
	const base = space > max * 0.4 ? cut.slice(0, space) : cut
	return `${base.trim()}…`
}

function buildBadge(
	tag: string,
	x: number,
	y: number
): { svg: string; width: number } {
	const label = truncate(tag, 16)

	const width = Math.max(96, label.length * 13.5 + 44)
	const svg = `
		<g>
			<rect x="${x}" y="${y}" width="${width}" height="48" rx="24" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.28)" stroke-width="1.5" />
			<circle cx="${x + 24}" cy="${y + 24}" r="4" fill="${COVER_ACCENT_FALLBACK}" style="fill:${ACCENT_VAR}" />
			<text x="${x + 38}" y="${y + 31}" font-family="Arial, sans-serif" font-size="21" font-weight="600" fill="rgba(255,255,255,0.82)">${escapeXml(label)}</text>
		</g>`.trim()
	return { svg, width }
}

export function buildBlogCoverSvg(data: BlogCoverData): string {
	const title = data.title?.trim() || 'Stalhub'
	const subtitle = truncate(data.subtitle?.trim() || '', 120)
	const tags = (data.tags ?? []).filter(Boolean).slice(0, 3)
	const brand = (data.brand || 'stalhub').toLowerCase()
	const reading =
		data.readingMinutes && data.readingMinutes > 0
			? Math.min(30, Math.round(data.readingMinutes))
			: 3
	const h = hashSeed(data.seed ?? title)

	const lines = wrapWords(title, 16, 3)
	if (!lines.length) lines.push('Stalhub')
	const longest = lines.reduce((m, l) => Math.max(m, l.length), 0)

	const panelVisible = data.mode !== 'hidden'
	const fitWidth = panelVisible ? 660 : 1000
	const titleSize = Math.min(
		72,
		Math.max(40, Math.floor(fitWidth / (Math.max(longest, 4) * 0.8)))
	)
	const titleY = 300
	const lineHeight = titleSize * 1.02

	const titleSvg = lines
		.map((line, i) =>
			`
			<text x="84" y="${Math.round(titleY + i * lineHeight)}" font-family="'CoverExtended', 'Arial Black', Arial, sans-serif" font-size="${titleSize}" font-weight="500" letter-spacing="-2" fill="#ffffff">${escapeXml(line)}</text>`.trim()
		)
		.join('\n')

	const subtitleLines = subtitle ? wrapWords(subtitle, 28, 2) : []
	const subtitleY = titleY + lines.length * lineHeight - 5
	const subtitleSvg = subtitleLines
		.map((line, i) =>
			`
			<text x="86" y="${Math.round(subtitleY + i * 38)}" font-family="'CoverExtended', Arial, sans-serif" font-size="29" font-weight="500" fill="rgba(255,255,255,0.62)">${escapeXml(line)}</text>`.trim()
		)
		.join('\n')

	let badgeX = 84
	const badgeY = 508
	const badgesSvg = tags
		.map((tag) => {
			const b = buildBadge(tag, badgeX, badgeY)
			badgeX += b.width + 14
			return b.svg
		})
		.join('\n')

	const customRows = (data.panel?.rows ?? [])
		.filter((r) => r && (r.label?.trim() || r.value?.trim()))
		.slice(0, 2)
		.map((r) => ({
			label: truncate(r.label ?? '', 24),
			value: truncate(r.value ?? '', 16),
			fill: Math.min(1, Math.max(0, Number(r.fill) || 0)),
			accent: r.accent === true,
		}))
	const panelTitle = truncate(
		data.panel?.title?.trim() || 'STALHUB · БЛОГ',
		40
	)
	const autoRows =
		customRows.length > 0
			? null
			: [
					{
						label: 'На чтение',
						value: `~${reading} мин`,
						fill: Math.min(1, reading / 10),
						accent: true,
					},
				]
	const panelRows = customRows.length > 0 ? customRows : (autoRows ?? [])
	const rowYs = [222, 306]

	const panelRowsSvg = panelRows
		.map((row, i) => {
			const y = rowYs[i]
			const w = Math.max(24, Math.round(284 * row.fill))
			const valueFill = row.accent
				? `fill="${COVER_ACCENT_FALLBACK}" style="fill:${ACCENT_VAR}"`
				: 'fill="#ffffff"'
			const barFill = row.accent ? 'url(#bar)' : '#3b3b40'
			return `
			<text x="802" y="${y}" font-family="Arial, sans-serif" font-size="19" font-weight="700" fill="rgba(255,255,255,0.5)">${escapeXml(row.label)}</text>
			<text x="1078" y="${y}" text-anchor="end" font-family="Arial, sans-serif" font-size="22" font-weight="800" ${valueFill}>${escapeXml(row.value)}</text>
			<rect x="802" y="${y + 14}" width="284" height="26" rx="13" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.25)" stroke-width="1.2"  />
			<rect x="802" y="${y + 14}" width="${w}" height="26" rx="13" fill="${barFill}" />`.trim()
		})
		.join('\n')

	const glowCx = 880 + (h % 160)
	const gridOpacity = 0.5 + ((h >> 8) % 20) / 100

	const cornerIconValue = (data.icon ?? '').trim()
	const bundledBody = cornerIconValue
		? resolveIconifyBody(cornerIconValue)
		: null
	const remoteBody = (data.iconBody ?? '').trim() || null
	const iconifyBody = remoteBody ?? bundledBody

	const cornerText =
		!cornerIconValue || iconifyBody || cornerIconValue.startsWith('lucide:')
			? ''
			: truncate(cornerIconValue, 8)
	const cornerIconSvg =
		iconifyBody || cornerText
			? `
	<g>
		<rect x="76" y="72" width="76" height="76" rx="18" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.28)" stroke-width="1.5" />
		${
			iconifyBody
				? `<g transform="translate(114,112) scale(1.6667) translate(-12,-12)" style="color:rgba(255,255,255,0.9)">${iconifyBody}</g>`
				: `<text x="114" y="112" text-anchor="middle" dominant-baseline="central" font-family="Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif" font-size="40" fill="rgba(255,255,255,0.9)">${escapeXml(cornerText)}</text>`
		}
	</g>`.trim()
			: ''

	return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BLOG_COVER_WIDTH} ${BLOG_COVER_HEIGHT}" width="${BLOG_COVER_WIDTH}" height="${BLOG_COVER_HEIGHT}" role="img">
	<title>${escapeXml(title)}</title>
	<defs>
		${data.fontFaceCss ? `<style>${data.fontFaceCss}</style>` : ''}
		<pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
			<path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,${gridOpacity * 0.14})" stroke-width="1" />
		</pattern>
		<radialGradient id="vignette" cx="38%" cy="36%" r="85%">
			<stop offset="0%" stop-color="#1d1d20" />
			<stop offset="55%" stop-color="#101012" />
			<stop offset="100%" stop-color="#08080a" />
		</radialGradient>
		<radialGradient id="glow" cx="50%" cy="50%" r="50%">
			<stop offset="0%" stop-color="${COVER_ACCENT_FALLBACK}" stop-opacity="0.20" style="stop-color:${ACCENT_VAR}" />
			<stop offset="100%" stop-color="${COVER_ACCENT_FALLBACK}" stop-opacity="0" style="stop-color:${ACCENT_VAR}" />
		</radialGradient>
		<linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0%" stop-color="${COVER_ACCENT_FALLBACK}" style="stop-color:${ACCENT_VAR}" />
			<stop offset="100%" stop-color="${COVER_ACCENT_FALLBACK}" stop-opacity="0.45" style="stop-color:${ACCENT_VAR}" />
		</linearGradient>
	</defs>

	<rect width="1200" height="630" fill="#0a0a0c" />
	<rect width="1200" height="630" fill="url(#vignette)" />
	<rect width="1200" height="630" fill="url(#grid)" />
	<ellipse cx="${glowCx}" cy="90" rx="330" ry="190" fill="url(#glow)" />

	${cornerIconSvg}

	${titleSvg}
	${subtitleSvg}

	${
		panelVisible
			? `
	<g>
		<rect x="772" y="128" width="344" height="248" rx="30" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.28)" stroke-width="1.5" />
		<text x="802" y="172" font-family="Arial, sans-serif" font-size="21" font-weight="600" letter-spacing="1.5" fill="rgba(255,255,255,0.72)">${escapeXml(panelTitle)}</text>

		${panelRowsSvg}
	</g>`
			: ''
	}

	${badgesSvg}

	<g>
		<g transform="translate(932,538) scale(0.09)" fill="#ffffff" style="fill:#ffffff">
			${BRAND_MARK}
		</g>
		<text x="992" y="570" font-family="'CoverExtended', Arial, sans-serif" font-size="30" font-weight="500" fill="#ffffff">${escapeXml(brand)}</text>
	</g>
</svg>`.trim()
}

export function blogCoverDataUrl(data: BlogCoverData): string {
	return `data:image/svg+xml;utf8,${encodeURIComponent(buildBlogCoverSvg(data))}`
}
