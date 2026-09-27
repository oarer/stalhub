import {
	FilterBarSkeleton,
	GridCardsSkeleton,
	PageTitleSkeleton,
	PaginationSkeleton,
} from '@/components/ui/PageSkeletons'

export default function LoadingArts() {
	return (
		<section className="mx-auto max-w-380 space-y-6 px-4 pt-32 pb-12 sm:px-6">
			<PageTitleSkeleton subtitleClass="h-5 w-24" titleClass="h-9 w-40" />
			<FilterBarSkeleton />
			<GridCardsSkeleton cardClass="h-72 w-full" count={6} />
			<PaginationSkeleton />
		</section>
	)
}
