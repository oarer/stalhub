'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CheckBox } from '@/components/ui/CheckBox'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { Tabs } from '@/components/ui/Tabs'
import { MAX_UPGRADE_LEVEL } from '@/constants/upgrade.const'
import { cn } from '@/lib/cn'
import type { CostInputs, UpgradeMode, UpgradeTarget } from '../utils/upgrade'

interface UpgradeFormProps {
	target: UpgradeTarget
	mode: UpgradeMode
	fromLevel: number
	toLevel: number
	costs: CostInputs
	artifactOptions: { key: string; label: string }[]
	selectedArtifactLabel: string
	onTargetChange: (target: UpgradeTarget) => void
	onModeChange: (mode: UpgradeMode) => void
	onFromLevelChange: (level: number) => void
	onToLevelChange: (level: number) => void
	onCostsChange: (costs: CostInputs) => void
}

function LevelPicker({
	from = 0,
	min = 0,
	max = MAX_UPGRADE_LEVEL,
	value,
	onChange,
}: {
	from?: number
	min?: number
	max?: number
	value: number
	onChange: (level: number) => void
}) {
	const levels = useMemo(
		() => Array.from({ length: max - min + 1 }, (_, i) => i + min),
		[min, max]
	)

	return (
		<div className="flex flex-wrap gap-1.5">
			{levels.map((level) => (
				<Button
					className="min-w-9 px-2 py-1"
					key={level}
					onClick={() => onChange(level)}
					size="sm"
					type="button"
					variant={value === level ? 'primary' : 'outline'}
				>
					<span
						className={`${montserrat.className} font-bold text-md`}
					>
						{level}
					</span>
				</Button>
			))}
		</div>
	)
}

function Field({
	icon,
	label,
	children,
}: {
	icon: string
	label: string
	children: React.ReactNode
}) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2">
				<Icon className="text-lg text-neutral-400" icon={icon} />
				<p className="font-semibold text-sm">{label}</p>
			</div>
			{children}
		</div>
	)
}

export function UpgradeForm({
	target,
	mode,
	fromLevel,
	toLevel,
	costs,
	artifactOptions,
	onTargetChange,
	onModeChange,
	onFromLevelChange,
	onToLevelChange,
	onCostsChange,
}: UpgradeFormProps) {
	const t = useTranslations()

	const artifactComboboxOptions = useMemo<ComboboxOption[]>(
		() =>
			artifactOptions.map((o) => ({
				value: o.key,
				label: o.label,
			})),
		[artifactOptions]
	)

	return (
		<Card.Root className="flex flex-col gap-6">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<Tabs.Root
					onValueChange={(v) => onTargetChange(v as UpgradeTarget)}
					value={target}
				>
					<Tabs.List className="flex w-full md:w-auto">
						<Tabs.Trigger value="artefact">
							<Icon className="size-4" icon="lucide:gem" />
							{t('upgrade.tabs.artefact')}
						</Tabs.Trigger>
						<Tabs.Trigger value="armor">
							<Icon className="size-4" icon="lucide:shield" />
							{t('upgrade.tabs.armor')}
						</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>

				<Tabs.Root
					onValueChange={(v) => onModeChange(v as UpgradeMode)}
					value={mode}
				>
					<Tabs.List className="flex w-full md:w-auto">
						<Tabs.Trigger value="luck">
							<Icon className="size-4" icon="lucide:dices" />
							{t('upgrade.mode.luck')}
						</Tabs.Trigger>
						<Tabs.Trigger value="guarantee">
							<Icon
								className="size-4"
								icon="lucide:shield-check"
							/>
							{t('upgrade.mode.guarantee')}
						</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>
			</div>

			<div className="flex flex-col gap-6">
				{target === 'artefact' && (
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<Field
							icon="lucide:gem"
							label={t('upgrade.cost.artifact')}
						>
							<Combobox
								emptyText="upgrade.cost.artifact_empty"
								onValueChange={(value) =>
									onCostsChange({
										...costs,
										artifactKey: value,
									})
								}
								options={artifactComboboxOptions}
								placeholder="upgrade.cost.artifact_placeholder"
								searchPlaceholder="upgrade.cost.artifact_search"
								translateOptions={false}
								value={costs.artifactKey}
							/>
						</Field>

						<Field
							icon="lucide:flask-conical"
							label={t('upgrade.cost.amplifier')}
						>
							<div
								className={cn(
									'flex h-full flex-col gap-3 rounded-lg bg-card/70 px-3 py-2.5 ring-2',
									costs.useAmplifier
										? 'ring-primary/60'
										: 'ring-primary/15'
								)}
							>
								<CheckBox
									checked={costs.useAmplifier}
									label={t('upgrade.cost.use_amplifier')}
									onCheckedChange={(checked) =>
										onCostsChange({
											...costs,
											useAmplifier: checked,
										})
									}
								/>
							</div>
						</Field>
					</div>
				)}

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<Field
						icon="lucide:arrow-up-from-line"
						label={t('upgrade.levels.from')}
					>
						<LevelPicker
							max={MAX_UPGRADE_LEVEL - 1}
							onChange={onFromLevelChange}
							value={fromLevel}
						/>
					</Field>

					<Field
						icon="lucide:arrow-up-to-line"
						label={t('upgrade.levels.to')}
					>
						<LevelPicker
							from={fromLevel}
							min={1}
							onChange={onToLevelChange}
							value={toLevel}
						/>
					</Field>
				</div>
			</div>
		</Card.Root>
	)
}
