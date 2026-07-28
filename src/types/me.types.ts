import type { BgVariant, User } from '@/types/user.type'

export interface Tab {
	title: string
	href: string
	icon: string
}

export const tabs: Tab[] = [
	{ title: 'Главная', href: '/me', icon: 'lucide:home' },
	{ title: 'Статьи', href: '/me/articles', icon: 'lucide:book-open' },
	{ title: 'Сборки', href: '/me/builds', icon: 'lucide:box' },
	{ title: 'Избранное', href: '/me/stars', icon: 'lucide:star' },
	{ title: 'Уведомления', href: '/me/notifications', icon: 'lucide:bell' },
	{ title: 'Настройки', href: '/me/settings', icon: 'lucide:settings' },
]

export interface UserCardProps {
	user: User
	bgVariant: BgVariant
	bgColor: string
	onBgChange: (data: { bg_variant?: BgVariant; bg_color?: string }) => void
}

export interface NavTabsProps {
	pathname: string
	unreadCount: number | null | undefined
	onTabClick?: () => void
}
