'use client'

import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function PlayerComparisonLoading() {
	return (
		<section className="mx-auto max-w-360 space-y-6 px-4 pt-32 pb-12 md:px-8 lg:pt-36">
			<div className="space-y-3">
				<Skeleton className="h-6 w-24" />
				<Skeleton className="h-9 w-72 max-w-full" />
				<Skeleton className="h-4 w-full max-w-2xl" />
			</div>

			<Card.Root className="gap-4">
				<div className="flex flex-wrap gap-3">
					{['a', 'b', 'c', 'd'].map((slot) => (
						<Skeleton
							className="min-h-40 min-w-60 flex-1 basis-64"
							key={slot}
						/>
					))}
				</div>
				<Skeleton className="h-8 w-full" />
			</Card.Root>

			<div className="space-y-3">
				<Skeleton className="h-6 w-40" />
				<div className="grid gap-4 md:grid-cols-2">
					<Skeleton className="h-56 w-full" />
					<Skeleton className="h-56 w-full" />
				</div>
			</div>
		</section>
	)
}
