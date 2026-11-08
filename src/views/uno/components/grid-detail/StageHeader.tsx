'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { UnoMap } from '../UnoMap'
import type { MatchView } from './grid-detail.types'

export function StageHeader({
	index,
	matches,
}: {
	index: number
	matches: MatchView[]
}) {
	const t = useTranslations('uno')
	const maps = useMemo(
		() => [
			...new Set(
				matches
					.map((view) => view.match.map)
					.filter((map): map is string => Boolean(map))
			),
		],
		[matches]
	)

	return (
		<div className="flex flex-col items-center gap-1">
			<span>{`${t('grids.detail.stage')} ${index + 1}`}</span>
			{maps.length > 0 && (
				<span className="flex flex-wrap items-center justify-center gap-x-1 text-[10px]">
					{maps.map((map, mapIndex) => (
						<span key={map}>
							{mapIndex > 0 && ' · '}
							<UnoMap map={map} />
						</span>
					))}
				</span>
			)}
		</div>
	)
}
