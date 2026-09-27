import {
	FilterBarSkeleton,
	GridCardsSkeleton,
	PageTitleSkeleton,
	PaginationSkeleton,
} from '@/components/ui/PageSkeletons'

export default function LoadingBuilds() {
	return (
		<section className="mx-auto max-w-380 space-y-6 px-4 pt-32 pb-12 sm:px-6">
			<PageTitleSkeleton subtitleClass="h-5 w-56" titleClass="h-9 w-48" />
			<FilterBarSkeleton />
			<GridCardsSkeleton
				cardClass="h-80 w-full"
				className="grid-cols-1 md:grid-cols-2"
				count={4}
			/>
			<PaginationSkeleton />
		</section>
	)
}
