'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Switch } from '@/components/ui/Switch'
import type { BoostMode } from '@/types/clan/clan.type'

interface BoostModeSectionProps {
	boostMode: BoostMode
	grenadeMode: BoostMode
	onSetBoostMode: (mode: BoostMode) => void
	onSetGrenadeMode: (mode: BoostMode) => void
}

export function ConsumablesSection({
	boostMode,
	grenadeMode,
	onSetBoostMode,
	onSetGrenadeMode,
}: BoostModeSectionProps) {
	const t = useTranslations()
	return (
		<div className="flex flex-col gap-3 rounded-xl bg-card px-5 py-4">
			<div className="flex items-center gap-2 font-semibold text-lg">
				<Icon className="text-xl" icon="lucide:flask-conical" />
				{t('clan.consumables.title')}
			</div>
			<div className="flex items-center justify-between gap-3 rounded-lg bg-border-secondary/40 px-4 py-3">
				<div className="flex flex-col gap-1">
					<span className="font-semibold text-sm">
						{t('clan.consumables.boosts.modeLabel')}
					</span>
					<span className="font-semibold text-sm text-text-accent">
						{t('clan.consumables.boosts.modeHint')}
					</span>
				</div>
				<div className="flex gap-2">
					<Switch
						checked={boostMode === 'ISSUED'}
						onCheckedChange={(checked) => {
							onSetBoostMode(checked ? 'ISSUED' : 'SELF')
						}}
					/>
				</div>
			</div>
			<div className="flex items-center justify-between gap-3 rounded-lg bg-border-secondary/40 px-4 py-3">
				<div className="flex flex-col gap-1">
					<span className="font-semibold text-sm">
						{t('clan.consumables.grenade.modeLabel')}
					</span>
					<span className="font-semibold text-sm text-text-accent">
						{t('clan.consumables.grenade.modeHint')}
					</span>
				</div>
				<div className="flex gap-2">
					<Switch
						checked={grenadeMode === 'ISSUED'}
						onCheckedChange={(checked) => {
							onSetGrenadeMode(checked ? 'ISSUED' : 'SELF')
						}}
					/>
				</div>
			</div>
		</div>
	)
}
