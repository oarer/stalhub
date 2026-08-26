'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { unbounded } from '@/app/fonts'
import { Alert } from '@/components/ui/Alert'
import { MODULE_GROUP_KEYS, useModulesStore } from '@/stores/useModules.store'
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
						className={`${unbounded.className} mb-2 font-semibold text-3xl tracking-tight md:text-3xl xl:text-4xl`}
					>
						{t('modules.title')}
					</h1>
					<p className="font-semibold text-sm text-text-accent">
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
						onQuality={(quality) => setQuality(group, quality)}
						onReset={() => resetGroup(group)}
						onSelect={(moduleKey) => setModule(group, moduleKey)}
						slot={slots[group]}
					/>
				))}
			</div>

			<ModuleSummary slots={slots} />
		</section>
	)
}
