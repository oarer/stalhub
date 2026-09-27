import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingArtDetail() {
	return (
		<section className="mx-auto flex max-w-380 flex-col gap-8 px-4 pt-32 pb-12 md:px-8 xl:pt-36">
			<Skeleton className="h-5 w-24" />
			<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
				<div className="flex flex-col gap-4">
					<Skeleton className="h-10 w-2/3" />
					<Skeleton className="aspect-video w-full" />
					<div className="flex gap-2">
						<Skeleton className="h-6 w-16" />
						<Skeleton className="h-6 w-16" />
						<Skeleton className="h-6 w-20" />
					</div>
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
				</div>
				<div className="flex flex-col gap-4">
					<Card.Root>
						<Card.Content className="flex flex-col gap-3">
							<div className="flex items-center gap-3">
								<Skeleton className="size-12 rounded-full" />
								<div className="flex flex-col gap-1.5">
									<Skeleton className="h-5 w-32" />
									<Skeleton className="h-4 w-24" />
								</div>
							</div>
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</Card.Content>
					</Card.Root>
					<Card.Root>
						<Card.Content className="flex flex-col gap-2">
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
						</Card.Content>
					</Card.Root>
				</div>
			</div>
			<Card.Root>
				<Card.Content className="flex flex-col gap-3">
					<Skeleton className="h-6 w-40" />
					<Skeleton className="h-16 w-full" />
					<Skeleton className="h-16 w-full" />
				</Card.Content>
			</Card.Root>
		</section>
	)
}
