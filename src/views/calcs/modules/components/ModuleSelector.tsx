'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import DropdownMenu from '@/components/ui/DropDown'
import { useModulesStore } from '@/stores/useModules.store'
import type { DropdownItem } from '@/types/ui/dropdown.type'

export default function ModuleSelector() {
	const {
		savedModules,
		currentModuleId,
		slots,
		saveModule,
		loadModule,
		deleteModule,
		autoSave,
		resetModule,
		data,
	} = useModulesStore()

	const t = useTranslations()

	const hasModules = Object.values(slots).some((s) => s.moduleKey)

	const handleSelect = useCallback(
		(key: string) => {
			if (key === 'new') {
				if (hasModules) {
					if (currentModuleId) {
						autoSave()
					} else {
						const groupLabels = [
							'add-on',
							'deviation',
							'concept',
						]
							.map((gKey) => {
								const group = data.groups.find(
									(g) => g.key === gKey
								)
								return group?.lines.ru ?? gKey
							})
							.filter(
								(_, i) =>
									slots[
										(['add-on', 'deviation', 'concept'] as const)[i]
									].moduleKey
							)
							.join(', ')

						const name = groupLabels
							? `Модули: ${groupLabels}`
							: 'Новая конфигурация'
						saveModule(name)
					}
				}
				resetModule()
			} else {
				loadModule(key)
			}
		},
		[
			hasModules,
			currentModuleId,
			autoSave,
			saveModule,
			resetModule,
			loadModule,
			slots,
			data.groups,
		]
	)

	const items = useMemo<DropdownItem[]>(
		() => [
			...savedModules.map((saved) => ({
				key: saved.id,
				content: (
					<div
						className="flex w-full cursor-pointer items-center justify-between rounded-lg bg-transparent px-2 py-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
						onClick={() => handleSelect(saved.id)}
					>
						<p className="truncate font-semibold">{saved.name}</p>

						<Button
							className="rounded p-1 ring-transparent"
							onClick={(e) => {
								e.stopPropagation()
								deleteModule(saved.id)
							}}
							variant={'danger'}
						>
							<Icon className="size-4" icon="lucide:trash-2" />
						</Button>
					</div>
				),
			})),

			...(savedModules.length
				? [
						{
							key: 'divider',
							divider: true,
							content: null,
						},
					]
				: []),

			{
				key: 'new',
				content: (
					<div
						className="flex w-full cursor-pointer items-center justify-between rounded-lg bg-transparent px-2 py-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
						onClick={() => handleSelect('new')}
					>
						<p className="font-semibold">{t('modules.newModule')}</p>
						<Icon className="size-4" icon="lucide:plus" />
					</div>
				),
			},
		],
		[savedModules, handleSelect, t, deleteModule]
	)

	return (
		<DropdownMenu
			blur={false}
			className="font-semibold text-[15px]"
			icon="lucide:layers"
			items={items}
			placement="bottom-start"
			title="modules.save"
			variant={'secondary'}
		/>
	)
}
