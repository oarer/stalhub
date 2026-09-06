'use client'

import { Icon } from '@iconify/react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function SessionsLoading() {
	return (
		<section className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-32 lg:pt-36">
			<div className="flex flex-col items-center gap-2">
				<Skeleton className="h-9 w-80" />
				<Skeleton className="h-4 w-72" />
			</div>

			<div className="grid items-start gap-6 md:grid-cols-2">
				<Card.Root>
					<Card.Header className="flex flex-row items-center gap-2">
						<Icon
							className="text-lg"
							icon="lucide:sliders-horizontal"
						/>
						<Skeleton className="h-6 w-24" />
					</Card.Header>
					<Card.Content className="flex flex-col gap-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<div className="flex flex-col gap-2" key={i}>
								<Skeleton className="h-3 w-24" />
								<Skeleton className="h-10 w-full" />
							</div>
						))}
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header className="flex flex-row items-center gap-2">
						<Icon className="text-lg" icon="lucide:route" />
						<Skeleton className="h-6 w-32" />
					</Card.Header>
					<Card.Content className="flex flex-col gap-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton className="h-9 w-full" key={i} />
						))}
					</Card.Content>
				</Card.Root>
			</div>

			<Card.Root>
				<Card.Header className="flex flex-row items-center gap-2">
					<Icon className="text-lg" icon="lucide:map" />
					<Skeleton className="h-6 w-24" />
				</Card.Header>
				<Card.Content className="grid grid-cols-2 gap-4 lg:grid-cols-4">
					{Array.from({ length: 8 }).map((_, i) => (
						<Skeleton className="h-8 w-full" key={i} />
					))}
				</Card.Content>
			</Card.Root>
		</section>
	)
}
