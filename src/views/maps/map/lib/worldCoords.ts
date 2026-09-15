export type WorldCoordConfig = {
	scale: number
	offsetX: number
	offsetZ: number
	invertZ: boolean
}

export const DEFAULT_WORLD_COORD_CONFIG: WorldCoordConfig = {
	scale: 1,
	offsetX: 11776,
	offsetZ: 5632,
	invertZ: false,
}

export function worldToImagePx(
	source: { x: number; z: number },
	config: WorldCoordConfig = DEFAULT_WORLD_COORD_CONFIG
): [number, number] {
	const z = config.invertZ ? -source.z : source.z
	return [
		source.x * config.scale + config.offsetX,
		z * config.scale + config.offsetZ,
	]
}

export function imagePxToWorld(
	px: number,
	py: number,
	config: WorldCoordConfig = DEFAULT_WORLD_COORD_CONFIG
): { x: number; z: number } {
	const x = (px - config.offsetX) / config.scale
	const rawZ = (py - config.offsetZ) / config.scale
	return { x, z: config.invertZ ? -rawZ : rawZ }
}
