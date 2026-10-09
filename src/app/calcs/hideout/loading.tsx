import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingHideout() {
	return (
		<div className="h-screen w-full pt-24">
			<div className="flex h-full gap-4 p-4">
				<div className="flex w-80 shrink-0 flex-col gap-3">
					<Skeleton className="h-10 w-full" />
					{Array.from({ length: 6 }).map((_, i) => (
						<Skeleton className="h-16 w-full" key={i} />
					))}
				</div>
				<Skeleton className="h-full flex-1" />
				<div className="hidden w-80 shrink-0 lg:block">
					<Card.Root className="h-full">
						<div className="flex flex-col gap-3 p-4">
							<Skeleton className="h-6 w-40" />
							{Array.from({ length: 8 }).map((_, i) => (
								<div
									className="flex justify-between gap-2"
									key={i}
								>
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-16" />
								</div>
							))}
						</div>
					</Card.Root>
				</div>
			</div>
		</div>
	)
}
