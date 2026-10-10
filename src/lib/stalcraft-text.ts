export const STALCRAFT_COLORS: Record<string, string> = {
	'0': '#000000',
	'1': '#0000AA',
	'2': '#00AA00',
	'3': '#00AAAA',
	'4': '#AA0000',
	'5': '#AA00AA',
	'6': '#FFAA00',
	'7': '#AAAAAA',
	'8': '#555555',
	'9': '#5555FF',
	A: '#55FF55',
	B: '#55FFFF',
	C: '#FF5555',
	D: '#FF55FF',
	E: '#FFFF55',
	F: '#FFFFFF',
	R: '#FFFFFF',
	a: '#55FF55',
	b: '#55FFFF',
	c: '#FF5555',
	d: '#FF55FF',
	e: '#FFFF55',
	f: '#FFFFFF',
	r: '#FFFFFF',
}

export type StalSegment = { text: string; color: string }

function hexToRgb(hex: string): [number, number, number] {
	const h = hex.replace('#', '')
	return [
		parseInt(h.slice(0, 2), 16),
		parseInt(h.slice(2, 4), 16),
		parseInt(h.slice(4, 6), 16),
	]
}

function rgbToHex(r: number, g: number, b: number): string {
	const c = (n: number) =>
		Math.max(0, Math.min(255, Math.round(n)))
			.toString(16)
			.padStart(2, '0')
			.toUpperCase()
	return `#${c(r)}${c(g)}${c(b)}`
}

export function lerpColor(from: string, to: string, t: number): string {
	const [r1, g1, b1] = hexToRgb(from)
	const [r2, g2, b2] = hexToRgb(to)
	return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t)
}

export function buildGradient(
	text: string,
	from: string,
	to: string,
	mid?: string
): string {
	return buildMultiGradient(text, mid ? [from, mid, to] : [from, to])
}

export function colorAtStops(colors: string[], t: number): string {
	const stops = colors.filter(Boolean)
	if (stops.length === 0) return '#FFFFFF'
	if (stops.length === 1) return stops[0]
	const clamped = Math.min(1, Math.max(0, t))
	const segments = stops.length - 1
	const pos = clamped * segments
	const idx = Math.min(Math.floor(pos), segments - 1)
	return lerpColor(stops[idx], stops[idx + 1], pos - idx)
}

export function buildMultiGradient(text: string, colors: string[]): string {
	const stops = colors.filter(Boolean)
	if (stops.length === 0) return text
	const chars = [...text]
	if (chars.length === 0) return ''
	if (stops.length === 1) return `§${stops[0]}${text}§R`
	if (chars.length === 1) return `§${stops[0]}${chars[0]}§R`
	return (
		chars
			.map((ch, i) => {
				if (ch === '\n') return '\n'
				const t = i / (chars.length - 1)
				return `§${colorAtStops(stops, t)}${ch}`
			})
			.join('') + '§R'
	)
}

export function countColorCodes(input: string): number {
	return input.match(/§(?:#[0-9A-Fa-f]{6}|[0-9A-Fa-f])/g)?.length ?? 0
}

export type CompressedGradient = {
	text: string
	runs: number
	compressed: boolean
	fits: boolean
}

export function buildCompressedGradient(
	text: string,
	colors: string[],
	limit: number
): CompressedGradient {
	const stops = colors.filter(Boolean)
	const chars = [...text]
	const coded = chars.filter((ch) => ch !== '\n')
	if (coded.length === 0)
		return { text, runs: 0, compressed: false, fits: text.length <= limit }
	if (stops.length === 0)
		return { text, runs: 0, compressed: false, fits: text.length <= limit }

	const plainLen = chars.length
	if (plainLen + coded.length * 8 + 2 <= limit) {
		return {
			text: buildMultiGradient(text, stops),
			runs: coded.length,
			compressed: false,
			fits: true,
		}
	}

	const maxRuns = Math.floor((limit - plainLen - 2) / 8)
	if (maxRuns < 1) {
		const solid = `§${stops[0]}${text}§R`
		return {
			text: solid,
			runs: 1,
			compressed: true,
			fits: solid.length <= limit,
		}
	}

	const k = Math.min(maxRuns, coded.length)
	let out = ''
	let currentRun = -1
	let m = -1
	for (const ch of chars) {
		if (ch === '\n') {
			out += '\n'
			continue
		}
		m += 1
		const r = Math.min(Math.floor((m * k) / coded.length), k - 1)
		if (r !== currentRun) {
			currentRun = r
			out += `§${colorAtStops(stops, (r + 0.5) / k)}`
		}
		out += ch
	}
	out += '§R'
	return { text: out, runs: k, compressed: true, fits: out.length <= limit }
}

export function plainToRawRange(
	raw: string,
	start: number,
	end: number
): [number, number] {
	const codeChar = /^[0-9a-fA-FrR]$/
	let p = 0
	let i = 0
	let rs = -1
	let re = -1
	while (i < raw.length) {
		if (p === start && rs === -1) rs = i
		if (p === end) {
			re = i
			break
		}
		if (raw[i] === '§') {
			const hexMatch = raw.slice(i, i + 8).match(/^§#[0-9a-fA-F]{6}/)
			if (hexMatch) {
				i += 8
				continue
			}
			const next = raw[i + 1]
			if (next && codeChar.test(next)) {
				i += 2
				continue
			}
		}
		p += 1
		i += 1
	}
	if (rs === -1) rs = raw.length
	if (re === -1) re = raw.length
	return [rs, re]
}

export function parseStalcraftText(input: string): StalSegment[][] {
	const lines = input.split('\n')
	return lines.map((line) => {
		const segs: StalSegment[] = []
		let color = '#FFFFFF'
		let buf = ''
		const flush = () => {
			if (buf) {
				segs.push({ text: buf, color })
				buf = ''
			}
		}
		for (let i = 0; i < line.length; i++) {
			if (line[i] === '§' || line[i] === '&') {
				const next = line.slice(i + 1, i + 8)
				const hexMatch = next.match(/^#[0-9a-fA-F]{6}/)
				if (hexMatch) {
					flush()
					color = `#${hexMatch[0].slice(1).toUpperCase()}`
					i += 7
					continue
				}
				const code = line[i + 1]
				if (code && code in STALCRAFT_COLORS) {
					flush()
					color = STALCRAFT_COLORS[code]
					i += 1
					continue
				}
			}
			buf += line[i]
		}
		flush()
		return segs.length ? segs : [{ text: '', color }]
	})
}

export function stripStalcraftCodes(input: string): string {
	return input.replace(/§#[0-9a-fA-F]{6}|§[0-9a-fA-FrR]/g, '')
}
