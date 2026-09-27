import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageTitleSkeleton } from '@/components/ui/PageSkeletons'

function CalcFormSkeleton() {
	return (
		<section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-32 pb-12 lg:pt-36">
			<PageTitleSkeleton center />
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Card.Root>
					<Card.Content className="flex flex-col gap-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<div className="flex flex-col gap-2" key={i}>
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-10 w-full" />
							</div>
						))}
						<Skeleton className="h-10 w-full" />
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Content className="flex flex-col gap-3">
						<Skeleton className="h-6 w-48" />
						{Array.from({ length: 5 }).map((_, i) => (
							<div className="flex justify-between gap-2" key={i}>
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-4 w-20" />
							</div>
						))}
					</Card.Content>
				</Card.Root>
			</div>
		</section>
	)
}

export default CalcFormSkeleton
