import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export function TierListEditSkeletonRows() {
	return (
		<div className="flex flex-col gap-2">
			{Array.from({ length: 4 }).map((_, i) => (
				<Card.Root key={i}>
					<Card.Content className="flex items-center gap-4">
						<Skeleton className="size-12 shrink-0" />
						<div className="flex flex-1 gap-2">
							<Skeleton className="size-14" />
							<Skeleton className="size-14" />
							<Skeleton className="size-14" />
						</div>
					</Card.Content>
				</Card.Root>
			))}
		</div>
	)
}
