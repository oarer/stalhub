import type { MapConfig } from '@/types/map.type'

export const WORLD_MAP: MapConfig = {
	name: 'map',
	title: {
		ru: 'Вся Зона',
		en: 'Whole Zone',
	},
	url: 'https://cdn.stalhub.dev/maps/map/tiles/{z}/{x}/{y}.png',
	preview_image: '/public/maps/world.jpg',
	image: {
		width: 21504,
		height: 12288,
		maxZoom: 15,
	},
	markers: '/public/markers/markers.json',
	atlasMarkers: true,
}
