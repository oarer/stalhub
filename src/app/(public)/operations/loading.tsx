import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageTitleSkeleton } from '@/components/ui/PageSkeletons'

export default function LoadingOperations() {
	return (
		<section className="mx-auto flex max-w-4xl flex-col gap-4 px-4 pt-32 pb-12 lg:pt-36">
			<PageTitleSkeleton center />
			<div className="flex flex-col gap-3">
				{Array.from({ length: 5 }).map((_, i) => (
					<Card.Root key={i}>
						<Card.Content className="flex items-center gap-4">
							<Skeleton className="size-12 shrink-0" />
							<div className="flex flex-1 flex-col gap-2">
								<Skeleton className="h-5 w-1/2" />
								<Skeleton className="h-4 w-3/4" />
							</div>
							<Skeleton className="h-8 w-24 shrink-0" />
						</Card.Content>
					</Card.Root>
				))}
			</div>
		</section>
	)
}
