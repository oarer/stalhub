'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/cn'
import { normalizeUnoFaction } from '../utils/uno.utils'

export function UnoFaction({
	faction,
	size = 18,
	showLabel = true,
	className,
	labelClassName,
	fallback = '—',
}: {
	faction: string | null | undefined
	size?: number
	showLabel?: boolean
	className?: string
	labelClassName?: string
	fallback?: string
}) {
	const t = useTranslations()
	const key = normalizeUnoFaction(faction)

	if (!key) {
		return <span className={labelClassName}>{faction ?? fallback}</span>
	}

	const label = t(`player.alliance.${key}`)

	return (
		<span
			className={cn('inline-flex min-w-0 items-center gap-2', className)}
		>
			<Image
				alt={showLabel ? '' : label}
				className="shrink-0"
				height={size}
				src={`/images/alliance/${key}.png`}
				width={size}
			/>
			{showLabel && (
				<span className={cn('truncate', labelClassName)}>{label}</span>
			)}
		</span>
	)
}
