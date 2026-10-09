import {
	GridCardsSkeleton,
	PageTitleSkeleton,
} from '@/components/ui/PageSkeletons'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingModels() {
	return (
		<section className="mx-auto max-w-360 space-y-6 px-4 pt-32 pb-12 sm:px-6 md:px-8">
			<PageTitleSkeleton titleClass="h-9 w-56" />
			<Skeleton className="h-10 w-full max-w-md" />
			<GridCardsSkeleton cardClass="h-64 w-full" count={6} />
		</section>
	)
}
