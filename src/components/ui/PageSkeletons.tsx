import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'

export function PageTitleSkeleton({
	titleClass = 'h-9 w-64',
	subtitleClass = 'h-5 w-48',
	center = false,
}: {
	titleClass?: string
	subtitleClass?: string | null
	center?: boolean
}) {
	return (
		<div
			className={cn(
				'flex flex-col gap-2',
				center && 'items-center text-center'
			)}
		>
			<Skeleton className={titleClass} />
			{subtitleClass && <Skeleton className={subtitleClass} />}
		</div>
	)
}

export function FilterBarSkeleton({ className }: { className?: string }) {
	return (
		<div className={cn('flex flex-wrap items-center gap-3', className)}>
			<Skeleton className="h-10 w-full max-w-lg" />
			<Skeleton className="h-9 w-24" />
			<Skeleton className="h-9 w-24" />
		</div>
	)
}

export function GridCardsSkeleton({
	count = 6,
	className,
	cardClass = 'h-64 w-full',
}: {
	count?: number
	className?: string
	cardClass?: string
}) {
	return (
		<div
			className={cn(
				'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3',
				className
			)}
		>
			{Array.from({ length: count }).map((_, i) => (
				<Skeleton className={cardClass} key={i} />
			))}
		</div>
	)
}

export function ArticleCardsSkeleton({ count = 4 }: { count?: number }) {
	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
			{Array.from({ length: count }).map((_, i) => (
				<div
					className="flex flex-col gap-3 rounded-lg border-2 border-primary/50 bg-card p-4"
					key={i}
				>
					<Skeleton className="h-6 w-3/4" />
					<div className="flex items-center gap-3">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-20" />
					</div>
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-2/3" />
				</div>
			))}
		</div>
	)
}

export function ListRowsSkeleton({
	count = 5,
	rowClass = 'h-16 w-full',
	className,
}: {
	count?: number
	rowClass?: string
	className?: string
}) {
	return (
		<div className={cn('flex flex-col gap-2', className)}>
			{Array.from({ length: count }).map((_, i) => (
				<Skeleton className={rowClass} key={i} />
			))}
		</div>
	)
}

export function TableSkeleton({
	rows = 8,
	cols = 5,
}: {
	rows?: number
	cols?: number
}) {
	return (
		<Card.Root>
			<div className="space-y-3 p-4">
				<div className="flex gap-4">
					{Array.from({ length: cols }).map((_, i) => (
						<Skeleton className="h-5 w-full" key={i} />
					))}
				</div>
				{Array.from({ length: rows }).map((_, r) => (
					<div className="flex gap-4" key={r}>
						{Array.from({ length: cols }).map((_, c) => (
							<Skeleton className="h-5 w-full" key={c} />
						))}
					</div>
				))}
			</div>
		</Card.Root>
	)
}

export function PaginationSkeleton() {
	return (
		<div className="flex items-center justify-center gap-2">
			<Skeleton className="h-9 w-9" />
			<Skeleton className="h-9 w-9" />
			<Skeleton className="h-9 w-9" />
			<Skeleton className="h-9 w-24" />
		</div>
	)
}

export function FormSkeleton({ fields = 5 }: { fields?: number }) {
	return (
		<Card.Root>
			<Card.Content className="flex flex-col gap-4">
				{Array.from({ length: fields }).map((_, i) => (
					<div className="flex flex-col gap-2" key={i}>
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-10 w-full" />
					</div>
				))}
				<Skeleton className="h-10 w-40" />
			</Card.Content>
		</Card.Root>
	)
}

export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
			{Array.from({ length: count }).map((_, i) => (
				<Skeleton className="h-24 w-full" key={i} />
			))}
		</div>
	)
}
