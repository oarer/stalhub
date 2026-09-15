import { TILE_SIZE } from '../constants'
import type { ActiveMap, CoordConfig, DisplayWaypoint, Vec2 } from '../types'

export function mapToPixel(
	map: ActiveMap,
	coordCfg: CoordConfig,
	tileX: number,
	tileZ: number
): Vec2 {
	const px = (tileX - map.bounds.minX) * TILE_SIZE
	const py = coordCfg.invertZ
		? (map.bounds.maxZ - tileZ) * TILE_SIZE
		: (tileZ - map.bounds.minZ) * TILE_SIZE
	return { x: px, y: py }
}

export function mapPixelToTile(
	map: ActiveMap,
	coordCfg: CoordConfig,
	px: number,
	py: number
): { tileX: number; tileZ: number } {
	const tileX = px / TILE_SIZE + map.bounds.minX
	const tileZ = coordCfg.invertZ
		? map.bounds.maxZ - py / TILE_SIZE
		: py / TILE_SIZE + map.bounds.minZ
	return { tileX, tileZ }
}

export function tileToWorld(
	coordCfg: CoordConfig,
	tileX: number,
	tileZ: number
): { x: number; z: number } {
	return {
		x: (tileX - coordCfg.offsetX) * coordCfg.scale,
		z: (tileZ - coordCfg.offsetZ) * coordCfg.scale,
	}
}

export function waypointToTile(
	coordCfg: CoordConfig,
	waypoint: DisplayWaypoint
): { x: number; z: number } {
	return {
		x: waypoint.pos.x / coordCfg.scale + coordCfg.offsetX,
		z: waypoint.pos.z / coordCfg.scale + coordCfg.offsetZ,
	}
}

export function waypointToPixel(
	coordCfg: CoordConfig,
	map: ActiveMap,
	waypoint: DisplayWaypoint
): Vec2 {
	const tile = waypointToTile(coordCfg, waypoint)
	return mapToPixel(map, coordCfg, tile.x, tile.z)
}

export function screenToMapPixel(
	canvas: HTMLCanvasElement,
	camera: { scale: number; x: number; y: number },
	clientX: number,
	clientY: number
): Vec2 {
	const rect = canvas.getBoundingClientRect()
	const sx = clientX - rect.left
	const sy = clientY - rect.top

	return {
		x: camera.x + (sx - canvas.clientWidth / 2) / camera.scale,
		y: camera.y + (sy - canvas.clientHeight / 2) / camera.scale,
	}
}

export function getGeneratedMarkerTile(
	generated: {
		centerTileX: number
		centerTileZ: number
		scaleTiles: number
		width: number
		height: number
	},
	marker: { nx: number; ny: number }
): { tileX: number; tileZ: number } {
	const scaleX = generated.scaleTiles
	const scaleZ = generated.scaleTiles * (generated.height / generated.width)
	return {
		tileX: generated.centerTileX + marker.nx * scaleX,
		tileZ: generated.centerTileZ + marker.ny * scaleZ,
	}
}
