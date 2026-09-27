import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingMap() {
	return (
		<section className="relative mx-auto mt-26 mb-12 flex max-w-380 flex-col gap-10 px-4 pt-12 xl:mt-0">
			<div className="mx-auto flex items-center gap-4 xl:pt-42.5 xl:pb-15">
				<Skeleton className="h-9 w-64" />
			</div>
			<Skeleton className="h-[70vh] w-full" />
			<div className="flex flex-wrap gap-3">
				<Skeleton className="h-10 w-40" />
				<Skeleton className="h-10 w-40" />
				<Skeleton className="h-10 w-40" />
			</div>
		</section>
	)
}
