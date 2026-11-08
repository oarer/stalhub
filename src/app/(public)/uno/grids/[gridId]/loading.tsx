import { Skeleton } from '@/components/ui/Skeleton'

export default function UnoGridDetailLoading() {
	return (
		<section className="mx-auto max-w-380 px-4 pt-32 pb-12 sm:px-6">
			<div className="overflow-hidden rounded-xl border border-border-secondary">
				<div className="flex flex-wrap items-center gap-2 border-border-secondary border-b p-2">
					<Skeleton className="h-9 w-56" />
					<div className="flex flex-1 items-center justify-center gap-1">
						<Skeleton className="h-9 w-20" />
						<Skeleton className="h-9 w-32" />
						<Skeleton className="h-9 w-20" />
					</div>
					<Skeleton className="h-9 w-9" />
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-4">
					{Array.from({ length: 4 }, (_, column) => (
						<div
							className="border-border-secondary/80 border-t first:border-t-0 lg:border-t-0 lg:border-l lg:first:border-l-0"
							key={column}
						>
							<div className="border-border-secondary/80 border-b px-3 py-3">
								<Skeleton className="mx-auto h-3 w-16" />
							</div>
							<div className="space-y-4 p-4">
								{column === 0 && (
									<Skeleton className="h-9 w-40" />
								)}
								{column === 1 && (
									<Skeleton className="mx-auto h-6 w-24" />
								)}
								<Skeleton className="h-20" />
								<Skeleton className="h-20" />
								<Skeleton className="h-20" />
								<Skeleton className="h-20" />
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
