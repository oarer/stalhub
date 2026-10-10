import {
	GridCardsSkeleton,
	PageTitleSkeleton,
} from '@/components/ui/PageSkeletons'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingClans() {
	return (
		<section className="mx-auto max-w-380 space-y-6 px-4 pt-32 pb-12 sm:px-6">
			<PageTitleSkeleton subtitleClass={null} titleClass="h-8 w-48" />
			<div className="flex flex-wrap items-center gap-3">
				<Skeleton className="h-10 w-full max-w-68" />
				<Skeleton className="h-5 w-40" />
			</div>
			<GridCardsSkeleton cardClass="h-40 w-full" count={6} />
		</section>
	)
}
