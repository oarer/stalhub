export type ComparisonDirection = 'higher' | 'lower' | null

const HIGHER_OVERRIDES = [
	/^weapon\.stat_factor\.reload_modifier$/i,
	/^weapon\.stat_factor\.shoot_factor_decrement$/i,
]

const LOWER_IS_BETTER = [
	/(^|\.)weight$/i,
	/reload/i,
	/spread/i,
	/recoil/i,
	/wiggle/i,
	/draw_time/i,
	/aim_switch/i,
	/switch_cooldown/i,
	/holster_time/i,
	/burst_delay/i,
	/concentration_stamina_modifier$/i,
	/incoming_/i,
]

const HIGHER_IS_BETTER = [
	/damage/i,
	/durability/i,
	/rate_of_fire/i,
	/clip_size/i,
	/capacity/i,
	/distance/i,
	/piercing/i,
	/penetrating/i,
	/multiplier/i,
	/resistance/i,
	/speed_modifier/i,
	/(^|\.)range$/i,
	/radius/i,
	/(^|\.)angle$/i,
	/bleeding/i,
	/stopping_power/i,
	/burst_shots/i,
	/overheat_limit/i,
	/^stalker\.artefact_properties\.factor\./i,
]

export const getComparisonDirection = (
	statKey: string
): ComparisonDirection => {
	if (!statKey) return null
	if (HIGHER_OVERRIDES.some((pattern) => pattern.test(statKey)))
		return 'higher'
	if (LOWER_IS_BETTER.some((pattern) => pattern.test(statKey))) return 'lower'
	if (HIGHER_IS_BETTER.some((pattern) => pattern.test(statKey)))
		return 'higher'
	return null
}
