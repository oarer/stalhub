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
					className={`${mtsWide.className} font-medium text-[16px] ${titleClassName ?? ''}`}
				>
					{title}
				</h2>
				{actionHref && actionLabel && (
					<Link
						className="font-medium text-[13px] text-text-accent hover:underline"
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
