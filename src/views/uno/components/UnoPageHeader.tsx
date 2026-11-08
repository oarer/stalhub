'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { mtsExtended } from '@/app/fonts'
import { CLink } from '@/components/ui/Link'
import { cn } from '@/lib/cn'

export function UnoPageHeader({
	title,
	description,
	backHref,
	backLabel,
	actions,
	className,
}: {
	title: React.ReactNode
	description?: React.ReactNode
	backHref?: string
	backLabel?: string
	actions?: React.ReactNode
	className?: string
}) {
	const t = useTranslations('uno')

	return (
		<header className={cn('space-y-4', className)}>
			{backHref && (
				<CLink
					className="w-fit gap-2"
					href={backHref}
					size="sm"
					variant="ghost"
				>
					<Icon icon="lucide:arrow-left" />
					{backLabel ?? t('back')}
				</CLink>
			)}
			<div className="space-y-3">
				<h1
					className={cn(
						mtsExtended.className,
						'font-semibold text-[28px] leading-none sm:text-4xl'
					)}
				>
					{title}
				</h1>
				{description && (
					<div className="max-w-3xl text-muted-foreground text-sm leading-6">
						{description}
					</div>
				)}
			</div>
			{actions && (
				<nav
					aria-label={t('sectionNav')}
					className="flex flex-wrap gap-2"
				>
					{actions}
				</nav>
			)}
		</header>
	)
}
