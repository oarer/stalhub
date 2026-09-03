import { Suspense } from 'react'
import AdminSidebar from '@/views/admin/AdminSidebar'

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="flex min-h-dvh">
			<Suspense
				fallback={
					<div className="sticky top-0 hidden h-dvh w-64 shrink-0 border-primary/2 border-r-2 bg-background/80 px-4 pt-32 pb-6 lg:block">
						<div className="animate-pulse rounded-lg bg-card px-4 py-6">
							<div className="h-8 w-32 animate-pulse rounded bg-border/20" />
							<div className="mt-4 flex flex-col gap-2">
								{Array.from({ length: 4 }).map((_, i) => (
									<div
										className="h-10 animate-pulse rounded bg-border/20"
										key={`skeleton-${i.toString()}`}
									/>
								))}
							</div>
						</div>
					</div>
				}
			>
				<AdminSidebar />
			</Suspense>
			<div className="min-w-0 flex-1 pt-12">
				<div className="px-4 pt-14 pb-12 md:px-6 lg:px-8 lg:pt-20">
					{children}
				</div>
			</div>
		</div>
	)
}
