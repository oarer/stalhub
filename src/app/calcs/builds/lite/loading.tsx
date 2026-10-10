import { Card } from '@/components/ui/Card'
import { PageTitleSkeleton } from '@/components/ui/PageSkeletons'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingBuildsLite() {
	return (
		<section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-32 pb-12 lg:pt-36">
			<PageTitleSkeleton center />
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-[70%_30%]">
				<Card.Root>
					<Card.Content className="flex flex-col gap-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<div className="flex items-center gap-3" key={i}>
								<Skeleton className="size-14 shrink-0" />
								<div className="flex flex-1 flex-col gap-1.5">
									<Skeleton className="h-4 w-1/2" />
									<Skeleton className="h-4 w-3/4" />
								</div>
							</div>
						))}
					</Card.Content>
				</Card.Root>
				<div className="flex flex-col gap-4">
					<Skeleton className="h-48 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
			</div>
		</section>
	)
}
