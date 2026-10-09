import { Card } from '@/components/ui/Card'
import { PageTitleSkeleton } from '@/components/ui/PageSkeletons'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingBP() {
	return (
		<section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-32 pb-12 lg:pt-36">
			<PageTitleSkeleton center />
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<Card.Root>
					<Card.Content className="flex flex-col gap-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div className="flex flex-col gap-2" key={i}>
								<Skeleton className="h-4 w-28" />
								<Skeleton className="h-10 w-full" />
							</div>
						))}
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Content className="flex flex-col gap-3">
						<Skeleton className="h-6 w-40" />
						<Skeleton className="h-48 w-full" />
						<div className="flex justify-between">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-24" />
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</section>
	)
}
