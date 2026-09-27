import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingDashboard() {
	return (
		<section className="flex h-dvh w-full flex-col">
			<div className="mx-auto flex w-full max-w-400 flex-col items-center gap-4 px-4 pt-24 pb-5 lg:pt-34">
				<Skeleton className="h-9 w-64" />
				<Skeleton className="h-5 w-80" />
			</div>
			<div className="grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-3">
				<Skeleton className="h-64 w-full lg:h-full" />
				<Skeleton className="h-64 w-full lg:h-full" />
				<Skeleton className="h-64 w-full lg:h-full" />
			</div>
		</section>
	)
}
