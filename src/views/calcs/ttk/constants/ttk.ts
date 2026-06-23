export const COLORS = [
	'#3b82f6',
	'#ef4444',
	'#22c55e',
	'#f59e0b',
	'#a855f7',
	'#06b6d4',
	'#f97316',
	'#84cc16',
]

export type HitZone = 'body' | 'head' | 'limbs'

export interface CustomRof {
	rof: number
	burstSize?: number
	burstDelay?: number
}

export const CUSTOM_ROF_MAP: Record<string, CustomRof> = {
	y37kw: { rof: 1200 },
	'96mn0': { rof: 1200 },
	'3grwz': { rof: 1200 },
}

export const HIT_ZONES: { value: HitZone; label: string }[] = [
	{ value: 'head', label: 'Голова' },
	{ value: 'body', label: 'Тело' },
	{ value: 'limbs', label: 'Конечности' },
]

export const getWeaponStats = (dmg0: number, rof: number) => [
	{
		label: 'Урон/выстрел',
		value: dmg0.toFixed(1),
		color: 'text-red-400',
	},
	{
		label: 'DPS',
		value: ((dmg0 * rof) / 60).toFixed(1),
		color: 'text-green-400',
	},
]
