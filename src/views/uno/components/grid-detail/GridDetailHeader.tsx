'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CLink } from '@/components/ui/Link'
import type { UnoGridSummary } from '@/types/uno/uno.type'
import { GridNavLink } from './GridNavLink'

export function GridDetailHeader({
	number,
	prevGrid,
	nextGrid,
	isFullscreen,
	onToggleFullscreen,
}: {
	number: number | null
	prevGrid: UnoGridSummary | null
	nextGrid: UnoGridSummary | null
	isFullscreen: boolean
	onToggleFullscreen: () => void
}) {
	const t = useTranslations('uno')

	return (
		<div className="grid items-center gap-2 border-border-secondary border-b p-2 lg:grid-cols-[1fr_auto_1fr]">
			<CLink
				className="w-fit gap-2 px-3 py-2"
				href="/uno/grids"
				size="sm"
				variant="secondary"
			>
				<Icon
					className="text-muted-foreground"
					icon="lucide:layout-grid"
				/>
				<span className="font-semibold uppercase tracking-wide">
					{t('grids.modeTitle')}
				</span>
			</CLink>

			<div className="flex items-center justify-center gap-1 justify-self-center">
				<GridNavLink direction="prev" grid={prevGrid} />
				<Badge className="px-4 py-2" variant="primary">
					{t('grids.detail.gridNumber', {
						number: number ?? '—',
					})}
				</Badge>
				<GridNavLink direction="next" grid={nextGrid} />
			</div>

			<Button
				aria-label={t('grids.detail.fullscreen')}
				className="justify-self-end p-2"
				onClick={onToggleFullscreen}
				size="sm"
				type="button"
				variant="secondary"
			>
				<Icon
					icon={isFullscreen ? 'lucide:minimize' : 'lucide:maximize'}
				/>
			</Button>
		</div>
	)
}
