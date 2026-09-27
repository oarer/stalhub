import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingMeSettings() {
	return (
		<div className="flex flex-col gap-4">
			<Skeleton className="h-8 w-48" />
			{Array.from({ length: 3 }).map((_, i) => (
				<Card.Root key={i}>
					<Card.Content className="flex flex-col gap-4">
						<Skeleton className="h-6 w-40" />
						<div className="flex flex-col gap-2">
							<Skeleton className="h-4 w-28" />
							<Skeleton className="h-10 w-full" />
						</div>
						<div className="flex flex-col gap-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-10 w-full" />
						</div>
					</Card.Content>
				</Card.Root>
			))}
		</div>
	)
}
