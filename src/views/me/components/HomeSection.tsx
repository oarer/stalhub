'use client'

import Link from 'next/link'

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
				<h2 className={`font-semibold text-xl ${titleClassName ?? ''}`}>
					{title}
				</h2>
				{actionHref && actionLabel && (
					<Link
						className="font-semibold text-sm text-text-accent hover:underline"
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
