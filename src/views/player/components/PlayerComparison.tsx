'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { CLink } from '@/components/ui/Link'
import type { Regions } from '@/types/api.type'

type PlayerComparisonProps = {
	region: Regions
	character: string
}

export function PlayerComparison({ region, character }: PlayerComparisonProps) {
	const t = useTranslations()
	const params = new URLSearchParams()
	params.append('players', `${region}/${character}`)

	return (
		<CLink
			className="gap-2"
			href={`/player/compare?${params.toString()}`}
			variant={'secondary'}
		>
			<Icon className="text-lg" icon="lucide:git-compare-arrows" />
			{t('player.comparison.button')}
		</CLink>
	)
}
