import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingCWMap() {
	return (
		<main className="flex min-h-screen flex-col gap-4 p-4 pt-28">
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-56" />
				<div className="flex gap-2">
					<Skeleton className="h-9 w-28" />
					<Skeleton className="h-9 w-28" />
				</div>
			</div>
			<Skeleton className="h-[75vh] w-full" />
		</main>
	)
}
