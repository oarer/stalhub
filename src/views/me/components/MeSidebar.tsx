'use client'

import type { MeLayoutProps } from '@/types/me.types'
import MeBanner from '@/views/me/components/MeBanner'
import NavTabs from '@/views/me/components/NavTabs'
import UserCard from '@/views/me/components/UserCard'

export default function MeSidebar({
	user,
	unreadCount,
	pathname,
	onCardChange,
	showBanner,
}: Omit<MeLayoutProps, 'children'> & { showBanner: boolean }) {
	const customization = user.customization

	return (
		<div className="hidden max-h-[inherit] min-h-0 flex-col gap-4 lg:flex">
			{showBanner && (
				<div className="shrink-0">
					<MeBanner
						bannerColor={customization.banner_color}
						bannerImage={customization.banner_image}
						bannerMode={customization.banner_mode}
						bannerType={customization.banner_type}
					/>
				</div>
			)}
			<div className="shrink-0 pr-2">
				<UserCard
					cardBackground={customization.card_background ?? 'NONE'}
					cardColor={customization.card_color ?? '#000000'}
					onCardChange={onCardChange}
					user={user}
				/>
			</div>
			<div className="mask-y-from-97% mask-y-to-100% me-scroll max-h-[calc(64dvh-9rem)] flex-1 overflow-y-auto rounded-lg pr-1">
				<NavTabs
					pathname={pathname}
					roles={user.roles}
					unreadCount={unreadCount}
				/>
			</div>
		</div>
	)
}
