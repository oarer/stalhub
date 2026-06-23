'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { CLink } from '@/components/ui/Link'
import type { AccordionItem } from '@/types/ui/accordion.type'
import type { DropdownItem, DropdownMenuGroup } from '@/types/ui/dropdown.type'

export const Links = [
	{
		title: '',
		href: '/discord',
		iconName: 'ic:baseline-discord',
	},
]

export const MobileLinks = [
	{
		title: 'Discord',
		href: '/discord',
		iconName: 'ic:baseline-discord',
	},
	{
		title: 'Telegram',
		href: '/discord',
		iconName: 'basil:telegram-outline',
	},
]

type NavItem = {
	key: string
	icon: string
	href?: string
	labelKey: string
	descriptionKey?: string
	disabled?: boolean
	submenu?: NavItem[]
}

type NavGroup = {
	key: string
	titleKey: string
	icon: string
	items: NavItem[]
}

const NAV_STRUCTURE: NavGroup[] = [
	{
		key: 'calculators',
		titleKey: 'nav.groups.calculators.title',
		icon: 'lucide:calculator',
		items: [
			{
				key: 'art',
				icon: 'lucide:package',
				href: '/calcs/builds/lite',
				labelKey: 'nav.groups.calculators.items.art.label',
				descriptionKey: 'nav.groups.calculators.items.art.description',
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
				descriptionKey: 'nav.groups.calculators.items.ttk.description',
			},
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
				descriptionKey: 'nav.groups.calculators.items.bp.description',
			},
			{
				key: 'dpi',
				icon: 'lucide:mouse',
				href: '/calcs/dpi',
				labelKey: 'nav.groups.calculators.items.dpi.label',
				descriptionKey: 'nav.groups.calculators.items.dpi.description',
			},
		],
	},
	{
		key: 'clans',
		titleKey: 'nav.groups.clans.title',
		icon: 'lucide:shield-half',
		items: [
			{
				key: 'clanMaps',
				icon: 'lucide:map-pinned',
				href: '/maps/cw',
				labelKey: 'nav.groups.clans.items.clanMaps.label',
				descriptionKey: 'nav.groups.clans.items.clanMaps.description',
			},
			{
				key: 'squads',
				icon: 'lucide:radio-tower',
				href: '/test',
				labelKey: 'nav.groups.clans.items.squads.label',
				descriptionKey: 'nav.groups.clans.items.squads.description',
				disabled: true,
			},
		],
	},
	{
		key: 'other',
		titleKey: 'nav.groups.other.title',
		icon: 'lucide:more-horizontal',
		items: [
			{
				key: 'maps',
				icon: 'lucide:map',
				href: '/maps',
				labelKey: 'nav.groups.other.items.maps.label',
			},
			{
				key: 'players',
				icon: 'lucide:user-round-search',
				href: '/player',
				labelKey: 'nav.groups.other.items.players.label',
			},
			{
				key: 'models',
				icon: 'lucide:box',
				href: '',
				labelKey: 'nav.groups.other.items.models.label',
				descriptionKey: 'nav.groups.other.items.models.description',
				disabled: true,
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
				<p className="font-semibold text-neutral-700 dark:text-neutral-100">
					{t(item.labelKey)}
				</p>

				{item.descriptionKey && (
					<span className="font-semibold text-neutral-500 text-xs dark:text-neutral-400">
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
		items: group.items.map((item) => mapNavItem(item, t)),
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
				{group.items.map((item) => (
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