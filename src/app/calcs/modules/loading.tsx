import { Card } from '@/components/ui/Card'
import { PageTitleSkeleton } from '@/components/ui/PageSkeletons'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingModules() {
	return (
		<section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-32 pb-12 lg:pt-36">
			<PageTitleSkeleton center />
			<Card.Root>
				<Card.Content className="flex flex-col gap-4">
					<Skeleton className="h-10 w-full max-w-md" />
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton className="h-32 w-full" key={i} />
						))}
					</div>
				</Card.Content>
			</Card.Root>
		</section>
	)
}
