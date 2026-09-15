import type { AtlasMarkersFile, AtlasWaypoint } from '@/types/map.type'
import type { AtlasMapFrame } from '@/views/maps/marker-editor/constants'

export const WORLD_CELL = 64
export const WORLD_ICON_PADDING = 6

export function buildAtlasMarkersFile(
	spots: AtlasWaypoint[]
): AtlasMarkersFile {
	const byIcon: Record<string, number> = {}
	for (const spot of spots) {
		byIcon[spot.icon] = (byIcon[spot.icon] ?? 0) + 1
	}
	return { spots, by_icon: byIcon }
}

export const WORLD_ICON_ALIASES: Record<string, string> = {
	military: 'waypoint_event_camp_military',
	mutants: 'waypoint_event_camp_mutants',
}
export function resolveSheetKey(
	icon: string,
	sheet: Record<string, AtlasMapFrame>
): string | null {
	if (icon in sheet) return icon
	const prefixed = `waypoint_event_${icon}`
	if (prefixed in sheet) return prefixed
	const alias = WORLD_ICON_ALIASES[icon]
	if (alias && alias in sheet) return alias
	return null
}

export type WorldAtlas = {
	canvas: HTMLCanvasElement
	columns: number
	rows: number
	frames: Map<string, number>
}

export function buildWorldAtlas(
	image: HTMLImageElement,
	sheet: Record<string, AtlasMapFrame>,
	keys: Iterable<string>
): WorldAtlas | null {
	const cellByKey = new Map<string, number>()
	const orderedFrames: AtlasMapFrame[] = []
	for (const key of keys) {
		const frame = sheet[key]
		if (!frame || cellByKey.has(key)) continue
		cellByKey.set(key, orderedFrames.length)
		orderedFrames.push(frame)
	}
	if (orderedFrames.length === 0) return null

	const columns = Math.max(1, Math.ceil(Math.sqrt(orderedFrames.length)))
	const rows = Math.max(1, Math.ceil(orderedFrames.length / columns))
	const canvas = document.createElement('canvas')
	canvas.width = columns * WORLD_CELL
	canvas.height = rows * WORLD_CELL

	const ctx = canvas.getContext('2d')
	if (!ctx) return null
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.imageSmoothingEnabled = true
	ctx.imageSmoothingQuality = 'high'

	const maxSize = WORLD_CELL - WORLD_ICON_PADDING * 2
	orderedFrames.forEach((frame, index) => {
		const col = index % columns
		const row = Math.floor(index / columns)
		const cellX = col * WORLD_CELL
		const cellY = row * WORLD_CELL
		const scale = Math.min(maxSize / frame.w, maxSize / frame.h)
		const drawWidth = frame.w * scale
		const drawHeight = frame.h * scale
		ctx.drawImage(
			image,
			frame.x,
			frame.y,
			frame.w,
			frame.h,
			cellX + WORLD_ICON_PADDING + (maxSize - drawWidth) / 2,
			cellY + WORLD_ICON_PADDING + (maxSize - drawHeight) / 2,
			drawWidth,
			drawHeight
		)
	})

	return { canvas, columns, rows, frames: cellByKey }
}
