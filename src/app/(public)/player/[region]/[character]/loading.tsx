import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function LoadingPlayer() {
	return (
		<main className="mx-auto max-w-360 gap-12 space-y-6 px-4 pt-42 pb-12 sm:px-6 md:px-8">
			<Card.Root>
				<Card.Header className="space-y-2">
					<Skeleton className="h-9 w-80" />
					<Skeleton className="h-5 w-48" />
				</Card.Header>
				<Card.Content className="space-y-6">
					<div className="flex flex-col gap-2">
						<Skeleton className="h-5 w-56" />
						<Skeleton className="h-5 w-48" />
						<Skeleton className="h-5 w-64" />
					</div>
					<div className="border-primary/60 border-t" />
					<div className="grid grid-cols-1 justify-between gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="ml-4 h-4 w-24" />
							<Skeleton className="ml-4 h-4 w-20" />
							<Skeleton className="h-4 w-44" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="ml-4 h-4 w-20" />
							<Skeleton className="ml-4 h-4 w-24" />
							<Skeleton className="h-4 w-28" />
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<div className="flex items-center gap-2">
						<Skeleton className="h-5 w-5" />
						<Skeleton className="h-6 w-20" />
					</div>
				</Card.Header>
				<Card.Content>
					<div className="grid grid-cols-1 gap-4 pl-7 md:grid-cols-2">
						<div className="space-y-1">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-5 w-40" />
						</div>
						<div className="space-y-1">
							<Skeleton className="h-4 w-16" />
							<Skeleton className="h-5 w-24" />
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<div className="flex items-center gap-2">
						<Skeleton className="h-5 w-5" />
						<Skeleton className="h-6 w-28" />
					</div>
				</Card.Header>
				<Card.Content className="space-y-6">
					<div className="space-y-3">
						<Skeleton className="h-5 w-32" />
						<div className="grid grid-cols-1 gap-4 pl-7 md:grid-cols-2 lg:grid-cols-3">
							{Array.from({ length: 6 }).map((_, i) => (
								<div className="space-y-1" key={i}>
									<Skeleton className="h-4 w-28" />
									<Skeleton className="h-4 w-20" />
								</div>
							))}
						</div>
					</div>
					<div className="space-y-3">
						<Skeleton className="h-5 w-40" />
						<div className="grid grid-cols-1 gap-4 pl-7 md:grid-cols-2 lg:grid-cols-3">
							{Array.from({ length: 6 }).map((_, i) => (
								<div className="space-y-1" key={i}>
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-4 w-16" />
								</div>
							))}
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</main>
	)
}
