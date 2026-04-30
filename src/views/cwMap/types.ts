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
	name: string
	fullMaxLevel: number
	maxZoom: number
	imageWidth: number
	imageHeight: number
	letterMarkers?: { letter: string; lat: number; lng: number }[]
}

export type MarkerPreset = {
	key: string
	label: string
	color: string
	icon: string
	letter?: string
}

export const MAPS: MapDef[] = [
	{
		key: 'berda',
		name: 'Берда',
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
		name: 'Хвойный',
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
		name: 'Кварталы',
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
		name: 'Низина',
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
		name: 'Роза ветров',
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
		label: 'Позиция',
		color: '#3b82f6',
		icon: 'lucide:crosshair',
	},
	{ key: 'base', label: 'База', color: '#22c55e', icon: 'lucide:home' },
	{
		key: 'danger',
		label: 'Опасность',
		color: '#ef4444',
		icon: 'lucide:alert-triangle',
	},
	{ key: 'loot', label: 'Лут', color: '#eab308', icon: 'lucide:package' },
	{ key: 'spawn', label: 'Спавн', color: '#8b5cf6', icon: 'lucide:user' },
	{
		key: 'extract',
		label: 'Выход',
		color: '#22d3ee',
		icon: 'lucide:door-open',
	},
	{
		key: 'sniper',
		label: 'Снайпер',
		color: '#f97316',
		icon: 'lucide:target',
	},
	{ key: 'info', label: 'Инфо', color: '#a3a3a3', icon: 'lucide:info' },
	{ key: 'point_a', label: 'A', color: '#222222', icon: '', letter: 'A' },
	{ key: 'point_b', label: 'B', color: '#222222', icon: '', letter: 'B' },
	{ key: 'point_c', label: 'C', color: '#222222', icon: '', letter: 'C' },
	{ key: 'point_d', label: 'D', color: '#222222', icon: '', letter: 'D' },
	{ key: 'point_e', label: 'E', color: '#222222', icon: '', letter: 'E' },
	{ key: 'point_f', label: 'F', color: '#222222', icon: '', letter: 'F' },
	{ key: 'point_g', label: 'G', color: '#222222', icon: '', letter: 'G' },
	{ key: 'point_h', label: 'H', color: '#222222', icon: '', letter: 'H' },
]

export const DRAW_TOOLS: { key: Tool; icon: string; label: string }[] = [
	{ key: 'pan', icon: 'lucide:hand', label: 'Рука' },
	{ key: 'pen', icon: 'lucide:pencil', label: 'Карандаш' },
	{ key: 'line', icon: 'lucide:minus', label: 'Линия' },
	{ key: 'arrow', icon: 'lucide:move-right', label: 'Стрелка' },
	{ key: 'rect', icon: 'lucide:square', label: 'Прямоуг.' },
	{ key: 'circle', icon: 'lucide:circle', label: 'Круг' },
	{ key: 'eraser', icon: 'lucide:eraser', label: 'Ластик' },
	{ key: 'marker', icon: 'lucide:map-pin', label: 'Метка' },
]
