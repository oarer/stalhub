import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageTitleSkeleton } from '@/components/ui/PageSkeletons'

export default function LoadingBalance() {
	return (
		<section className="mx-auto max-w-380 space-y-8 px-4 pt-32 pb-12 sm:px-6">
			<PageTitleSkeleton />
			<Skeleton className="h-10 w-full max-w-md" />
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card.Root key={i}>
						<Card.Content className="flex flex-col gap-3">
							<div className="flex items-center justify-between">
								<Skeleton className="h-6 w-40" />
								<Skeleton className="h-5 w-12" />
							</div>
							<Skeleton className="h-32 w-full" />
						</Card.Content>
					</Card.Root>
				))}
			</div>
		</section>
	)
}
