'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import DropdownMenu from '@/components/ui/DropDown'
import { useBuildStore } from '@/stores/useBuild.store'
import type { DropdownItem } from '@/types/ui/dropdown.type'

export default function BuildSelector() {
	const {
		savedBuilds,
		loadBuild,
		deleteBuild,
		resetBuild,
		build,
		defaults,
		saveBuild,
	} = useBuildStore()

	const t = useTranslations()

	const hasChanges =
		build.arts.length > 0 ||
		Object.values(build.boost).some((v) => v !== null) ||
		build.armor !== null ||
		build.container !== null ||
		defaults.art.percent !== 85 ||
		defaults.art.potential !== 0 ||
		defaults.armor.level !== 0

	const handleSelect = (key: string) => {
		if (key === 'new') {
			if (hasChanges) {
				saveBuild('Новая сборка')
			}
			resetBuild()
		} else {
			loadBuild(key)
		}
	}

	const items: DropdownItem[] = [
		...savedBuilds.map((saved) => ({
			key: saved.id,
			content: (
				<div
					className="flex w-full items-center justify-between"
					onClick={() => handleSelect(saved.id)}
				>
					<p className="truncate font-semibold">{saved.name}</p>

					<Button
						className="rounded p-1 ring-transparent"
						onClick={(e) => {
							e.stopPropagation()
							deleteBuild(saved.id)
						}}
						variant={'danger'}
					>
						<Icon className="size-4" icon="lucide:trash-2" />
					</Button>
				</div>
			),
		})),

		...(savedBuilds.length
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
					className="flex w-full items-center gap-2"
					onClick={() => handleSelect('new')}
				>
					<Icon className="size-4" icon="lucide:plus" />
					<p className="font-semibold">{t('build.new_build')}</p>
				</div>
			),
		},
	]

	return (
		<DropdownMenu
			blur={false}
			className="font-semibold text-[15px]"
			icon="lucide:package"
			items={items}
			placement="bottom-start"
			title="build.builds"
			variant={'secondary'}
		/>
	)
}
