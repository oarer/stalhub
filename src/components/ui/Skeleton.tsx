import { cn } from '@/lib/cn'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn('bg-card animate-pulse rounded-xl', className)}
			{...props}
		/>
	)
}

export { Skeleton }
