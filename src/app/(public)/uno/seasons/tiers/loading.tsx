import { Skeleton } from '@/components/ui/Skeleton'

export default function UnoSeasonTiersLoading() {
	return (
		<section className="mx-auto max-w-380 space-y-8 px-4 pt-32 pb-12 sm:px-6">
			<Skeleton className="h-32 w-full max-w-3xl" />
			<div className="space-y-8">
				{['s', 'a', 'b', 'c', 'd'].map((rank) => (
					<div className="flex gap-2 sm:gap-4" key={rank}>
						<Skeleton className="h-10 w-8 shrink-0 sm:h-16 sm:w-16" />
						<div className="min-w-0 flex-1 space-y-2">
							<div className="flex flex-wrap gap-1.5">
								{Array.from({ length: 7 }, (_, index) => (
									<Skeleton
										className="h-9 w-40 shrink-0"
										key={index}
									/>
								))}
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	)
}
