import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import ClanLayout from '@/views/clan/ClanLayout'

export default function ClanRootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<Suspense
			fallback={
				<div className="flex flex-col gap-4">
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			}
		>
			<ClanLayout>{children}</ClanLayout>
		</Suspense>
	)
}
