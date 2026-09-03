'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { montserrat } from '@/app/fonts'
import DropdownMenu from '@/components/ui/DropDown'
import { SICKNESS, SICKNESS_LABEL_KEYS } from '@/constants/sickness'
import { cn } from '@/lib/cn'
import { useBuildStore } from '@/stores/useBuild.store'
import type { SicknessKey } from '@/types/sickness.type'
import type { DropdownItem } from '@/types/ui/dropdown.type'

export function SicknessSelector() {
	const t = useTranslations()
	const sickness = useBuildStore((s) => s.build.sickness)
	const setSicknessLevel = useBuildStore((s) => s.setSicknessLevel)

	const available = useMemo(
		() =>
			Object.entries(SICKNESS).filter(
				([, def]) => Object.keys(def.properties).length > 0
			),
		[]
	)

	const items = useMemo<DropdownItem[]>(() => {
		const list: DropdownItem[] = []

		for (const [key, def] of available) {
			const k = key as SicknessKey
			const currentLevel = sickness?.[k] ?? 0
			list.push({
				key,
				content: (
					<div
						className={cn(
							'flex w-full min-w-0 items-center justify-between gap-2 rounded-lg py-1',
							currentLevel > 0 && 'text-red-300'
						)}
					>
						<div className="flex min-w-0 items-center gap-2">
							<Icon
								className={cn(
									'shrink-0',
									currentLevel > 0
										? 'text-red-400'
										: 'text-neutral-500'
								)}
								icon={def.icon}
							/>
							<p className="truncate font-semibold text-md">
								{t(SICKNESS_LABEL_KEYS[k])}
							</p>
						</div>
						<div className="flex items-center gap-2">
							{Object.keys(def.properties).map((lvlKey) => {
								const lvl = Number(lvlKey.replace('level_', ''))
								return (
									<button
										className={cn(
											'flex shrink-0 cursor-pointer items-center justify-center rounded-md px-2 py-1 font-semibold text-xs transition-colors',
											currentLevel === lvl
												? 'bg-red-500/30 text-red-300 ring-1 ring-red-500/50'
												: 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
										)}
										key={lvlKey}
										onClick={(e) => {
											e.stopPropagation()
											setSicknessLevel(
												k,
												currentLevel === lvl ? 0 : lvl
											)
										}}
										type="button"
									>
										<p
											className={`${montserrat.className}`}
										>
											{lvl}
										</p>
									</button>
								)
							})}
						</div>
					</div>
				),
			})
		}

		return list
	}, [available, sickness, setSicknessLevel, t])

	return (
		<DropdownMenu
			className="rounded-lg"
			icon="lucide:skull"
			items={items}
			mobileSheet
			onlyIcon
			placement="bottom-end"
			title="build.sickness.title"
			variant="secondary"
		/>
	)
}
