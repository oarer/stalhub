import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingMeNotifications() {
	return (
		<div className="flex flex-col gap-4">
			<Skeleton className="h-8 w-48" />
			<div className="flex flex-col gap-1">
				{Array.from({ length: 6 }).map((_, i) => (
					<Card.Root key={i}>
						<Card.Content className="flex items-center gap-3">
							<Skeleton className="size-10 shrink-0 rounded-full" />
							<div className="flex flex-1 flex-col gap-1.5">
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-3 w-1/4" />
							</div>
						</Card.Content>
					</Card.Root>
				))}
			</div>
		</div>
	)
}
