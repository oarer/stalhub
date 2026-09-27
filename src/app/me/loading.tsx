import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingMe() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3">
				<Skeleton className="h-7 w-56" />
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
					<Skeleton className="h-48 w-full" />
					<Skeleton className="h-48 w-full" />
				</div>
			</div>
			<div className="flex flex-col gap-3">
				<Skeleton className="h-7 w-40" />
				<div className="grid grid-cols-1 gap-3">
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-32 w-full" />
				</div>
			</div>
		</div>
	)
}
