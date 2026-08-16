import type { LinkTab } from '@/components/ui/LinkTabs'
import type { CardBackground, PublicUser, User } from '@/types/user.type'

interface Tab {
	title: string
	href: string
	icon: string
}

export interface TabGroup {
	label?: string
	items: Tab[]
}

export const tabGroups: TabGroup[] = [
	{
		items: [{ title: 'me.nav.home', href: '/me', icon: 'lucide:home' }],
	},
	{
		label: 'me.nav.clan',
		items: [
			{
				title: 'me.nav.dashboard',
				href: '/me/clan',
				icon: 'lucide:users',
			},
			{
				title: 'me.nav.members',
				href: '/me/clan/members',
				icon: 'lucide:user-round',
			},
			{
				title: 'me.nav.sessions',
				href: '/me/clan/sessions',
				icon: 'lucide:swords',
			},
			{
				title: 'me.nav.stats',
				href: '/me/clan/stats',
				icon: 'lucide:bar-chart-3',
			},
			{
				title: 'me.nav.grenades',
				href: '/me/clan/grenades',
				icon: 'lucide:bomb',
			},
			{
				title: 'me.nav.squads',
				href: '/me/clan/squads',
				icon: 'lucide:group',
			},
			{
				title: 'me.nav.gold',
				href: '/me/clan/gold',
				icon: 'lucide:coins',
			},
			{
				title: 'me.nav.absences',
				href: '/me/clan/absences',
				icon: 'lucide:calendar-x',
			},
			{
				title: 'me.nav.settings',
				href: '/me/clan/settings',
				icon: 'lucide:settings',
			},
		],
	},
	{
		label: 'me.nav.content',
		items: [
			{
				title: 'me.nav.articles',
				href: '/me/articles',
				icon: 'lucide:book-open',
			},
			{
				title: 'me.nav.builds',
				href: '/me/builds',
				icon: 'lucide:box',
			},
			{
				title: 'me.nav.arts',
				href: '/me/arts',
				icon: 'lucide:palette',
			},
			{
				title: 'me.nav.stars',
				href: '/me/stars',
				icon: 'lucide:star',
			},
		],
	},
	{
		label: 'me.nav.system',
		items: [
			{
				title: 'me.nav.notifications',
				href: '/me/notifications',
				icon: 'lucide:bell',
			},
			{
				title: 'me.nav.settings',
				href: '/me/settings',
				icon: 'lucide:settings',
			},
		],
	},
]

export const canAccessArtTab = (roles: { name: string }[]) =>
	roles.some((r) => r.name === 'author' || r.name === 'admin')

export const filterTabsByRoles = (
	groups: TabGroup[],
	roles: { name: string }[]
): TabGroup[] => {
	const showArts = canAccessArtTab(roles)
	return groups
		.map((group) => ({
			...group,
			items: group.items.filter(
				(tab) => !(tab.href === '/me/arts' && !showArts)
			),
		}))
		.filter((group) => group.items.length > 0)
}

export const getNavTabs = (
	unreadCount: number | null | undefined,
	translate: (key: string) => string,
	roles: { name: string }[]
): LinkTab[] =>
	filterTabsByRoles(tabGroups, roles).map((group) => {
		const items = group.items.map((tab) => ({
			title: translate(tab.title),
			href: tab.href,
			badge:
				tab.href === '/me/notifications' && unreadCount
					? unreadCount
					: undefined,
		}))
		return {
			title: group.label ? translate(group.label) : items[0].title,
			href: group.items[0].href,
			...(items.length > 1 ? { children: items } : {}),
		}
	})

export interface UserCardProps extends React.ComponentPropsWithoutRef<'div'> {
	user: User | PublicUser
	cardBackground: CardBackground
	cardColor: string
	onCardChange?: (data: {
		cardBackground?: CardBackground
		cardColor?: string
	}) => void
}
export interface NavTabsProps {
	pathname: string
	unreadCount: number | null | undefined
	roles: { name: string }[]
	onTabClick?: () => void
}
export interface MeLayoutProps {
	children: React.ReactNode
	user: User
	unreadCount: number | null | undefined
	pathname: string
	onCardChange: (data: {
		cardBackground?: CardBackground
		cardColor?: string
	}) => void
}
