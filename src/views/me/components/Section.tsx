import { Icon } from '@iconify/react'
import { cn } from '@/lib/cn'

export function Section({
	icon,
	title,
	children,
	className,
	danger = false,
}: {
	icon?: string
	title?: string
	children: React.ReactNode
	className?: string
	danger?: boolean
}) {
	return (
		<div
			className={cn(
				'flex flex-col gap-2 rounded-xl bg-background px-5 py-4',
				className
			)}
		>
			{title && (
				<div
					className={cn(
						'flex items-center gap-2 font-semibold text-lg',
						danger && 'text-red-400'
					)}
				>
					{icon && <Icon className="text-xl" icon={icon} />}
					{title}
				</div>
			)}
			<div className="mt-2">{children}</div>
		</div>
	)
}
