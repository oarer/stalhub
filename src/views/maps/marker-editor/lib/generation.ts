import { WAYPOINT_ICON_IDS } from '../constants'
import type { CfgWaypointRaw, CoordConfig, GeneratedMarker } from '../types'
import { packColorRaw, quantizeColorChannel, rgbaToHex } from './colors'
import { tileToWorld } from './geometry'

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file)
		const image = new Image()
		image.onload = () => {
			URL.revokeObjectURL(url)
			resolve(image)
		}
		image.onerror = (error) => {
			URL.revokeObjectURL(url)
			reject(error)
		}
		image.src = url
	})
}

export function clampTargetDimension(value: number): number {
	const raw = Number(value)
	if (!Number.isFinite(raw)) return 256
	return Math.max(1, Math.min(4096, Math.round(raw)))
}

export function prepareImageData(
	image: HTMLImageElement,
	targetWidth = 256,
	targetHeight = 256
): ImageData {
	const width = clampTargetDimension(targetWidth)
	const height = clampTargetDimension(targetHeight)
	const canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height
	const ctx = canvas.getContext('2d', { willReadFrequently: true })
	if (!ctx) {
		throw new Error('Canvas 2D недоступен')
	}
	ctx.drawImage(image, 0, 0, width, height)
	return ctx.getImageData(0, 0, width, height)
}

export function generateUniformMarkers(
	imageData: ImageData,
	{
		useAutoIcons,
		fixedIconIndex,
	}: { useAutoIcons: boolean; fixedIconIndex: number }
): GeneratedMarker[] {
	const { width, height, data } = imageData
	const markers: GeneratedMarker[] = []
	let autoCursor = 0

	for (let y = 0; y < height; y += 1) {
		for (let x = 0; x < width; x += 1) {
			const idx = (y * width + x) * 4
			const a = data[idx + 3]
			if (a < 22) continue

			const r = quantizeColorChannel(data[idx], 16)
			const g = quantizeColorChannel(data[idx + 1], 16)
			const b = quantizeColorChannel(data[idx + 2], 16)
			let iconIndex = fixedIconIndex

			if (useAutoIcons) {
				iconIndex =
					WAYPOINT_ICON_IDS[autoCursor % WAYPOINT_ICON_IDS.length]
				autoCursor += 1
			}

			markers.push({
				px: x,
				py: y,
				nx: (x + 0.5) / width - 0.5,
				ny: (y + 0.5) / height - 0.5,
				area: 1,
				r,
				g,
				b,
				colorHex: rgbaToHex(r, g, b),
				iconIndex,
			})
		}
	}

	return markers
}

export function buildMarkerRows(
	width: number,
	height: number,
	markers: GeneratedMarker[]
): GeneratedMarker[][] {
	const rows: GeneratedMarker[][] = Array.from({ length: height }, () => [])
	for (const marker of markers) {
		const py = Math.max(0, Math.min(height - 1, marker.py | 0))
		rows[py].push(marker)
	}
	for (const row of rows) {
		row.sort((a, b) => a.px - b.px)
	}
	return rows
}

export function applyIconStrategyToMarkers(
	markers: GeneratedMarker[] | undefined,
	useAutoIcons: boolean,
	fixedIconIndex: number
): void {
	if (!Array.isArray(markers)) return
	if (!useAutoIcons) {
		for (const marker of markers) {
			marker.iconIndex = fixedIconIndex
		}
		return
	}

	for (let i = 0; i < markers.length; i += 1) {
		markers[i].iconIndex = WAYPOINT_ICON_IDS[i % WAYPOINT_ICON_IDS.length]
	}
}

export function buildGeneratedWaypoints(
	generated: {
		markers: GeneratedMarker[]
		scaleTiles: number
		width: number
		height: number
		centerTileX: number
		centerTileZ: number
		iconIndex: number
		useAutoIcons: boolean
	},
	coordCfg: CoordConfig
): CfgWaypointRaw[] {
	const now = Date.now()
	const scaleX = generated.scaleTiles
	const scaleZ = generated.scaleTiles * (generated.height / generated.width)
	const useAutoIcons = generated.useAutoIcons

	return generated.markers.map((marker, index) => {
		const tileX = generated.centerTileX + marker.nx * scaleX
		const tileZ = generated.centerTileZ + marker.ny * scaleZ
		const world = tileToWorld(coordCfg, tileX, tileZ)
		const colorRaw = packColorRaw(255, marker.r, marker.g, marker.b)

		return {
			color: colorRaw,
			can_position_float: true,
			time: now + index,
			icon_index: useAutoIcons
				? (marker.iconIndex ?? generated.iconIndex)
				: generated.iconIndex,
			pos: {
				x: Number(world.x.toFixed(3)),
				y: 70.0,
				z: Number(world.z.toFixed(3)),
			},
			name: '',
			type: 'manual',
		}
	})
}
