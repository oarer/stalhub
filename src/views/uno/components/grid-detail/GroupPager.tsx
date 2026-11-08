'use client'

import { useTranslations } from 'next-intl'
import { Pagination } from '@/components/ui/Pagination'
import type { UnoGridGroup } from '@/types/uno/uno.type'

export function GroupPager({
	groups,
	selectedNumber,
	onSelect,
}: {
	groups: UnoGridGroup[]
	selectedNumber: number | null
	onSelect: (number: number) => void
}) {
	const t = useTranslations('uno')
	if (groups.length <= 1) return null

	const index = groups.findIndex((group) => group.number === selectedNumber)
	const page = (index < 0 ? 0 : index) + 1

	return (
		<div className="flex flex-wrap items-center gap-2">
			<span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
				{t('grids.detail.group')}:
			</span>
			<Pagination
				onPageChange={(nextPage) => {
					const nextGroup = groups[nextPage - 1]
					if (nextGroup) onSelect(nextGroup.number)
				}}
				page={page}
				totalPages={groups.length}
			/>
		</div>
	)
}
