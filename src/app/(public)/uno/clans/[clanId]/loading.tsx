import { Skeleton } from '@/components/ui/Skeleton'

export default function UnoClanLoading() {
	return (
		<section className="mx-auto max-w-380 space-y-6 px-4 pt-32 pb-12 sm:px-6">
			<Skeleton className="h-56 w-full" />
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<Skeleton className="h-20" />
				<Skeleton className="h-20" />
				<Skeleton className="h-20" />
				<Skeleton className="h-20" />
			</div>
			<div className="grid gap-4 lg:grid-cols-2">
				<Skeleton className="h-72" />
				<Skeleton className="h-72" />
			</div>
		</section>
	)
}
