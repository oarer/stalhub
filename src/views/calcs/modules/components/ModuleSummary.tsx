'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Card } from '@/components/ui/Card'
import { CopyButton } from '@/components/ui/CopyButton'
import { cn } from '@/lib/cn'
import type {
	ModuleGroupKey,
	ModuleRarity,
	ModuleSlotConfig,
} from '@/types/module.type'
import {
	getModuleByKey,
	getModuleCosts,
	getModuleStatValue,
	getRarityByQuality,
	RARITY_COLORS,
} from '../utils/moduleCalc'

interface ModuleSummaryProps {
	slots: Record<ModuleGroupKey, ModuleSlotConfig>
}

export function ModuleSummary({ slots }: ModuleSummaryProps) {
	const t = useTranslations()
	const stats = new Map<
		string,
		{
			name: string
			value: number
			type: 'positive' | 'negative' | 'special'
		}
	>()

	let reroll = 0
	let disassemble = 0
	let restore = 0
	let category = 0

	const selectedModules: {
		key: ModuleGroupKey
		name: string
		rarity: ModuleRarity
	}[] = []

	for (const groupKey of Object.keys(slots) as ModuleGroupKey[]) {
		const slot = slots[groupKey]
		if (!slot.moduleKey) continue

		const module = getModuleByKey(groupKey, slot.moduleKey)
		if (!module) continue

		selectedModules.push({
			key: groupKey,
			name: module.lines.ru,
			rarity: getRarityByQuality(slot.quality),
		})

		const costs = getModuleCosts(slot.quality)
		reroll += costs.reroll
		disassemble += costs.disassemble
		restore += costs.restore
		category += costs.category

		for (const stat of module.stats) {
			const value = getModuleStatValue(stat, slot.quality)
			const existing = stats.get(stat.key)
			if (existing) {
				existing.value += value
			} else {
				stats.set(stat.key, {
					name: stat.lines.ru,
					value,
					type: stat.type,
				})
			}
		}
	}

	const hasModules = Object.values(slots).some((s) => s.moduleKey)

	return (
		<Card.Root>
			<Card.Header>
				<Card.Title className="justify-start">
					<Icon className="text-lg" icon="lucide:layers" />
					<p className="font-semibold text-lg">{t('modules.summary')}</p>
				</Card.Title>
			</Card.Header>
			{!hasModules ? (
				<p className="py-2 text-center font-semibold text-sm">
					{t('modules.summaryEmpty')}
				</p>
			) : (
				<>
					<div className="flex items-center justify-between gap-4 rounded-lg bg-accent/50 p-2.5 text-lg">
						<div className="flex gap-2">
							{selectedModules.map(({ key, name, rarity }) => (
								<span
									className="font-semibold"
									key={key}
									style={{ color: RARITY_COLORS[rarity] }}
								>
									{name}
								</span>
							))}
						</div>
						<CopyButton
							size="lg"
							text={selectedModules
								.map(({ name }) => name)
								.join(' ')}
							variant="ghost"
						/>
					</div>

					<div className="flex flex-col gap-1 rounded-lg bg-accent/50 p-2.5">
						{Array.from(stats.entries()).map(([key, stat]) => (
							<div
								className="flex items-center justify-between gap-2 text-sm"
								key={key}
							>
								<span className="font-semibold">
									{stat.name}
								</span>
								<span
									className={cn(
										'font-semibold',
										montserrat.className,
										stat.type === 'negative'
											? 'text-red-400'
											: stat.type === 'special'
												? 'text-blue-400'
												: 'text-green-400'
									)}
								>
									{stat.value > 0 ? '+' : ''}
									{stat.value.toFixed(2)}%
								</span>
							</div>
						))}
					</div>

					<div className="flex flex-col gap-1 border-border/40 border-t pt-2 text-sm">
						<div className="flex justify-between">
							<span className="font-semibold">
								{t('modules.rerollCost')}
							</span>
							<span
								className={`${montserrat.className} font-semibold`}
							>
								{reroll}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="font-semibold">
								{t('modules.disassembleCost')}
							</span>
							<span
								className={`${montserrat.className} font-semibold`}
							>
								{disassemble}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="font-semibold">
								{t('modules.restoreCost')}
							</span>
							<span
								className={`${montserrat.className} font-semibold`}
							>
								{restore}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="font-semibold">
								{t('modules.categoryCost')}
							</span>
							<span
								className={`${montserrat.className} font-semibold`}
							>
								{category}
							</span>
						</div>
					</div>
				</>
			)}
		</Card.Root>
	)
}
