'use client'

import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingItem() {
	return (
		<div className="mx-auto grid max-w-360 grid-cols-1 flex-col gap-12 px-4 pt-32 pb-12 sm:px-6 md:px-8 lg:grid-cols-12">
			<div className="space-y-4 lg:col-span-7">
				<Card.Root>
					<Card.Header className="space-y-4">
						<Card.Title className="mx-auto">
							<Skeleton className="h-32 w-32" />
						</Card.Title>
						<div className="flex flex-col items-center space-y-2">
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-6 w-52" />
						</div>
					</Card.Header>

					<Card.Description className="flex flex-col items-center gap-3 py-3">
						<div className="flex gap-2">
							<Skeleton className="h-5 w-12" />
							<Skeleton className="h-5 w-8" />
							<Skeleton className="h-5 w-16" />
						</div>
						<div className="flex gap-2">
							<Skeleton className="h-5 w-24" />
							<Skeleton className="h-5 w-16" />
							<Skeleton className="h-5 w-12" />
						</div>
					</Card.Description>
				</Card.Root>
				<div className="flex flex-col">
					<Card.Root>
						<Skeleton className="h-76 w-full" />
					</Card.Root>
				</div>
			</div>

			<div className="lg:col-span-5">
				<div className="space-y-3">
					<Card.Root>
						<div className="flex flex-row justify-between">
							<Skeleton className="h-5 w-12" />
							<Skeleton className="h-5 w-16" />
						</div>
						<div className="flex flex-row justify-between">
							<Skeleton className="h-5 w-16" />
							<Skeleton className="h-5 w-18" />
						</div>
						<div className="flex flex-row justify-between">
							<Skeleton className="h-5 w-14" />
							<Skeleton className="h-5 w-20" />
						</div>
					</Card.Root>
					<Card.Root>
						<div className="flex flex-row justify-between">
							<Skeleton className="h-5 w-12" />
							<Skeleton className="h-5 w-14" />
						</div>
						<div className="flex flex-row justify-between">
							<Skeleton className="h-5 w-14" />
							<Skeleton className="h-5 w-22" />
						</div>
						<div className="flex flex-row justify-between">
							<Skeleton className="h-5 w-13" />
							<Skeleton className="h-5 w-22" />
						</div>
					</Card.Root>
					<Card.Root>
						<div className="flex flex-row justify-between">
							<Skeleton className="h-5 w-22" />
							<Skeleton className="h-5 w-18" />
						</div>
						<div className="flex flex-row justify-between">
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-5 w-20" />
						</div>
						<div className="flex flex-row justify-between">
							<Skeleton className="h-5 w-22" />
							<Skeleton className="h-5 w-30" />
						</div>
					</Card.Root>
				</div>
			</div>
		</div>
	)
}
