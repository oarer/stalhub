import type { ColorInfo } from '../types'

export function rgbaToHex(r: number, g: number, b: number): string {
	const hr = r.toString(16).padStart(2, '0')
	const hg = g.toString(16).padStart(2, '0')
	const hb = b.toString(16).padStart(2, '0')
	return `#${hr}${hg}${hb}`
}

export function quantizeColorChannel(v: number, levels = 16): number {
	const clamped = Math.max(0, Math.min(255, v))
	if (levels <= 1) return clamped
	const bucket = Math.round((clamped / 255) * (levels - 1))
	return Math.round((bucket / (levels - 1)) * 255)
}

export function decodeColorRaw(colorRaw: number): ColorInfo {
	const argb = Number(colorRaw) & 0xffffffff
	const r = (argb >> 16) & 0xff
	const g = (argb >> 8) & 0xff
	const b = argb & 0xff
	const hex = `#${r.toString(16).padStart(2, '0').toUpperCase()}${g
		.toString(16)
		.padStart(2, '0')
		.toUpperCase()}${b.toString(16).padStart(2, '0').toUpperCase()}`
	return {
		argb,
		a: (argb >> 24) & 0xff,
		r,
		g,
		b,
		hex,
	}
}

export function packColorRaw(
	a: number,
	r: number,
	g: number,
	b: number
): number {
	return (a << 24) | (r << 16) | (g << 8) | b | 0
}
