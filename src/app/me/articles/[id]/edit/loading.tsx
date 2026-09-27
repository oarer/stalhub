import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingEditor() {
	return (
		<div className="flex flex-col gap-4">
			<Skeleton className="h-8 w-56" />
			<Card.Root>
				<Card.Content className="flex flex-col gap-4">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-48 w-full" />
					<div className="flex gap-2">
						<Skeleton className="h-6 w-16" />
						<Skeleton className="h-6 w-16" />
						<Skeleton className="h-6 w-20" />
					</div>
					<Skeleton className="h-64 w-full" />
					<div className="flex gap-2">
						<Skeleton className="h-10 w-32" />
						<Skeleton className="h-10 w-28" />
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	)
}
