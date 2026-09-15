import { WAYPOINT_ICON_NAMES } from '../constants'
import type {
	CfgWaypointRaw,
	ColorInfo,
	DisplayWaypoint,
	WaypointPos,
} from '../types'
import { decodeColorRaw, packColorRaw } from './colors'

export function parseCfgText(text: string): CfgWaypointRaw[] {
	let raw: unknown
	try {
		raw = JSON.parse(text)
	} catch {
		throw new Error('CFG не является валидным JSON')
	}
	if (!Array.isArray(raw)) {
		throw new Error('CFG должен быть массивом меток')
	}
	return raw as CfgWaypointRaw[]
}

export function parseWaypointPos(raw: CfgWaypointRaw): WaypointPos {
	return {
		x: Number(raw.pos?.x ?? 0),
		y: Number(raw.pos?.y ?? 70),
		z: Number(raw.pos?.z ?? 0),
	}
}

export function parseWaypointColor(raw: CfgWaypointRaw): {
	colorRaw: number
	color: ColorInfo
} {
	let colorRaw = Number(raw.colorRaw ?? raw.color ?? -1)
	const rawColor = raw.color

	if (typeof rawColor === 'object' && rawColor !== null) {
		const color: ColorInfo = {
			argb: Number(rawColor.argb ?? 0),
			a: Number(rawColor.a ?? 255),
			r: Number(rawColor.r ?? 255),
			g: Number(rawColor.g ?? 255),
			b: Number(rawColor.b ?? 255),
			hex: rawColor.hex,
		}
		if (!Number.isFinite(colorRaw)) {
			colorRaw = packColorRaw(color.a, color.r, color.g, color.b)
		}
		return { colorRaw, color }
	}

	if (!Number.isFinite(colorRaw)) {
		colorRaw = -1
	}
	return { colorRaw, color: decodeColorRaw(colorRaw) }
}

export function toDisplayWaypoint(
	raw: CfgWaypointRaw,
	id: number,
	fromBuffer = false
): DisplayWaypoint {
	const iconIndex = Number(raw.icon_index ?? raw.iconIndex ?? 0)
	const { colorRaw, color } = parseWaypointColor(raw)

	return {
		id,
		name: raw.name || (fromBuffer ? 'buffer' : `WP-${id + 1}`),
		iconIndex,
		iconName: WAYPOINT_ICON_NAMES[iconIndex] || 'unknown',
		colorRaw,
		color,
		type: raw.type || 'manual',
		canPositionFloat: Boolean(
			raw.can_position_float ?? raw.canPositionFloat ?? true
		),
		time: Number(raw.time ?? Date.now()),
		fromBuffer,
		pos: parseWaypointPos(raw),
	}
}

export function reindexWaypointCollection(list: DisplayWaypoint[]): void {
	for (let i = 0; i < list.length; i += 1) {
		list[i].id = i
	}
}

export function toCfgWaypoint(
	waypoint: DisplayWaypoint,
	fallbackTime: number,
	cursor: number
): CfgWaypointRaw {
	return {
		color: Number(waypoint.colorRaw ?? -1),
		can_position_float: Boolean(waypoint.canPositionFloat ?? true),
		time: Number(waypoint.time ?? fallbackTime + cursor),
		icon_index: Number(waypoint.iconIndex ?? 0),
		pos: {
			x: Number(waypoint.pos.x.toFixed(3)),
			y: Number(waypoint.pos.y.toFixed(3)),
			z: Number(waypoint.pos.z.toFixed(3)),
		},
		name: waypoint.name || '',
		type: waypoint.type || 'manual',
	}
}

export function downloadJson(filename: string, obj: unknown): void {
	const blob = new Blob([JSON.stringify(obj, null, 2)], {
		type: 'application/json',
	})
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	document.body.appendChild(a)
	a.click()
	a.remove()
	URL.revokeObjectURL(url)
}
