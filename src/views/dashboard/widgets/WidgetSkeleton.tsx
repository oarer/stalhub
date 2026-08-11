'use client'

import { Skeleton } from '@/components/ui/Skeleton'

export function WidgetSkeleton() {
	return (
		<div className="flex h-full flex-col gap-3 p-4">
			<Skeleton className="h-6 w-2/3" />
			<Skeleton className="h-full w-full" />
			<Skeleton className="h-full w-full" />
		</div>
	)
}
