import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageTitleSkeleton } from '@/components/ui/PageSkeletons'

export default function LoadingBuildsCalc() {
	return (
		<section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-32 pb-12 lg:pt-36">
			<PageTitleSkeleton center />
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-[70%_30%]">
				<div className="flex flex-col gap-4">
					<Card.Root>
						<Card.Content className="flex flex-col gap-4">
							<Skeleton className="h-6 w-48" />
							<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
								{Array.from({ length: 6 }).map((_, i) => (
									<Skeleton className="h-24 w-full" key={i} />
								))}
							</div>
						</Card.Content>
					</Card.Root>
					<Card.Root>
						<Card.Content className="flex flex-col gap-4">
							<Skeleton className="h-6 w-40" />
							<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
								{Array.from({ length: 3 }).map((_, i) => (
									<Skeleton className="h-24 w-full" key={i} />
								))}
							</div>
						</Card.Content>
					</Card.Root>
				</div>
				<div className="flex flex-col gap-4">
					<Skeleton className="h-64 w-full" />
					<Skeleton className="h-32 w-full" />
				</div>
			</div>
		</section>
	)
}
