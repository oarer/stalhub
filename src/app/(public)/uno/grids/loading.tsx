import { Skeleton } from '@/components/ui/Skeleton'

export default function UnoGridsLoading() {
	return (
		<section className="mx-auto max-w-380 space-y-6 px-4 pt-32 pb-12 sm:px-6">
			<Skeleton className="h-32 w-full max-w-3xl" />
			<Skeleton className="h-28 w-full" />
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				<Skeleton className="h-48" />
				<Skeleton className="h-48" />
				<Skeleton className="h-48" />
			</div>
		</section>
	)
}
