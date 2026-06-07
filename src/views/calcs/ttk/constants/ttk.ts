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

export const HIT_ZONES: { value: HitZone; label: string }[] = [
	{ value: 'head', label: 'Голова' },
	{ value: 'body', label: 'Тело' },
	{ value: 'limbs', label: 'Конечности' },
]

export const getWeaponStats = (dmg0: number, rof: number, prime: number) => [
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
	{
		label: 'Выстрелов',
		value: prime / dmg0 > 0 ? Math.ceil(prime / dmg0).toFixed(0) : '0',
		color: 'text-blue-400',
		className: 'col-span-2',
	},
]
