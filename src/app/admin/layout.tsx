import { Suspense } from 'react'
import AdminSidebar from '@/views/admin/AdminSidebar'

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<section className="mx-auto grid max-w-285 grid-cols-[27%_70%] gap-8 pt-28 pb-0 lg:pb-12 xl:pt-42">
			<Suspense
				fallback={
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
				}
			>
				<AdminSidebar />
			</Suspense>
			<div className="pt-12">{children}</div>
		</section>
	)
}
