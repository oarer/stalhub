import type { SicknessKey, SicknessMap } from '@/types/sickness.type'

export const SICKNESS_FACTOR_PREFIX = 'stalker.artefact_properties.factor.'

const SICKNESS_KEY_ALIASES: Record<string, string> = {
	secondary_speed_modifier: 'stalker.artefact_properties.factor.speed_modifier',
	secondary_speed_modifier_short: 'stalker.artefact_properties.factor.speed_modifier',
}

export function toBuildStatKey(shortKey: string): string {
	if (SICKNESS_KEY_ALIASES[shortKey]) return SICKNESS_KEY_ALIASES[shortKey]
	if (shortKey.startsWith(SICKNESS_FACTOR_PREFIX)) return shortKey
	return `${SICKNESS_FACTOR_PREFIX}${shortKey}`
}

export function applySicknessEffects(
	base: Record<string, number>,
	effects: Record<string, number>
): Record<string, number> {
	const result = { ...base }
	for (const [shortKey, value] of Object.entries(effects)) {
		const key = toBuildStatKey(shortKey)
		result[key] = (result[key] ?? 0) + value
	}
	return result
}

export function computeSicknessEffects(
	sickness: Record<string, number> | undefined
): Record<string, number> {
	const effects: Record<string, number> = {}
	if (!sickness) return effects

	for (const [key, level] of Object.entries(sickness)) {
		const def = SICKNESS[key as SicknessKey]
		if (!def || !def.properties) continue
		const lvlProps = def.properties[`level_${level}`]
		if (!lvlProps) continue
		for (const [shortKey, value] of Object.entries(lvlProps)) {
			if (isDamageMechanicKey(shortKey)) continue
			const fullKey = toBuildStatKey(shortKey)
			effects[fullKey] = (effects[fullKey] ?? 0) + value
		}
	}
	return effects
}

function isDamageMechanicKey(shortKey: string): boolean {
	return (
		shortKey.includes('accumulation') || shortKey.endsWith('dmg_factor')
	)
}


export const SICKNESS_LABEL_KEYS: Record<SicknessKey, string> = {
	rad: 'build.sickness.names.rad',
	thr: 'build.sickness.names.thr',
	bio: 'build.sickness.names.bio',
	psy: 'build.sickness.names.psy',
	bld: 'build.sickness.names.bld',
	cmb: 'build.sickness.names.cmb',
	txc: 'build.sickness.names.txc',
	frs: 'build.sickness.names.frs',
	gnr: 'build.sickness.names.gnr',
	abnormal: 'build.sickness.names.abnormal',
}

export const SICKNESS_ICONS: Record<SicknessKey, string> = {
	rad: 'lucide:radiation',
	thr: 'lucide:flame',
	bio: 'lucide:flower',
	psy: 'lucide:brain',
	bld: 'lucide:droplet',
	cmb: 'lucide:flame',
	txc: 'lucide:skull',
	frs: 'lucide:snowflake',
	gnr: 'lucide:zap',
	abnormal: 'lucide:cloud-lightning',
}

export const SICKNESS: SicknessMap = {
	rad: {
		level_bounds: [0,200,500,1000,7500,90000],
		level_damage: [0,0,1,1,2,3,4],
		decrease_speed: 0.5000005,
		max_power: 100000,
		damage_cooldown: 20,
		properties: {"level_1":{"regeneration_bonus":-2.5,"heal_efficiency":-20,"bleeding_accumulation":0.5},"level_2":{"regeneration_bonus":-10,"heal_efficiency":-20,"bleeding_accumulation":0.5},"level_3":{"health_bonus":-12,"regeneration_bonus":-15,"heal_efficiency":-20,"bleeding_accumulation":0.5},"level_4":{"health_bonus":-25,"regeneration_bonus":-15,"heal_efficiency":-50,"bleeding_accumulation":1},"level_5":{"health_bonus":-30,"regeneration_bonus":-20,"heal_efficiency":-70,"bleeding_accumulation":2},"level_6":{"health_bonus":-30,"regeneration_bonus":-40,"heal_efficiency":-100,"radiation_dmg_factor":-100,"bleeding_accumulation":4}},
		label: SICKNESS_LABEL_KEYS.rad,
		icon: SICKNESS_ICONS.rad,
	},
	thr: {
		level_bounds: [0,200,500,1000,7500,90000],
		level_damage: [0,2,4,8,12,16,20],
		decrease_speed: 0.5000005,
		max_power: 100000,
		damage_cooldown: 20,
		reset_ticks: 40,
		properties: {"level_1":{"heal_efficiency":-50,"combustion_accumulation":1},"level_2":{"stamina_regeneration_bonus":-5,"heal_efficiency":-50,"combustion_accumulation":1},"level_3":{"stamina_regeneration_bonus":-10,"heal_efficiency":-100,"combustion_accumulation":1},"level_4":{"stamina_regeneration_bonus":-25,"heal_efficiency":-200,"combustion_accumulation":2},"level_5":{"stamina_regeneration_bonus":-40,"heal_efficiency":-300,"combustion_accumulation":4},"level_6":{"stamina_regeneration_bonus":-60,"heal_efficiency":-300,"thermal_dmg_factor":-100,"combustion_accumulation":8}},
		label: SICKNESS_LABEL_KEYS.thr,
		icon: SICKNESS_ICONS.thr,
	},
	bio: {
		level_bounds: [0,200,500,1000,7500,90000],
		level_damage: [0,2,4,6,8,10,12],
		decrease_speed: 0.5000005,
		max_power: 100000,
		damage_cooldown: 20,
		properties: {"level_1":{"regeneration_bonus":-1.25,"stamina_regeneration_bonus":-2.5,"heal_efficiency":-20,"toxic_accumulation":0.05},"level_2":{"stamina_regeneration_bonus":-2.5,"regeneration_bonus":-2.5,"stamina_bonus":-20,"toxic_accumulation":0.05},"level_3":{"stamina_regeneration_bonus":-5,"health_bonus":-5,"regeneration_bonus":-4,"stamina_bonus":-40,"toxic_accumulation":0.05},"level_4":{"stamina_regeneration_bonus":-12.5,"health_bonus":-10,"regeneration_bonus":-8,"stamina_bonus":-100,"toxic_accumulation":0.1},"level_5":{"stamina_regeneration_bonus":-20,"health_bonus":-15,"regeneration_bonus":-16,"stamina_bonus":-150,"toxic_accumulation":0.15},"level_6":{"stamina_regeneration_bonus":-30,"health_bonus":-15,"regeneration_bonus":-16,"stamina_bonus":-200,"biological_dmg_factor":-100,"toxic_accumulation":0.2}},
		label: SICKNESS_LABEL_KEYS.bio,
		icon: SICKNESS_ICONS.bio,
	},
	psy: {
		level_bounds: [0,200,500,1000,7500,90000],
		level_damage: [0,0,1,2,3,4,5],
		decrease_speed: 0.5000005,
		max_power: 100000,
		damage_cooldown: 20,
		properties: {"level_1":{"heal_efficiency":-20,"stamina_regeneration_bonus":-5},"level_2":{"heal_efficiency":-20,"stamina_regeneration_bonus":-10,"secondary_speed_modifier":-5},"level_3":{"heal_efficiency":-20,"stamina_regeneration_bonus":-20,"health_bonus":-10,"secondary_speed_modifier":-10},"level_4":{"heal_efficiency":-20,"stamina_regeneration_bonus":-40,"health_bonus":-20,"secondary_speed_modifier":-20},"level_5":{"heal_efficiency":-20,"stamina_regeneration_bonus":-60,"health_bonus":-30,"secondary_speed_modifier":-30},"level_6":{"heal_efficiency":-20,"stamina_regeneration_bonus":-100,"health_bonus":-30,"secondary_speed_modifier":-40,"psycho_dmg_factor":-100}},
		label: SICKNESS_LABEL_KEYS.psy,
		icon: SICKNESS_ICONS.psy,
	},
	bld: {
		level_bounds: [0,300,500,1000],
		level_damage: [0,0,1,1.5,2],
		decrease_speed: 0.5000005,
		max_power: 1500,
		damage_cooldown: 20,
		incoming_sickness_factor: 20,
		properties: {"level_1":{"regeneration_bonus":-2.5,"heal_efficiency":-30},"level_2":{"regeneration_bonus":-20,"heal_efficiency":-80},"level_3":{"regeneration_bonus":-30,"heal_efficiency":-130},"level_4":{"regeneration_bonus":-40,"heal_efficiency":-180}},
		label: SICKNESS_LABEL_KEYS.bld,
		icon: SICKNESS_ICONS.bld,
	},
	cmb: {
		level_bounds: [0],
		level_damage: [0,2],
		decrease_speed: 1,
		max_power: 300,
		damage_cooldown: 20,
		incoming_sickness_factor: 3.5,
		properties: {"level_1":{"regeneration_bonus":-5,"heal_efficiency":-65}},
		label: SICKNESS_LABEL_KEYS.cmb,
		icon: SICKNESS_ICONS.cmb,
	},
	txc: {
		level_bounds: [0,25,50,75,150],
		level_damage: [0,0,0.5,0.5,1,1],
		decrease_speed: 0.05,
		max_power: 200,
		damage_cooldown: 20,
		properties: {"level_2":{"regeneration_bonus":-2.5,"heal_efficiency":-25},"level_3":{"regeneration_bonus":-5,"heal_efficiency":-50},"level_4":{"regeneration_bonus":-10,"heal_efficiency":-75},"level_5":{"regeneration_bonus":-25,"heal_efficiency":-150}},
		label: SICKNESS_LABEL_KEYS.txc,
		icon: SICKNESS_ICONS.txc,
	},
	frs: {
		level_bounds: [0,50,500,1500,1550],
		level_damage: [0,0.5,2.5,5,10,15],
		decrease_speed: 1,
		max_power: 100000,
		damage_cooldown: 20,
		reset_ticks: 200,
		properties: {"level_2":{"regeneration_bonus":-10,"stamina_regeneration_bonus":-5,"secondary_speed_modifier":-10,"heal_efficiency":-20},"level_3":{"regeneration_bonus":-15,"stamina_regeneration_bonus":-10,"secondary_speed_modifier":-20,"heal_efficiency":-30},"level_4":{"regeneration_bonus":-20,"stamina_regeneration_bonus":-15,"secondary_speed_modifier":-30,"heal_efficiency":-60},"level_5":{"regeneration_bonus":-25,"stamina_regeneration_bonus":-20,"secondary_speed_modifier":-40,"heal_efficiency":-80}},
		label: SICKNESS_LABEL_KEYS.frs,
		icon: SICKNESS_ICONS.frs,
	},
	gnr: {
		level_bounds: [0,200,500,1000,1100,1200,1300,1400,1500,3000],
		level_damage: [0,0,0,0,1,2,3,5,6,8,30],
		decrease_speed: 0.2,
		max_power: 1850,
		damage_cooldown: 20,
		reset_ticks: 150,
		properties: {"level_1":{"tear_dmg_factor":-50},"level_2":{"tear_dmg_factor":-75},"level_3":{"tear_dmg_factor":-100},"level_4":{"tear_dmg_factor":-110},"level_5":{"tear_dmg_factor":-125},"level_6":{"tear_dmg_factor":-140},"level_7":{"tear_dmg_factor":-150,"regeneration_bonus":-8,"heal_efficiency":-20},"level_8":{"tear_dmg_factor":-160,"regeneration_bonus":-12,"heal_efficiency":-30},"level_9":{"tear_dmg_factor":-170,"regeneration_bonus":-25,"heal_efficiency":-60}},
		label: SICKNESS_LABEL_KEYS.gnr,
		icon: SICKNESS_ICONS.gnr,
	},
	abnormal: {
		level_bounds: [0,1000],
		level_damage: [0,0,1000],
		decrease_speed: 0,
		max_power: 1001,
		damage_cooldown: 20,
		reset_ticks: 25,
		properties: {},
		label: SICKNESS_LABEL_KEYS.abnormal,
		icon: SICKNESS_ICONS.abnormal,
	},
}