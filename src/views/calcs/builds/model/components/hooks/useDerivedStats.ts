'use client'

import { useMemo } from 'react'
import type { BuildStats } from './buildStatsUtils'

export function useDerivedStats(stats: BuildStats) {
	const prime = useMemo(() => {
		const bulletDmg =
			stats['stalker.artefact_properties.factor.bullet_dmg_factor'] ?? 0
		const healthBonus =
			stats['stalker.artefact_properties.factor.health_bonus'] ?? 0
		return Number(((100 + bulletDmg) * (healthBonus + 100)) / 100).toFixed(
			2
		)
	}, [stats])

	const hps = useMemo(() => {
		const artefaktHeal =
			stats['stalker.artefact_properties.factor.artefakt_heal'] ?? 0
		const heal_efficiency =
			stats['stalker.artefact_properties.factor.heal_efficiency'] ?? 0
		const regenerationBonus =
			stats['stalker.artefact_properties.factor.regeneration_bonus'] ?? 0

		return (
			artefaktHeal * (1 + heal_efficiency / 100) +
			regenerationBonus / 5
		).toFixed(2)
	}, [stats])

	return { prime, hps }
}
