import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { TierListEditSkeletonRows } from '@/views/tierlists/components/TierListEditSkeletonRows'

export default function LoadingTierListEditor() {
	return (
		<div className="flex flex-col gap-4">
			<Skeleton className="h-8 w-56" />
			<Card.Root>
				<Card.Content className="flex flex-col gap-4">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-20 w-full" />
				</Card.Content>
			</Card.Root>
			<TierListEditSkeletonRows />
		</div>
	)
}
