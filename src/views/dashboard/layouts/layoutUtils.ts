export type Rect = {
	x: number
	y: number
	w: number
	h: number
}

const rectsIntersect = (a: Rect, b: Rect): boolean =>
	a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

const SCAN = {
	start: 16,
	step: 16,
	maxX: 1400,
	maxY: 4000,
} as const

export function findFreePosition(
	items: Rect[],
	w: number,
	h: number
): { x: number; y: number } {
	for (let y = SCAN.start; y < SCAN.maxY; y += SCAN.step) {
		for (let x = SCAN.start; x < SCAN.maxX; x += SCAN.step) {
			if (!items.some((item) => rectsIntersect({ x, y, w, h }, item))) {
				return { x, y }
			}
		}
	}

	return { x: SCAN.start, y: SCAN.start }
}
