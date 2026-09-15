export function hexToRgb(hex: string): [number, number, number] {
	const value = parseInt(hex.replace('#', '').padEnd(6, '0'), 16)
	return [
		((value >> 16) & 255) / 255,
		((value >> 8) & 255) / 255,
		(value & 255) / 255,
	]
}

export function selectColor(
	color: [number, number, number]
): [number, number, number] {
	const lift = 0.45
	return [
		color[0] + (1 - color[0]) * lift,
		color[1] + (1 - color[1]) * lift,
		color[2] + (1 - color[2]) * lift,
	]
}
