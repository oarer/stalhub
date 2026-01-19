import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingMonitors() {
	return (
		<div className="flex flex-col gap-4">
			<Skeleton className="h-28 w-full p-2" />
			<Skeleton className="h-12 w-full p-2" />
			<Skeleton className="h-18 w-full p-2" />
		</div>
	)
}
