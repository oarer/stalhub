'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { unoQueries } from '@/queries/uno/uno.queries'
import { BracketBoard } from './components/grid-detail/BracketBoard'
import { DateBadge } from './components/grid-detail/DateBadge'
import { GridDetailHeader } from './components/grid-detail/GridDetailHeader'
import { GroupPager } from './components/grid-detail/GroupPager'
import { RankBlock } from './components/grid-detail/RankBlock'
import { UnoEmpty } from './components/UnoEmpty'
import { UnoFeedback } from './components/UnoFeedback'
import { useFullscreen } from './hooks/useFullscreen'
import { useUnoGridNavigation } from './hooks/useUnoGridNavigation'

export default function UnoGridDetailView({ gridId }: { gridId: string }) {
	const t = useTranslations('uno')
	const query = useQuery(unoQueries.grid(gridId))
	const gridsQuery = useQuery(unoQueries.grids())
	const data = query.data
	const grid = data?.grid
	const groups = data?.groups ?? []
	const coverage = data?.coverage
	const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
	const boardRef = useRef<HTMLDivElement>(null)
	const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(boardRef)

	const { prevGrid, nextGrid } = useUnoGridNavigation({
		gridId,
		gridMode: grid?.mode,
		gridItems: gridsQuery.data?.items ?? [],
		groups,
		selectedNumber,
		onSelectGroup: setSelectedNumber,
	})

	const selectedGroup = useMemo(
		() =>
			groups.find((group) => group.number === selectedNumber) ??
			groups[0] ??
			null,
		[groups, selectedNumber]
	)

	return (
		<section className="mx-auto max-w-380 px-4 pt-42 pb-12 sm:px-6">
			<UnoFeedback
				isError={query.isError}
				isLoading={query.isPending}
				onRetry={() => void query.refetch()}
			>
				{!grid?.id ? (
					<UnoEmpty>{t('grids.empty')}</UnoEmpty>
				) : (
					<Card.Root
						className={cn(
							'gap-0 overflow-hidden p-0',
							isFullscreen && 'h-screen overflow-auto p-4'
						)}
						ref={boardRef}
					>
						<GridDetailHeader
							isFullscreen={isFullscreen}
							nextGrid={nextGrid}
							number={grid.number}
							onToggleFullscreen={toggleFullscreen}
							prevGrid={prevGrid}
						/>

						{coverage && !coverage.complete && (
							<div className="border-border-secondary border-b bg-warning/10 px-4 py-2 text-warning text-xs">
								{t('grids.detail.coverageIncomplete', {
									downloaded: coverage.downloadedGroups ?? 0,
									expected: coverage.expectedGroups ?? 0,
								})}
							</div>
						)}

						{selectedGroup ? (
							<>
								<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-border-secondary border-b p-2">
									<div className="justify-self-start">
										<RankBlock group={selectedGroup} />
									</div>

									<DateBadge date={grid.date} />

									<div className="justify-self-end">
										<GroupPager
											groups={groups}
											onSelect={setSelectedNumber}
											selectedNumber={selectedNumber}
										/>
									</div>
								</div>
								<BracketBoard group={selectedGroup} />
							</>
						) : (
							<div className="p-4">
								<UnoEmpty>{t('grids.detail.noClans')}</UnoEmpty>
							</div>
						)}
					</Card.Root>
				)}
			</UnoFeedback>
		</section>
	)
}
