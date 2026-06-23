'use client'

import { Icon } from '@iconify/react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function TTKLoading() {
	return (
		<section className="mx-auto max-w-7xl space-y-6 px-4 pt-42 pb-12 sm:px-6">
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-2">
						<Icon
							className="text-lg"
							icon="lucide:person-standing"
						/>
						<Skeleton className="h-6 w-24" />
					</div>
					<Card.Root>
						<Card.Content className="flex flex-col gap-4">
							<div className="flex flex-col gap-3">
								<div className="flex flex-col gap-1.5">
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-10 w-full" />
								</div>
								<div className="flex flex-col gap-1.5">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-10 w-full" />
								</div>
								<div className="flex flex-col gap-1.5">
									<Skeleton className="h-4 w-12" />
									<Skeleton className="h-10 w-full" />
								</div>
								<div className="flex flex-col gap-1.5">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-10 w-full" />
								</div>
								<Skeleton className="h-10 w-full" />
							</div>
						</Card.Content>
					</Card.Root>
				</div>

				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-2">
						<Icon className="text-lg" icon="lucide:crosshair" />
						<Skeleton className="h-6 w-20" />
					</div>
					<div className="flex flex-col gap-3">
						{[1, 2].map((i) => (
							<Card.Root key={i}>
								<Card.Header className="flex flex-row items-center gap-2">
									<Skeleton className="h-10 w-full" />
								</Card.Header>
							</Card.Root>
						))}
						<Skeleton className="h-12 w-full" />
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-2">
						<Icon className="text-lg" icon="lucide:bar-chart-2" />
						<Skeleton className="h-6 w-32" />
					</div>
					<Card.Root>
						<Card.Content className="flex flex-col gap-4">
							<div className="grid grid-cols-2 gap-2">
								{[1, 2, 3, 4].map((i) => (
									<Skeleton className="h-16 w-full" key={i} />
								))}
							</div>
							<Skeleton className="h-32 w-full" />
						</Card.Content>
					</Card.Root>
				</div>
			</div>

			<Card.Root>
				<Card.Content>
					<div className="space-y-2">
						<div className="flex gap-2">
							{[1, 2, 3, 4, 5].map((i) => (
								<Skeleton className="h-8 w-20" key={i} />
							))}
						</div>
						<div className="flex gap-4 py-4">
							{[1, 2, 3].map((i) => (
								<Skeleton className="h-8 flex-1" key={i} />
							))}
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</section>
	)
}
