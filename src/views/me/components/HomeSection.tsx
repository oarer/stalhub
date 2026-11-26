'use client'

import Link from 'next/link'
import { mtsWide } from '@/app/fonts'

export function HomeSection({
	title,
	actionHref,
	actionLabel,
	titleClassName,
	children,
}: {
	title: string
	actionHref?: string
	actionLabel?: string
	titleClassName?: string
	children: React.ReactNode
}) {
	return (
		<section className="flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<h2
					className={`${mtsWide.className} text-[16px] font-medium ${titleClassName ?? ''}`}
				>
					{title}
				</h2>
				{actionHref && actionLabel && (
					<Link
						className="text-foreground text-[13px] font-medium hover:underline"
						href={actionHref}
					>
						{actionLabel}
					</Link>
				)}
			</div>
			{children}
		</section>
	)
}
