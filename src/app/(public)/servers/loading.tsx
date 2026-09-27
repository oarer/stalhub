import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingServers() {
	return (
		<section className="mx-auto max-w-380 space-y-8 px-4 pt-32 pb-12 sm:px-6">
			<div className="flex items-center gap-3">
				<Skeleton className="size-8" />
				<Skeleton className="h-8 w-56" />
			</div>
			<Card.Root>
				<Card.Content className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<Skeleton className="h-6 w-40" />
						<div className="flex gap-2">
							<Skeleton className="h-8 w-14" />
							<Skeleton className="h-8 w-14" />
							<Skeleton className="h-8 w-14" />
						</div>
					</div>
					<Skeleton className="h-64 w-full" />
				</Card.Content>
			</Card.Root>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<Card.Root key={i}>
						<Card.Content className="flex flex-col gap-2">
							<Skeleton className="h-5 w-40" />
							<Skeleton className="h-8 w-24" />
							<Skeleton className="h-4 w-full" />
						</Card.Content>
					</Card.Root>
				))}
			</div>
		</section>
	)
}
