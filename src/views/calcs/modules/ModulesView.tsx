'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Alert } from '@/components/ui/Alert'
import { MODULE_GROUP_KEYS, useModulesStore } from '@/stores/useModules.store'
import type { ModuleGroupKey } from '@/types/module.type'
import { ModuleGroupCard } from './components/ModuleGroupCard'
import ModuleSelector from './components/ModuleSelector'
import { ModuleSummary } from './components/ModuleSummary'

type ModulesViewProps = {
	variant?: 'page' | 'widget'
}

export function ModulesView({ variant = 'page' }: ModulesViewProps) {
	const t = useTranslations()
	const { slots, setModule, setQuality, resetGroup, load, status } =
		useModulesStore()

	useEffect(() => {
		load()
	}, [load])

	const handleQuality = useCallback(
		(group: ModuleGroupKey) => (quality: number) =>
			setQuality(group, quality),
		[setQuality]
	)
	const handleSelect = useCallback(
		(group: ModuleGroupKey) => (moduleKey: string) =>
			setModule(group, moduleKey),
		[setModule]
	)
	const handleReset = useCallback(
		(group: ModuleGroupKey) => () => resetGroup(group),
		[resetGroup]
	)

	return (
		<section
			className={
				variant === 'widget'
					? 'flex flex-col gap-4'
					: 'mx-auto flex max-w-7xl flex-col gap-10 px-4 pt-32 pb-12 lg:pt-36'
			}
		>
			{variant === 'page' && (
				<div className="text-center">
					<h1
						className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
					>
						{t('modules.title')}
					</h1>
					<p className="font-medium text-muted-foreground text-sm">
						{t('modules.sub_title')}
					</p>
				</div>
			)}

			{status === 'error' && (
				<Alert.Root variant="warning">
					<Alert.Description>
						{t('modules.fetch_error')}
					</Alert.Description>
				</Alert.Root>
			)}

			<div className="flex items-center justify-end">
				<ModuleSelector />
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				{MODULE_GROUP_KEYS.map((group) => (
					<ModuleGroupCard
						group={group}
						key={group}
						onQuality={handleQuality(group)}
						onReset={handleReset(group)}
						onSelect={handleSelect(group)}
						slot={slots[group]}
					/>
				))}
			</div>

			<ModuleSummary slots={slots} />
		</section>
	)
}
