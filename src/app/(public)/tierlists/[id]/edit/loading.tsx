import { Card } from '@/components/ui/Card'
import { PageTitleSkeleton } from '@/components/ui/PageSkeletons'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingTierListEdit() {
	return (
		<section className="mx-auto flex max-w-380 flex-col gap-8 px-4 pt-32 pb-12 md:px-8 xl:pt-36">
			<PageTitleSkeleton subtitleClass="h-5 w-72" titleClass="h-9 w-56" />
			<Card.Root>
				<Card.Content className="flex flex-col gap-4">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-24 w-full" />
					<div className="flex gap-2">
						<Skeleton className="h-9 w-28" />
						<Skeleton className="h-9 w-28" />
					</div>
				</Card.Content>
			</Card.Root>
			<div className="flex flex-col gap-2">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card.Root key={i}>
						<Card.Content className="flex items-center gap-4">
							<Skeleton className="size-12 shrink-0" />
							<div className="flex flex-1 gap-2">
								<Skeleton className="size-14" />
								<Skeleton className="size-14" />
								<Skeleton className="size-14" />
							</div>
						</Card.Content>
					</Card.Root>
				))}
			</div>
		</section>
	)
}
