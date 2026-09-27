import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingClan() {
	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton className="h-24 w-full" key={i} />
				))}
			</div>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<Card.Root>
					<Card.Content className="flex flex-col gap-2">
						<Skeleton className="h-6 w-40" />
						{Array.from({ length: 4 }).map((_, i) => (
							<div className="flex items-center gap-3" key={i}>
								<Skeleton className="size-10 rounded-full" />
								<div className="flex flex-1 flex-col gap-1">
									<Skeleton className="h-4 w-1/2" />
									<Skeleton className="h-3 w-1/3" />
								</div>
							</div>
						))}
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Content className="flex flex-col gap-2">
						<Skeleton className="h-6 w-48" />
						{Array.from({ length: 3 }).map((_, i) => (
							<Skeleton className="h-16 w-full" key={i} />
						))}
					</Card.Content>
				</Card.Root>
			</div>
			<Card.Root>
				<Card.Content className="flex flex-col gap-3">
					<Skeleton className="h-6 w-48" />
					{Array.from({ length: 5 }).map((_, i) => (
						<div className="flex gap-4" key={i}>
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-4 w-16" />
						</div>
					))}
				</Card.Content>
			</Card.Root>
		</div>
	)
}
