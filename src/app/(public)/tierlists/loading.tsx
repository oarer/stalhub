import {
	GridCardsSkeleton,
	PageTitleSkeleton,
	PaginationSkeleton,
} from '@/components/ui/PageSkeletons'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingTierLists() {
	return (
		<section className="mx-auto flex max-w-380 flex-col gap-8 px-4 pt-32 pb-12 md:px-8 xl:pt-36">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<PageTitleSkeleton subtitleClass={null} titleClass="h-9 w-48" />
				<Skeleton className="h-10 w-32" />
			</div>
			<div className="flex flex-wrap gap-3">
				<Skeleton className="h-9 w-28" />
				<Skeleton className="h-9 w-28" />
				<Skeleton className="h-9 w-32" />
			</div>
			<GridCardsSkeleton cardClass="h-48 w-full" count={6} />
			<PaginationSkeleton />
		</section>
	)
}
