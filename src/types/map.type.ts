import type { Locale } from './item.type'

export type LatLng = { lat: number; lng: number }

type LocalizedString = Partial<Record<Locale, string>>

export type MarkerPoint = {
	id?: number
	coordinates: LatLng
	description?: LocalizedString
	popup?: string
	iconUrl?: string
	color?: string
	popupImage?: string
}

export type MarkerPolygon = {
	id?: number | string
	points: LatLng[]
	popup?: string
	description?: LocalizedString
	label?: string
	color?: string
	fillColor?: string
}

export type MarkerGroup = {
	id: number
	slug: string
	name: LocalizedString
	settings: {
		name?: string
		image?: string
		color?: string
		iconWidth?: number
		iconHeight?: number
	}
	markers: MarkerPoint[]
	polygons?: MarkerPolygon[]
}

export type MarkerClusterFull = {
	id: number
	slug?: string
	name?: LocalizedString
	markers: MarkerGroup[]
}

export type MarkersFile = {
	markers_clusters?: MarkerClusterFull[]
	points?: MarkerPoint[]
	image?: { width?: number; height?: number; maxZoom?: number }
}

export type MapConfig = {
	name: string
	url: string
	title: LocalizedString
	preview_image: string
	image: { width: number; height: number; maxZoom: number }
	markers: string
	/** World (new-format atlas-key) markers instead of markers_clusters. */
	atlasMarkers?: boolean
}

/**
 * Frame (source rect) of an icon inside the waypoint icon atlas
 * (`/markers/atlas_map_waypoint.png`). Order matches the given marker format:
 * [x, y, w, h].
 */
export type IconFrame = [number, number, number, number]

/**
 * New waypoint-marker format. `x`/`z` are global world coordinates (not
 * per-map) and will drive placement once a world map is introduced.
 * `icon` is an atlas key (e.g. "waypoint_event_miniboss") resolved via the
 * atlas sheet; `title_key`/`goal_key` are PDA-localization keys.
 */
export type AtlasWaypoint = {
	uuid: string
	icon: string
	title_key: string
	goal_key: string
	settlement?: string
	x: number
	z: number
}

/** Shape of `/markers/markers.json` (by_icon holds icon key -> count). */
export type AtlasMarkersFile = {
	spots: AtlasWaypoint[]
	by_icon: Record<string, number>
}

export const isPixelCoord = (
	coords: LatLng,
	imageWidth: number,
	imageHeight: number
): boolean => {
	return (
		coords.lat >= 0 &&
		coords.lng >= 0 &&
		coords.lat <= imageHeight &&
		coords.lng <= imageWidth
	)
}
