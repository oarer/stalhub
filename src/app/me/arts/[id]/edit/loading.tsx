import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingArtEditor() {
	return (
		<div className="flex flex-col gap-4">
			<Skeleton className="h-8 w-56" />
			<Card.Root>
				<Card.Content className="flex flex-col gap-4">
					<Skeleton className="h-48 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-24 w-full" />
					<div className="flex gap-2">
						<Skeleton className="h-10 w-32" />
						<Skeleton className="h-10 w-28" />
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	)
}
