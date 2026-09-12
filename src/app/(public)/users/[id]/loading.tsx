import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingUser() {
	return (
		<section className="mx-auto grid max-w-285 grid-cols-1 gap-6 px-4 pt-42 pb-12 md:grid-cols-[27%_70%] md:px-8 xl:pt-36">
			<Skeleton className="h-54 w-full" />
			<Skeleton className="h-64 w-full" />
		</section>
	)
}
