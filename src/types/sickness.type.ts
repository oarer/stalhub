export type SicknessKey =
	| 'rad'
	| 'thr'
	| 'bio'
	| 'psy'
	| 'bld'
	| 'cmb'
	| 'txc'
	| 'frs'
	| 'gnr'
	| 'abnormal'

export type SicknessDefinition = {
	level_bounds: number[]
	level_damage: number[]
	decrease_speed?: number
	max_power?: number
	damage_cooldown?: number
	reset_ticks?: number
	incoming_sickness_factor?: number
	properties: Record<string, Record<string, number>>
	label: string
	icon: string
}

export type SicknessMap = Record<SicknessKey, SicknessDefinition>
