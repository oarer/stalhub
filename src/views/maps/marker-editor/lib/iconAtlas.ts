import type { AtlasMapFrame } from '../constants'
import {
	ATLAS_MAP_FRAMES,
	ATLAS_MAP_URL,
	ATLAS_SHEET_URL,
	WAYPOINT_ICON_IDS,
} from '../constants'
import type { ImageEntry } from '../types'

export const ATLAS_CELL = 64
export const ATLAS_COLUMNS = 8
export const ATLAS_ROWS = 1
export const DOT_FRAME = WAYPOINT_ICON_IDS.length

const ICON_PADDING = 6

let atlasMapEntry: ImageEntry | null = null

function loadAtlasMap(): ImageEntry {
	if (atlasMapEntry) return atlasMapEntry

	const image = new Image()
	const entry: ImageEntry = { image, ready: false, failed: false }
	atlasMapEntry = entry
	image.onload = () => {
		entry.ready = true
	}
	image.onerror = () => {
		entry.failed = true
	}
	image.src = ATLAS_MAP_URL
	return entry
}

export function waitAtlasMap(): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const entry = loadAtlasMap()
		if (entry.ready) {
			resolve(entry.image)
			return
		}
		if (entry.failed) {
			reject(new Error('Не удалось загрузить atlas_map_waypoint'))
			return
		}

		const onLoad = () => {
			cleanup()
			resolve(entry.image)
		}
		const onError = () => {
			cleanup()
			reject(new Error('Не удалось загрузить atlas_map_waypoint'))
		}
		const cleanup = () => {
			entry.image.removeEventListener('load', onLoad)
			entry.image.removeEventListener('error', onError)
		}

		entry.image.addEventListener('load', onLoad)
		entry.image.addEventListener('error', onError)
	})
}

function drawDotCell(ctx: CanvasRenderingContext2D, cellX: number): void {
	const centerX = cellX + ATLAS_CELL / 2
	const centerY = ATLAS_CELL / 2
	const radius = ATLAS_CELL * 0.34
	const gradient = ctx.createRadialGradient(
		centerX,
		centerY,
		radius * 0.45,
		centerX,
		centerY,
		radius
	)
	gradient.addColorStop(0, 'rgba(255,255,255,1)')
	gradient.addColorStop(0.82, 'rgba(255,255,255,1)')
	gradient.addColorStop(1, 'rgba(255,255,255,0)')
	ctx.fillStyle = gradient
	ctx.beginPath()
	ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
	ctx.fill()
}

function drawIconFrameCell(
	ctx: CanvasRenderingContext2D,
	image: HTMLImageElement,
	frame: { x: number; y: number; w: number; h: number },
	cellX: number
): void {
	const maxSize = ATLAS_CELL - ICON_PADDING * 2
	const scale = Math.min(maxSize / frame.w, maxSize / frame.h)
	const drawWidth = frame.w * scale
	const drawHeight = frame.h * scale
	ctx.drawImage(
		image,
		frame.x,
		frame.y,
		frame.w,
		frame.h,
		cellX + ICON_PADDING + (maxSize - drawWidth) / 2,
		ICON_PADDING + (maxSize - drawHeight) / 2,
		drawWidth,
		drawHeight
	)
}

export function drawIconAtlas(): HTMLCanvasElement | null {
	const canvas = document.createElement('canvas')
	canvas.width = ATLAS_COLUMNS * ATLAS_CELL
	canvas.height = ATLAS_ROWS * ATLAS_CELL

	const ctx = canvas.getContext('2d')
	if (!ctx) return null
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.imageSmoothingEnabled = true
	ctx.imageSmoothingQuality = 'high'

	for (const iconIndex of WAYPOINT_ICON_IDS) {
		const frame = ATLAS_MAP_FRAMES[iconIndex]
		if (!frame || !atlasMapEntry?.ready) return null
		drawIconFrameCell(
			ctx,
			atlasMapEntry.image,
			frame,
			iconIndex * ATLAS_CELL
		)
	}

	drawDotCell(ctx, DOT_FRAME * ATLAS_CELL)
	return canvas
}

export function pointToFrame(iconIndex: number, highPerf: boolean): number {
	return highPerf ? DOT_FRAME : iconIndex
}

let atlasSheet: Record<string, AtlasMapFrame> | null = null
let atlasSheetError: Error | null = null

export function waitAtlasSheet(): Promise<Record<string, AtlasMapFrame>> {
	if (atlasSheet) return Promise.resolve(atlasSheet)
	if (atlasSheetError) return Promise.reject(atlasSheetError)

	return fetch(ATLAS_SHEET_URL)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`Атлас-лист: ${response.status}`)
			}
			return response.json() as Promise<{
				frames?: Record<
					string,
					{ frame?: { x: number; y: number; w: number; h: number } }
				>
			}>
		})
		.then((data) => {
			const frames: Record<string, AtlasMapFrame> = {}
			for (const [key, entry] of Object.entries(data.frames ?? {})) {
				const frame = entry.frame
				if (!frame) continue
				frames[key] = {
					x: frame.x,
					y: frame.y,
					w: frame.w,
					h: frame.h,
				}
			}
			atlasSheet = frames
			return frames
		})
		.catch((error) => {
			atlasSheetError = error as Error
			throw error
		})
}

export function getAtlasFrame(key: string): AtlasMapFrame | null {
	return atlasSheet?.[key] ?? null
}

export function normalizeAtlasFrame(
	source: AtlasMapFrame | [number, number, number, number]
): AtlasMapFrame {
	if (Array.isArray(source)) {
		const [x, y, w, h] = source
		return { x, y, w, h }
	}
	return source
}

export async function resolveAtlasFrame(
	key: string,
	explicit?: AtlasMapFrame | [number, number, number, number] | null
): Promise<AtlasMapFrame | null> {
	if (explicit) return normalizeAtlasFrame(explicit)
	const sheet = await waitAtlasSheet()
	return sheet[key] ?? null
}
