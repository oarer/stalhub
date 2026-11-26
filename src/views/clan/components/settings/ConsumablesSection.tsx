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
		<div className="bg-card flex flex-col gap-3 rounded-xl px-5 py-4">
			<div className="flex items-center gap-2 text-lg font-semibold">
				<Icon className="text-xl" icon="lucide:flask-conical" />
				{t('clan.consumables.title')}
			</div>
			<div className="bg-border-secondary/40 flex items-center justify-between gap-3 rounded-lg px-4 py-3">
				<div className="flex flex-col gap-1">
					<span className="text-sm font-semibold">
						{t('clan.consumables.boosts.modeLabel')}
					</span>
					<span className="text-foreground text-sm font-semibold">
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
			<div className="bg-border-secondary/40 flex items-center justify-between gap-3 rounded-lg px-4 py-3">
				<div className="flex flex-col gap-1">
					<span className="text-sm font-semibold">
						{t('clan.consumables.grenade.modeLabel')}
					</span>
					<span className="text-foreground text-sm font-semibold">
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
