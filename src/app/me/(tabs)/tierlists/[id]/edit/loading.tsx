import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

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
		</div>
	)
}
