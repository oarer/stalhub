export const TILE_SIZE = 256

export const ATLAS_MAP_URL = '/markers/atlas_map_waypoint.png'
export const ATLAS_SHEET_URL = '/markers/atlas_map_waypoint.sheet.json'

export type AtlasMapFrame = { x: number; y: number; w: number; h: number }

export const ATLAS_MAP_FRAMES: Partial<Record<number, AtlasMapFrame>> = {
	0: { x: 1002, y: 40, w: 17, h: 25 }, // waypoint_player_custom
	1: { x: 965, y: 134, w: 21, h: 25 }, // waypoint_player_custom_chest
	2: { x: 451, y: 204, w: 20, h: 24 }, // waypoint_player_custom_cross
	3: { x: 476, y: 204, w: 20, h: 24 }, // waypoint_player_custom_flag
	4: { x: 501, y: 203, w: 20, h: 24 }, // waypoint_player_custom_flash
	5: { x: 526, y: 203, w: 20, h: 24 }, // waypoint_player_custom_magnifier
	6: { x: 551, y: 203, w: 20, h: 24 }, // waypoint_player_custom_question
}

export const WAYPOINT_ICON_IDS = [0, 1, 2, 3, 4, 5, 6]
export const WAYPOINT_ICON_NAMES = [
	'custom',
	'chest',
	'cross',
	'flag',
	'flash',
	'magnifier',
	'question',
]

export const WAYPOINT_ICON_OPTIONS = WAYPOINT_ICON_IDS.map((id, index) => ({
	value: id,
	label: WAYPOINT_ICON_NAMES[index],
}))

export const TINTED_ICON_CACHE_LIMIT = 24000

export const DEFAULT_COORD_CONFIG = {
	scale: 512,
	offsetX: 0,
	offsetZ: 0,
	invertZ: false,
} as const
