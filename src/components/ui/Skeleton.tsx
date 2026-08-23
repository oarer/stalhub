import { cn } from '@/lib/cn'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn('animate-pulse rounded-xl bg-card', className)}
			{...props}
		/>
	)
}

export { Skeleton }
