import { montserrat } from '@/app/fonts'
import { cn } from '@/lib/cn'

export function ChartCard({
	title,
	action,
	children,
	className,
}: {
	title: string
	action?: React.ReactNode
	children: React.ReactNode
	className?: string
}) {
	return (
		<div
			className={cn(
				'flex flex-col gap-2 rounded-xl bg-card px-5 py-4',
				className
			)}
		>
			<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
				<p className={`${montserrat.className} font-semibold`}>
					{title}
				</p>
				{action}
			</div>
			<div className="h-64">{children}</div>
		</div>
	)
}
