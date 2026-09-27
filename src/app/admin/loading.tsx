import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingAdmin() {
	return (
		<div className="flex flex-col gap-6 p-4 pt-24 lg:p-6 lg:pt-28">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-1.5">
					<Skeleton className="h-8 w-56" />
					<Skeleton className="h-4 w-32" />
				</div>
				<Skeleton className="h-9 w-28" />
			</div>
			<Skeleton className="h-10 w-full max-w-md" />
			<Card.Root>
				<div className="space-y-3 p-4">
					<div className="flex gap-4">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton className="h-5 w-full" key={i} />
						))}
					</div>
					{Array.from({ length: 8 }).map((_, r) => (
						<div className="flex gap-4" key={r}>
							{Array.from({ length: 5 }).map((_, c) => (
								<Skeleton className="h-8 w-full" key={c} />
							))}
						</div>
					))}
				</div>
			</Card.Root>
			<div className="flex items-center justify-center gap-2">
				<Skeleton className="h-9 w-9" />
				<Skeleton className="h-9 w-9" />
				<Skeleton className="h-9 w-9" />
			</div>
		</div>
	)
}
