import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingTierListDetail() {
	return (
		<section className="mx-auto flex max-w-380 flex-col gap-8 px-4 pt-32 pb-12 md:px-8 xl:pt-36">
			<div className="flex flex-col gap-3">
				<Skeleton className="h-9 w-1/2" />
				<div className="flex items-center gap-3">
					<Skeleton className="size-8 rounded-full" />
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-4 w-20" />
				</div>
			</div>
			<div className="flex flex-col gap-2">
				{['S', 'A', 'B', 'C', 'D'].map((_, i) => (
					<Card.Root key={i}>
						<Card.Content className="flex items-center gap-4">
							<Skeleton className="size-12 shrink-0" />
							<div className="flex flex-1 gap-2">
								<Skeleton className="size-14" />
								<Skeleton className="size-14" />
								<Skeleton className="size-14" />
								<Skeleton className="hidden size-14 sm:block" />
								<Skeleton className="hidden size-14 sm:block" />
							</div>
						</Card.Content>
					</Card.Root>
				))}
			</div>
		</section>
	)
}
