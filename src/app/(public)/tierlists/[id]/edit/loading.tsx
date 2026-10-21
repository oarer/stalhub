import { Card } from '@/components/ui/Card'
import { PageTitleSkeleton } from '@/components/ui/PageSkeletons'
import { Skeleton } from '@/components/ui/Skeleton'
import { TierListEditSkeletonRows } from '@/views/tierlists/components/TierListEditSkeletonRows'

export default function LoadingTierListEdit() {
	return (
		<section className="mx-auto flex max-w-380 flex-col gap-8 px-4 pt-32 pb-12 md:px-8 xl:pt-36">
			<PageTitleSkeleton subtitleClass="h-5 w-72" titleClass="h-9 w-56" />
			<Card.Root>
				<Card.Content className="flex flex-col gap-4">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-24 w-full" />
					<div className="flex gap-2">
						<Skeleton className="h-9 w-28" />
						<Skeleton className="h-9 w-28" />
					</div>
				</Card.Content>
			</Card.Root>
			<TierListEditSkeletonRows />
		</section>
	)
}
