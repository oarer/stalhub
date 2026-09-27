import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingMeTabs() {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-9 w-32" />
			</div>
			<div className="flex gap-2">
				<Skeleton className="h-9 w-24" />
				<Skeleton className="h-9 w-24" />
				<Skeleton className="h-9 w-24" />
			</div>
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton className="h-40 w-full" key={i} />
				))}
			</div>
		</div>
	)
}
