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
	return rgbToHex(
		r1 + (r2 - r1) * t,
		g1 + (g2 - g1) * t,
		b1 + (b2 - b1) * t
	)
}

/** Градиент посимвольно: каждый символ получает §#hex */
export function buildGradient(
	text: string,
	from: string,
	to: string,
	mid?: string
): string {
	const chars = [...text]
	if (chars.length === 0) return ''
	if (chars.length === 1) return `§${from}${chars[0]}§R`
	return chars
		.map((ch, i) => {
			if (ch === '\n') return '\n'
			const t = i / (chars.length - 1)
			let hex: string
			if (mid && t < 0.5) hex = lerpColor(from, mid, t * 2)
			else if (mid) hex = lerpColor(mid, to, (t - 0.5) * 2)
			else hex = lerpColor(from, to, t)
			return `§${hex}${ch}`
		})
		.join('') + '§R'
}

/** Парсинг §-кодов в сегменты для превью. Поддерживает §0-F/R + §#RRGGBB */
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

/** Убрать все §-коды */
export function stripStalcraftCodes(input: string): string {
	return input.replace(/§#[0-9a-fA-F]{6}|§[0-9a-fA-FrR]/g, '')
}
