import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageTitleSkeleton } from '@/components/ui/PageSkeletons'

export default function LootLoading() {
	return (
		<section className="mx-auto max-w-380 space-y-6 px-4 pt-32 pb-12 sm:px-6">
			<PageTitleSkeleton />
			<div className="flex flex-wrap gap-3">
				<Skeleton className="h-10 w-48" />
				<Skeleton className="h-10 w-32" />
				<Skeleton className="h-10 w-32" />
			</div>
			<Card.Root>
				<div className="space-y-3 p-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<div className="flex items-center gap-4" key={i}>
							<Skeleton className="size-12 shrink-0" />
							<div className="flex flex-1 flex-col gap-1.5">
								<Skeleton className="h-4 w-1/3" />
								<Skeleton className="h-4 w-1/4" />
							</div>
							<Skeleton className="h-5 w-20 shrink-0" />
						</div>
					))}
				</div>
			</Card.Root>
		</section>
	)
}
