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
		<div className="hidden lg:block">
			<div className="flex flex-col gap-4">
				{showBanner && (
					<MeBanner
						bannerColor={customization.banner_color}
						bannerImage={customization.banner_image}
						bannerMode={customization.banner_mode}
						bannerType={customization.banner_type}
					/>
				)}
				<UserCard
					cardBackground={customization.card_background ?? 'NONE'}
					cardColor={customization.card_color ?? '#000000'}
					onCardChange={onCardChange}
					user={user}
				/>
				<NavTabs
					pathname={pathname}
					roles={user.roles}
					unreadCount={unreadCount}
				/>
			</div>
		</div>
	)
}
