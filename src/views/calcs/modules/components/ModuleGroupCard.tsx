'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Combobox } from '@/components/ui/Combobox'
import { Divider } from '@/components/ui/Divider'
import Input from '@/components/ui/Input'
import Slider from '@/components/ui/Slider'
import { cn } from '@/lib/cn'
import type { ModuleGroupKey, ModuleSlotConfig } from '@/types/module.type'
import {
	getGroupModules,
	getModuleByKey,
	getModuleCosts,
	getModuleStatValue,
	getRarityByQuality,
	QUALITY_MAX,
	QUALITY_MIN,
	RARITY_COLORS,
} from '../utils/moduleCalc'

function formatStat(value: number, type: string): string {
	const sign = value > 0 ? '+' : ''
	return `${sign}${value.toFixed(2)}%`
}

interface ModuleGroupCardProps {
	group: ModuleGroupKey
	slot: ModuleSlotConfig
	onSelect: (moduleKey: string) => void
	onQuality: (quality: number) => void
	onReset: () => void
}

export function ModuleGroupCard({
	group,
	slot,
	onSelect,
	onQuality,
	onReset,
}: ModuleGroupCardProps) {
	const module = getModuleByKey(group, slot.moduleKey)
	const rarity = getRarityByQuality(slot.quality)
	const costs = getModuleCosts(slot.quality)
	const t = useTranslations()

	const moduleOptions = getGroupModules(group).map((m) => ({
		value: m.key,
		label: m.lines.ru,
	}))

	const label =
		group === 'add-on'
			? 'Группа надстроек'
			: group === 'deviation'
				? 'Группа отклонения'
				: 'Группа концепта'

	return (
		<Card.Root>
			<div className="flex items-center justify-between gap-2">
				<p className="font-semibold text-sm text-text-accent dark:text-neutral-300">
					{label}
				</p>
				{slot.moduleKey && (
					<Button
						className="p-2 ring-0"
						onClick={onReset}
						size={'sm'}
						title="Сбросить"
						variant={'danger'}
					>
						<Icon icon="lucide:x" />
					</Button>
				)}
			</div>

			<Combobox
				emptyText="modules.picker_empty"
				onValueChange={onSelect}
				options={moduleOptions}
				placeholder="modules.picker_placeholder"
				searchPlaceholder="modules.picker_search"
				value={slot.moduleKey}
			/>

			{!module ? (
				<p className="py-2 text-center text-sm text-text-accent">
					{t('modules.not_selected')}
				</p>
			) : (
				<>
					<div className="flex flex-col gap-1">
						<p className="font-bold text-lg">{module.lines.ru}</p>
						{module.description && (
							<p className="font-semibold text-border text-xs">
								{module.description.ru}
							</p>
						)}
					</div>

					<div className="flex flex-col gap-1.5">
						<div className="flex items-center gap-2">
							<Input
								label="modules.quality"
								max={QUALITY_MAX}
								min={QUALITY_MIN}
								onChange={(e) => {
									const parsed = Number(e.target.value)
									if (!Number.isNaN(parsed)) {
										onQuality(
											Math.max(
												QUALITY_MIN,
												Math.min(QUALITY_MAX, parsed)
											)
										)
									}
								}}
								step="0.01"
								type="number"
								value={slot.quality}
							/>
							<span
								className="rounded bg-accent/50 px-3 py-2 font-bold text-sm"
								style={{ color: RARITY_COLORS[rarity] }}
							>
								{t(`arts.ART_QUALITY_${rarity.toUpperCase()}`)}
							</span>
						</div>

						<Slider
							max={QUALITY_MAX}
							min={QUALITY_MIN}
							onValueChange={onQuality}
							step={0.01}
							value={slot.quality}
						/>
					</div>

					<div className="flex flex-col gap-1 rounded-lg bg-neutral-800/30 p-2.5">
						{module.stats.map((stat) => {
							const value = getModuleStatValue(stat, slot.quality)
							return (
								<div
									className="flex items-center justify-between gap-2 text-sm"
									key={stat.key}
								>
									<span className="font-semibold">
										{stat.lines.ru}
									</span>
									<span
										className={cn(
											'font-semibold text-sm',
											montserrat.className,
											stat.type === 'negative'
												? 'text-red-400'
												: stat.type === 'special'
													? 'text-blue-400'
													: 'text-green-400'
										)}
									>
										{formatStat(value, stat.type)}
									</span>
								</div>
							)
						})}
					</div>
					<Divider />
					<div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
						<div className="flex justify-between">
							<span className="font-semibold text-text-accent">
								Реролл
							</span>
							<span
								className={`${montserrat.className} font-bold`}
							>
								{costs.reroll}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="font-semibold text-text-accent">
								Разбор
							</span>
							<span
								className={`${montserrat.className} font-bold`}
							>
								{costs.disassemble}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="font-semibold text-text-accent">
								Восстановление
							</span>
							<span
								className={`${montserrat.className} font-bold`}
							>
								{costs.restore}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="font-semibold text-text-accent">
								Категория
							</span>
							<span
								className={`${montserrat.className} font-bold`}
							>
								{costs.category}
							</span>
						</div>
					</div>
				</>
			)}
		</Card.Root>
	)
}
