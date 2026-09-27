import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingOnboarding() {
	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-32 pb-12">
			<div className="flex flex-col items-center gap-2">
				<Skeleton className="h-9 w-64" />
				<Skeleton className="h-5 w-80" />
			</div>
			<Card.Root>
				<Card.Content className="flex flex-col gap-4">
					<div className="flex justify-center">
						<Skeleton className="size-24 rounded-full" />
					</div>
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-11 w-full" />
				</Card.Content>
			</Card.Root>
		</div>
	)
}
