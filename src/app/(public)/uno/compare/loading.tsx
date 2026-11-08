import { Skeleton } from '@/components/ui/Skeleton'

export default function UnoCompareLoading() {
	return (
		<section className="mx-auto max-w-380 space-y-6 px-4 pt-32 pb-12 sm:px-6">
			<Skeleton className="h-32 w-full max-w-3xl" />
			<Skeleton className="h-40 w-full" />
			<div className="grid gap-4 md:grid-cols-2">
				<Skeleton className="h-28" />
				<Skeleton className="h-28" />
			</div>
		</section>
	)
}
