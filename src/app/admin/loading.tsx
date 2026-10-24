import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

const HEAD_SKELETONS = ['a', 'b', 'c', 'd', 'e']
const ROW_SKELETONS = [
	'row-a',
	'row-b',
	'row-c',
	'row-d',
	'row-e',
	'row-f',
	'row-g',
	'row-h',
]

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
						{HEAD_SKELETONS.map((id) => (
							<Skeleton className="h-5 w-full" key={id} />
						))}
					</div>
					{ROW_SKELETONS.map((rowId) => (
						<div className="flex gap-4" key={rowId}>
							{HEAD_SKELETONS.map((id) => (
								<Skeleton
									className="h-8 w-full"
									key={`${rowId}-${id}`}
								/>
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
