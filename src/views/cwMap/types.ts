export type { LatLng } from '@/types/map.type'

import type { LatLng } from '@/types/map.type'

export type HistoryEntry =
	| { type: 'add_element'; element: DrawElement }
	| { type: 'add_marker'; marker: MapMarker }

export type DrawElement = {
	id: string
	type: 'stroke' | 'arrow' | 'line' | 'rect' | 'circle'
	points: LatLng[]
	color: string
	width: number
}

export type MapMarker = {
	id: string
	position: LatLng
	preset: string
}

export type Tool =
	| 'pen'
	| 'eraser'
	| 'arrow'
	| 'line'
	| 'rect'
	| 'circle'
	| 'marker'
	| 'pan'

export type MapDef = {
	key: string
	nameKey: string
	fullMaxLevel: number
	maxZoom: number
	imageWidth: number
	imageHeight: number
	letterMarkers?: { letter: string; lat: number; lng: number }[]
}

export type MarkerPreset = {
	key: string
	labelKey?: string
	label?: string
	color: string
	icon: string
	image?: string
	letter?: string
}

export const MAPS: MapDef[] = [
	{
		key: 'berda',
		nameKey: 'cwMap.maps.berda',
		fullMaxLevel: 11,
		maxZoom: 13,
		imageWidth: 1536,
		imageHeight: 1536,
		letterMarkers: [
			{ letter: 'A', lat: -0.4305, lng: 0.2799 },
			{ letter: 'B', lat: -0.4305, lng: 0.36999 },
			{ letter: 'C', lat: -0.335, lng: 0.34 },
			{ letter: 'D', lat: -0.37, lng: 0.454 },
			{ letter: 'E', lat: -0.488, lng: 0.454 },
			{ letter: 'F', lat: -0.526, lng: 0.34 },
		],
	},
	{
		key: 'hvoiniy',
		nameKey: 'cwMap.maps.hvoiniy',
		fullMaxLevel: 11,
		maxZoom: 13,
		imageWidth: 1536,
		imageHeight: 1024,
		letterMarkers: [
			{ letter: 'A', lat: 512, lng: 768 },
			{ letter: 'B', lat: 512, lng: 256 },
		],
	},
	{
		key: 'kvartals',
		nameKey: 'cwMap.maps.kvartals',
		fullMaxLevel: 10,
		maxZoom: 13,
		imageWidth: 1024,
		imageHeight: 1024,
		letterMarkers: [
			{ letter: 'A', lat: 512, lng: 512 },
			{ letter: 'B', lat: 512, lng: 256 },
			{ letter: 'C', lat: 256, lng: 256 },
		],
	},
	{
		key: 'nizina',
		nameKey: 'cwMap.maps.nizina',
		fullMaxLevel: 11,
		maxZoom: 13,
		imageWidth: 2048,
		imageHeight: 2048,
		letterMarkers: [
			{ letter: 'A', lat: 1024, lng: 1024 },
			{ letter: 'B', lat: 1024, lng: 512 },
			{ letter: 'C', lat: 512, lng: 512 },
		],
	},
	{
		key: 'roze_wise',
		nameKey: 'cwMap.maps.rozeWise',
		fullMaxLevel: 12,
		maxZoom: 13,
		imageWidth: 2560,
		imageHeight: 2560,
		letterMarkers: [
			{ letter: 'A', lat: 1280, lng: 1280 },
			{ letter: 'B', lat: 1280, lng: 640 },
		],
	},
]

export const PRESET_COLORS = [
	'#ef4444',
	'#eab308',
	'#22c55e',
	'#3b82f6',
	'#8b5cf6',
	'#ffffff',
	'#000000',
]

export const MARKER_PRESETS: MarkerPreset[] = [
	{
		key: 'position',
		labelKey: 'cwMap.markers.position',
		color: '#3b82f6',
		icon: 'lucide:crosshair',
	},
	{
		key: 'base',
		labelKey: 'cwMap.markers.base',
		color: '#22c55e',
		icon: 'lucide:home',
	},
	{
		key: 'danger',
		labelKey: 'cwMap.markers.danger',
		color: '#ef4444',
		icon: 'lucide:alert-triangle',
	},
	{
		key: 'loot',
		labelKey: 'cwMap.markers.loot',
		color: '#eab308',
		icon: 'lucide:package',
	},
	{
		key: 'spawn',
		labelKey: 'cwMap.markers.spawn',
		color: '#8b5cf6',
		icon: 'lucide:user',
	},
	{
		key: 'extract',
		labelKey: 'cwMap.markers.extract',
		color: '#22d3ee',
		icon: 'lucide:door-open',
	},
	{
		key: 'sniper',
		labelKey: 'cwMap.markers.sniper',
		color: '#f97316',
		icon: 'lucide:target',
	},
	{
		key: 'info',
		labelKey: 'cwMap.markers.info',
		color: '#a3a3a3',
		icon: 'lucide:info',
	},
	{
		key: 'gabion',
		labelKey: 'cwMap.markers.custom',
		color: '#ffffff',
		icon: 'lucide:image',
		image: '/images/map/cw/gabion.png',
	},
	{
		key: 'bar',
		labelKey: 'cwMap.markers.custom',
		color: '#ffffff',
		icon: 'lucide:image',
		image: '/images/map/cw/b.png',
	},
	{
		key: 'bar_mil',
		labelKey: 'cwMap.markers.custom',
		color: '#ffffff',
		icon: 'lucide:image',
		image: '/images/map/cw/b_m.png',
	},
	{
		key: 'bar_mil_open',
		labelKey: 'cwMap.markers.custom',
		color: '#ffffff',
		icon: 'lucide:image',
		image: '/images/map/cw/b_m_open.png',
	},
	{ key: 'point_a', label: 'A', color: '#222222', icon: '', letter: 'A' },
	{ key: 'point_b', label: 'B', color: '#222222', icon: '', letter: 'B' },
	{ key: 'point_c', label: 'C', color: '#222222', icon: '', letter: 'C' },
	{ key: 'point_d', label: 'D', color: '#222222', icon: '', letter: 'D' },
	{ key: 'point_e', label: 'E', color: '#222222', icon: '', letter: 'E' },
	{ key: 'point_f', label: 'F', color: '#222222', icon: '', letter: 'F' },
	{ key: 'point_g', label: 'G', color: '#222222', icon: '', letter: 'G' },
	{ key: 'point_h', label: 'H', color: '#222222', icon: '', letter: 'H' },
]

export const DRAW_TOOLS: { key: Tool; icon: string; labelKey: string }[] = [
	{ key: 'pan', icon: 'lucide:hand', labelKey: 'cwMap.tools.pan' },
	{ key: 'pen', icon: 'lucide:pencil', labelKey: 'cwMap.tools.pen' },
	{ key: 'line', icon: 'lucide:minus', labelKey: 'cwMap.tools.line' },
	{ key: 'arrow', icon: 'lucide:move-right', labelKey: 'cwMap.tools.arrow' },
	{ key: 'rect', icon: 'lucide:square', labelKey: 'cwMap.tools.rect' },
	{ key: 'circle', icon: 'lucide:circle', labelKey: 'cwMap.tools.circle' },
	{ key: 'eraser', icon: 'lucide:eraser', labelKey: 'cwMap.tools.eraser' },
	{ key: 'marker', icon: 'lucide:map-pin', labelKey: 'cwMap.tools.marker' },
]
