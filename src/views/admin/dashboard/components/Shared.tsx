'use client'

import { Icon } from '@iconify/react'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'

const accents = {
	primary: 'bg-primary/10 text-primary',
	sky: 'bg-sky-500/10 text-sky-400',
	emerald: 'bg-emerald-500/10 text-emerald-400',
	amber: 'bg-amber-500/10 text-amber-400',
	rose: 'bg-rose-500/10 text-rose-400',
	violet: 'bg-violet-500/10 text-violet-400',
	cyan: 'bg-cyan-500/10 text-cyan-400',
} as const

export type MetricAccent = keyof typeof accents

export function MetricCard({
	icon,
	label,
	value,
	sub,
	accent = 'primary',
	className,
}: {
	icon: string
	label: ReactNode
	value: ReactNode
	sub?: ReactNode
	accent?: MetricAccent
	className?: string
}) {
	return (
		<Card.Root className={className}>
			<div className="flex items-center gap-3">
				<div
					className={cn(
						'flex size-10 shrink-0 items-center justify-center rounded-lg',
						accents[accent]
					)}
				>
					<Icon className="size-5" icon={icon} />
				</div>
				<div className="min-w-0">
					<p className="truncate text-muted-foreground text-xs">
						{label}
					</p>
					<p className="font-medium font-mono text-2xl leading-8">
						{value}
					</p>
				</div>
			</div>
			{sub && (
				<p className="text-muted-foreground/70 text-xs">{sub}</p>
			)}
		</Card.Root>
	)
}

export function StatCard({
	title,
	icon,
	accent = 'primary',
	rows,
	className,
}: {
	title: ReactNode
	icon: string
	accent?: MetricAccent
	rows: { label: ReactNode; value: ReactNode; accent?: 'danger' | 'ok' }[]
	className?: string
}) {
	return (
		<Card.Root className={className}>
			<div className="flex items-center gap-2">
				<div
					className={cn(
						'flex size-8 items-center justify-center rounded-lg',
						accents[accent]
					)}
				>
					<Icon className="size-4.5" icon={icon} />
				</div>
				<p className="truncate font-semibold">{title}</p>
			</div>
			<Card.Content className="flex flex-col gap-1.5">
				{rows.map((row) => (
					<div
						className="flex items-baseline justify-between gap-2 text-sm"
						key={row.label?.toString()}
					>
						<span className="truncate text-muted-foreground">
							{row.label}
						</span>
						<span
							className={cn(
								'font-mono font-semibold',
								row.accent === 'danger' && 'text-rose-400',
								row.accent === 'ok' && 'text-emerald-400'
							)}
						>
							{row.value}
						</span>
					</div>
				))}
			</Card.Content>
		</Card.Root>
	)
}

export function ChartShell({
	title,
	action,
	children,
	height = 'h-72',
}: {
	title?: ReactNode
	action?: ReactNode
	children: ReactNode
	height?: string
}) {
	return (
		<Card.Root>
			{title && (
				<div className="flex flex-wrap items-center justify-between gap-2">
					<p className="truncate font-semibold">{title}</p>
					{action}
				</div>
			)}
			<div className={height}>{children}</div>
		</Card.Root>
	)
}
