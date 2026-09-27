import { Skeleton } from '@/components/ui/Skeleton'
import { PageTitleSkeleton } from '@/components/ui/PageSkeletons'

export default function LoadingPlayerSearch() {
	return (
		<section className="mx-auto flex max-w-4xl flex-col gap-8 px-4 pt-32 pb-12 lg:pt-36">
			<PageTitleSkeleton center />
			<div className="flex w-full flex-col gap-4">
				<div className="grid w-full grid-cols-[80px_1fr] gap-2">
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
				</div>
				<Skeleton className="h-12 w-full" />
			</div>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton className="h-20 w-full" key={i} />
				))}
			</div>
		</section>
	)
}
