'use client'

import type { MeLayoutProps } from '@/types/me.types'
import MeBanner from '@/views/me/components/MeBanner'
import MeSidebar from '@/views/me/components/MeSidebar'

export default function CompactLayout({
	children,
	user,
	unreadCount,
	pathname,
	onCardChange,
}: MeLayoutProps) {
	const customization = user.customization

	return (
		<div className="flex min-h-dvh">
			<aside className="sticky top-0 hidden h-dvh w-84 shrink-0 overflow-y-auto border-primary/2 border-r-2 bg-background/80 px-4 pt-38 pb-6 lg:block">
				<MeSidebar
					onCardChange={onCardChange}
					pathname={pathname}
					showBanner
					unreadCount={unreadCount}
					user={user}
				/>
			</aside>
			<div className="min-w-0 flex-1 pt-12">
				<div className="px-2 pt-28 pb-12 md:px-4">
					<MeBanner
						bannerColor={customization.banner_color}
						bannerImage={customization.banner_image}
						bannerMode={customization.banner_mode}
						bannerType={customization.banner_type}
						className="mt-8 mb-8 lg:hidden"
					/>
					<div className="py-6 lg:py-0">{children}</div>
				</div>
			</div>
		</div>
	)
}
