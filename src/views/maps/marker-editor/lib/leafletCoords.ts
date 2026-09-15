export const DEG_PER_TILE = 0.1

export function displayZ(tileZ: number, invertZ: boolean): number {
	return invertZ ? tileZ : -tileZ
}

export function tileToLatLng(
	tileX: number,
	tileZ: number,
	invertZ: boolean
): [number, number] {
	return [displayZ(tileZ, invertZ) * DEG_PER_TILE, tileX * DEG_PER_TILE]
}

export function latLngToTile(
	lat: number,
	lng: number,
	invertZ: boolean
): { tileX: number; tileZ: number } {
	return {
		tileX: lng / DEG_PER_TILE,
		tileZ: invertZ ? lat / DEG_PER_TILE : -lat / DEG_PER_TILE,
	}
}
