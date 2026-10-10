import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import PersonalAnalyticsView from '@/views/personal/PersonalAnalyticsView'

export default function PersonalAnalyticsPage() {
	return (
		<Suspense fallback={<Skeleton className="h-64 w-full" />}>
			<PersonalAnalyticsView />
		</Suspense>
	)
}
