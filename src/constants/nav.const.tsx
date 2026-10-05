'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { CLink } from '@/components/ui/Link'
import type { AccordionItem } from '@/types/ui/accordion.type'
import type { DropdownItem, DropdownMenuGroup } from '@/types/ui/dropdown.type'

export const MobileLinks = [
	{
		title: 'Discord',
		href: 'https://discord.gg/VPT7RWYVpc',
		iconName: 'ic:baseline-discord',
	},
	{
		title: 'Telegram',
		href: 'https://t.me/st4lhub',
		iconName: 'basil:telegram-outline',
	},
]

export type NavItem = {
	key: string
	icon: string
	href?: string
	labelKey: string
	descriptionKey?: string
	disabled?: boolean
	submenu?: NavItem[]
}

export type NavCategory = {
	key: string
	titleKey?: string
	title?: string
	items: NavItem[]
}

export type NavGroup = {
	key: string
	titleKey: string
	icon: string
	href?: string
	items?: NavItem[]
	categories?: NavCategory[]
}

export type NavColumn = {
	key: string
	titleKey?: string
	title?: string
	items: NavItem[]
}

const CHUNK_FALLBACK = 5

function chunkIntoColumns<T>(arr: T[], perColumn: number): T[][] {
	const cols: T[][] = []
	for (let i = 0; i < arr.length; i += perColumn) {
		cols.push(arr.slice(i, i + perColumn))
	}
	return cols
}

export function getGroupColumns(
	group: NavGroup,
	perColumn = CHUNK_FALLBACK
): NavColumn[] {
	if (group.categories?.length) return group.categories
	return chunkIntoColumns(group.items ?? [], perColumn).map(
		(items, index) => ({ key: `${group.key}-col-${index}`, items })
	)
}

export function getGroupItems(group: NavGroup): NavItem[] {
	return [
		...(group.items ?? []),
		...(group.categories?.flatMap((category) => category.items) ?? []),
	]
}

export function getCategoryTitle(
	t: ReturnType<typeof useTranslations>,
	category: Pick<NavCategory, 'key' | 'titleKey' | 'title'>
): string {
	if (category.titleKey) return t(category.titleKey)
	return category.title ?? category.key
}

export const NAV_STRUCTURE: NavGroup[] = [
	{
		key: 'calculators',
		titleKey: 'nav.groups.calculators.title',
		icon: 'lucide:calculator',
		href: '/calcs',
		categories: [
			{
				key: 'main',
				titleKey: 'nav.groups.calculators.categories.main.title',
				items: [
					{
						key: 'art',
						icon: 'lucide:package',
						href: '/calcs/builds/lite',
						labelKey: 'nav.groups.calculators.items.art.label',
						descriptionKey:
							'nav.groups.calculators.items.art.description',
						submenu: [
							{
								key: 'art_lite',
								icon: 'lucide:panel-top',
								href: '/calcs/builds/lite',
								labelKey:
									'nav.groups.calculators.items.art.sub_menu.lite',
							},
							{
								key: 'art_3d',
								icon: 'lucide:box',
								href: '/calcs/builds',
								labelKey:
									'nav.groups.calculators.items.art.sub_menu.3d',
								descriptionKey:
									'nav.groups.calculators.items.art.sub_menu.3d_description',
							},
						],
					},
					{
						key: 'TTK',
						icon: 'lucide:timer-reset',
						href: '/calcs/ttk',
						labelKey: 'nav.groups.calculators.items.ttk.label',
						descriptionKey:
							'nav.groups.calculators.items.ttk.description',
					},
					{
						key: 'dpi',
						icon: 'lucide:mouse',
						href: '/calcs/dpi',
						labelKey: 'nav.groups.calculators.items.dpi.label',
						descriptionKey:
							'nav.groups.calculators.items.dpi.description',
					},
					{
						key: 'modules',
						icon: 'lucide:box',
						href: '/calcs/modules',
						labelKey: 'nav.groups.calculators.items.modules.label',
						descriptionKey:
							'nav.groups.calculators.items.modules.description',
					},
					{
						key: 'barter',
						icon: 'lucide:timer-reset',
						href: '/calcs/barter',
						labelKey: 'nav.groups.calculators.items.barter.label',
						descriptionKey:
							'nav.groups.calculators.items.barter.description',
					},
				],
			},
			{
				key: 'leveling',
				titleKey: 'nav.groups.calculators.categories.leveling.title',
				items: [
					{
						key: 'arsen',
						icon: 'lucide:table-properties',
						href: '/calcs/arsenal',
						labelKey: 'nav.groups.calculators.items.arsenal.label',
						descriptionKey:
							'nav.groups.calculators.items.arsenal.description',
					},
					{
						key: 'hideout',
						icon: 'lucide:house',
						href: '/calcs/hideout',
						labelKey: 'nav.groups.calculators.items.hideout.label',
						descriptionKey:
							'nav.groups.calculators.items.hideout.description',
					},
					{
						key: 'bp',
						icon: 'lucide:ticket',
						href: '/calcs/bp',
						labelKey: 'nav.groups.calculators.items.bp.label',
						descriptionKey:
							'nav.groups.calculators.items.bp.description',
					},
					{
						key: 'sessions',
						icon: 'lucide:swords',
						href: '/calcs/sessions',
						labelKey: 'nav.groups.calculators.items.sessions.label',
						descriptionKey:
							'nav.groups.calculators.items.sessions.description',
					},
					{
						key: 'upgrade',
						icon: 'lucide:circle-fading-arrow-up',
						href: '/calcs/upgrade',
						labelKey: 'nav.groups.calculators.items.upgrade.label',
						descriptionKey:
							'nav.groups.calculators.items.upgrade.description',
					},
					{
						key: 'buy',
						icon: 'lucide:table',
						href: '/calcs/buy',
						labelKey: 'nav.groups.calculators.items.buy.label',
						descriptionKey:
							'nav.groups.calculators.items.buy.description',
					},
				],
			},
			{
				key: 'info',
				titleKey: 'nav.groups.calculators.categories.info.title',
				items: [
					{
						key: 'loot',
						icon: 'lucide:pen',
						href: '/loot',
						labelKey: 'nav.groups.other.items.loot.label',
						descriptionKey:
							'nav.groups.other.items.loot.description',
					},
					{
						key: 'maps',
						icon: 'lucide:map',
						href: '/map',
						labelKey: 'nav.groups.other.items.maps.label',
						descriptionKey:
							'nav.groups.other.items.maps.description',
					},
					{
						key: 'servers',
						icon: 'lucide:server',
						href: '/servers',
						labelKey: 'nav.groups.other.items.servers.label',
						descriptionKey:
							'nav.groups.other.items.servers.description',
					},
					{
						key: 'balance',
						icon: 'lucide:scale',
						href: '/balance',
						labelKey: 'nav.groups.other.items.balance.label',
						descriptionKey:
							'nav.groups.other.items.balance.description',
					},
					{
						key: 'models',
						icon: 'lucide:box',
						href: '/models',
						labelKey: 'nav.groups.other.items.models.label',
						descriptionKey:
							'nav.groups.other.items.models.description',
					},
					{
						key: 'eforum',
						icon: 'lucide:messages-circle',
						href: '/eforum',
						labelKey: 'nav.groups.other.items.eforum.label',
						descriptionKey:
							'nav.groups.other.items.eforum.description',
					},
				],
			},
			{
				key: 'services',
				titleKey: 'nav.groups.calculators.categories.services.title',
				items: [
					{
						key: 'clans',
						labelKey: 'nav.groups.clans.title',
						icon: 'lucide:users',
						submenu: [
							{
								key: 'clans',
								icon: 'lucide:users',
								href: '/clans',
								labelKey: 'nav.groups.clans.items.clans.label',
							},
							{
								key: 'clanStats',
								icon: 'lucide:bar-chart-3',
								href: '/clans/stats',
								labelKey: 'nav.groups.clans.items.clanStats.label',
							},
							{
								key: 'clanMaps',
								icon: 'lucide:map-pinned',
								href: '/maps/cw',
								labelKey:
									'nav.groups.clans.items.clanMaps.label',
								descriptionKey:
									'nav.groups.clans.items.clanMaps.description',
							},
						],
					},
					{
						key: 'players',
						icon: 'lucide:user-round-search',
						href: '/player',
						labelKey: 'nav.groups.other.items.players.label',
						descriptionKey:
							'nav.groups.other.items.players.description',
					},
					{
						key: 'operations',
						icon: 'lucide:siren',
						href: '/operations',
						labelKey: 'nav.groups.other.items.operations.label',
						descriptionKey:
							'nav.groups.other.items.operations.description',
					},
					{
						key: 'dashboard',
						icon: 'lucide:layout-grid',
						href: '/dashboard',
						labelKey: 'nav.groups.other.items.dashboard.label',
						descriptionKey:
							'nav.groups.other.items.dashboard.description',
					},
					{
						key: 'download',
						icon: 'lucide:download',
						href: '/download',
						labelKey: 'nav.groups.other.items.download.label',
						descriptionKey:
							'nav.groups.other.items.download.description',
					},
				],
			},
		],
	},
	{
		key: 'creative',
		titleKey: 'nav.groups.creative.title',
		icon: 'lucide:more-horizontal',
		categories: [
			{
				key: 'community',
				titleKey: 'nav.groups.creative.categories.community.title',
				items: [
					{
						key: 'arts',
						icon: 'lucide:palette',
						href: '/arts',
						labelKey: 'nav.groups.creative.items.arts.label',
						descriptionKey:
							'nav.groups.creative.items.arts.description',
					},
					{
						key: 'articles',
						icon: 'lucide:book',
						href: '/articles',
						labelKey: 'nav.groups.creative.items.articles.label',
						descriptionKey:
							'nav.groups.creative.items.articles.description',
					},
					{
						key: 'blog',
						icon: 'lucide:scroll-text',
						href: '/blog',
						labelKey: 'nav.groups.creative.items.blog.label',
						descriptionKey:
							'nav.groups.creative.items.blog.description',
					},
					{
						key: 'builds',
						icon: 'lucide:box',
						href: '/builds',
						labelKey: 'nav.groups.creative.items.builds.label',
						descriptionKey:
							'nav.groups.creative.items.builds.description',
					},
					{
						key: 'tierlists',
						icon: 'lucide:trophy',
						href: '/tierlists',
						labelKey: 'nav.groups.creative.items.tierlists.label',
						descriptionKey:
							'nav.groups.creative.items.tierlists.description',
					},
				],
			},
		],
	},
	{
		key: 'community',
		titleKey: 'nav.groups.community.title',
		icon: 'lucide:more-horizontal',
		categories: [
			{
				key: 'resources',
				titleKey: 'nav.groups.community.categories.resources.title',
				items: [
					{
						key: 'telegram',
						icon: 'basil:telegram-outline',
						href: 'https://t.me/st4lhub',
						labelKey:
							'nav.groups.community.categories.resources.items.telegram.label',
						descriptionKey:
							'nav.groups.community.categories.resources.items.telegram.description',
					},
					{
						key: 'discord',
						icon: 'akar-icons:discord-fill',
						href: 'https://discord.gg/gTSRXjEWkG',
						labelKey:
							'nav.groups.community.categories.resources.items.discord.label',
						descriptionKey:
							'nav.groups.community.categories.resources.items.discord.description',
					},
					{
						key: 'github',
						icon: 'mdi:github',
						href: 'https://github.com/oarer/stalhub',
						labelKey:
							'nav.groups.community.categories.resources.items.github.label',
						descriptionKey:
							'nav.groups.community.categories.resources.items.github.description',
					},
					{
						key: 'about',
						icon: 'lucide:info',
						href: '/about',
						labelKey:
							'nav.groups.community.categories.resources.items.about.label',
						descriptionKey:
							'nav.groups.community.categories.resources.items.about.description',
					},
				],
			},
		],
	},
]

const mapNavItem = (
	item: NavItem,
	t: ReturnType<typeof useTranslations>
): DropdownItem => ({
	key: item.key,
	disabled: item.disabled,

	content: (
		<CLink
			className="flex w-full items-center justify-start gap-2 rounded-lg px-3 py-1"
			disabled={item.disabled}
			href={item.href ?? '#'}
		>
			<Icon className="text-xl" icon={item.icon} />
			<div className="flex flex-col">
				<p className="font-semibold text-foreground">
					{t(item.labelKey)}
				</p>

				{item.descriptionKey && (
					<span className="font-semibold text-muted-foreground text-xs">
						{t(item.descriptionKey)}
					</span>
				)}
			</div>
		</CLink>
	),

	submenu: item.submenu?.map((subItem) => mapNavItem(subItem, t)),
})

export const DropDownLinks = (): DropdownMenuGroup[] => {
	const t = useTranslations()

	return NAV_STRUCTURE.map((group) => ({
		key: group.key,
		title: group.titleKey,
		icon: group.icon,
		items: getGroupItems(group).map((item) => mapNavItem(item, t)),
	}))
}

export const DropDownMobile = (
	t: ReturnType<typeof useTranslations>,
	onNavigate?: () => void
): AccordionItem[] =>
	NAV_STRUCTURE.map((group) => ({
		key: group.key,
		title: t(group.titleKey),
		icon: group.icon,
		content: (
			<>
				{getGroupItems(group).map((item) => (
					<CLink
						className="flex items-center justify-start gap-3 px-2 py-1"
						href={item.href ?? '#'}
						key={item.key}
						onClick={onNavigate}
					>
						<Icon className="text-xl" icon={item.icon} />
						<p>{t(item.labelKey)}</p>
					</CLink>
				))}
			</>
		),
	}))
