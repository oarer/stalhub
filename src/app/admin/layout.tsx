import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import AdminSidebar from '@/views/admin/AdminSidebar'

export const metadata: Metadata = {
	robots: { index: false, follow: false },
}

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const headersList = await headers()
	const pathname = headersList.get('X-Path')?.split('?')[0] ?? ''

	if (pathname.startsWith('/admin/ceremony')) {
		return <div className="min-h-dvh">{children}</div>
	}

	return (
		<div className="flex min-h-dvh">
			<Suspense
				fallback={
					<div className="border-primary/2 bg-background/80 sticky top-0 hidden h-dvh w-64 shrink-0 border-r-2 px-4 pt-32 pb-6 lg:block">
						<div className="bg-card animate-pulse rounded-lg px-4 py-6">
							<div className="bg-border/20 h-8 w-32 animate-pulse rounded" />
							<div className="mt-4 flex flex-col gap-2">
								{Array.from({ length: 4 }).map((_, i) => (
									<div
										className="bg-border/20 h-10 animate-pulse rounded"
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
				<div className="max-w-8xl mx-auto w-full px-4 pt-14 pb-12 md:px-6 lg:px-8 lg:pt-20">
					{children}
				</div>
			</div>
		</div>
	)
}
