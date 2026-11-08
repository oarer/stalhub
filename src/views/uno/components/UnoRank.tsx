'use client'

import { mtsExtended } from '@/app/fonts'
import { cn } from '@/lib/cn'
import { unoRankColor } from '../utils/uno.utils'

export function UnoRank({
	rank,
	className,
}: {
	rank: string | null | undefined
	className?: string
}) {
	if (!rank) return <span className={className}>—</span>

	return (
		<span
			className={cn(
				'py-3 font-semibold text-lg leading-0',
				unoRankColor(rank),
				className,
				mtsExtended.className
			)}
		>
			{rank}
		</span>
	)
}
