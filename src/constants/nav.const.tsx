import { useTranslation } from 'react-i18next'

import { Icon } from '@iconify/react/dist/iconify.js'

import CLink from '@/components/ui/Link'
import type { AccordionItem } from '@/types/ui/accordion.type'
import { type DropdownMenuGroup } from '@/types/ui/dropdown.type'

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
]

export const DropDownLinks: DropdownMenuGroup[] = [
	{
		key: 'calculators',
		title: 'nav.groups.calculators.title',
		icon: 'lucide:calculator',
		items: [
			{
				key: 'art',
				label: 'nav.groups.calculators.items.art.label',
				icon: 'lucide:package',
				description: 'nav.groups.calculators.items.art.description',
				onClick: () => console.log('Profile clicked'),
			},
			{
				key: 'TTK',
				label: 'nav.groups.calculators.items.ttk.label',
				icon: 'lucide:timer-reset',
				description: 'nav.groups.calculators.items.ttk.description',
				onClick: () => console.log('Profile clicked'),
			},
			{
				key: 'barter',
				label: 'nav.groups.calculators.items.barter.label',
				icon: 'lucide:coins',
				description: 'nav.groups.calculators.items.barter.description',
				onClick: () => console.log('Profile clicked'),
			},
			{
				key: 'bp',
				label: 'nav.groups.calculators.items.bp.label',
				icon: 'lucide:ticket',
				description: 'nav.groups.calculators.items.bp.description',
				onClick: () => console.log('Profile clicked'),
			},
			{
				key: 'dpi',
				label: 'nav.groups.calculators.items.dpi.label',
				icon: 'lucide:mouse',
				description: 'nav.groups.calculators.items.dpi.description',
				onClick: () => console.log('Profile clicked'),
			},
		],
	},
	{
		key: 'clans',
		title: 'nav.groups.clans.title',
		icon: 'lucide:shield-half',
		items: [
			{
				key: 'clanMaps',
				label: 'nav.groups.clans.items.clanMaps.label',
				icon: 'lucide:map-pinned',
				description: 'nav.groups.clans.items.clanMaps.description',
				onClick: () => console.log('maps'),
			},
			{
				key: 'squads',
				label: 'nav.groups.clans.items.squads.label',
				icon: 'lucide:radio-tower',
				description: 'nav.groups.clans.items.squads.description',
				disabled: true,
				onClick: () => console.log('squads'),
			},
			{
				key: 'top',
				label: 'nav.groups.clans.items.top.label',
				icon: 'lucide:chart-no-axes-column',
				description: 'nav.groups.clans.items.top.description',
				disabled: true,
				onClick: () => console.log('squads'),
			},
		],
	},
	{
		key: 'other',
		title: 'nav.groups.other.title',
		icon: 'lucide:more-horizontal',
		items: [
			{
				key: 'maps',
				label: 'nav.groups.other.items.maps.label',
				icon: 'lucide:map',
				onClick: () => console.log('Profile clicked'),
			},
			{
				key: 'auction',
				label: 'nav.groups.other.items.auction.label',
				icon: 'lucide:landmark',
				onClick: () => console.log('Profile clicked'),
			},
			{
				key: 'players',
				label: 'nav.groups.other.items.players.label',
				icon: 'lucide:user-round-search',
				onClick: () => console.log('Profile clicked'),
			},
			{
				key: 'models',
				label: 'nav.groups.other.items.models.label',
				icon: 'lucide:box',
				description: 'nav.groups.other.items.models.description',
				disabled: true,
				onClick: () => console.log('Profile clicked'),
			},
		],
	},
]

export const DropDownMobile = (): AccordionItem[] => {
	const { t } = useTranslation()

	return [
		{
			key: 'calculators',
			title: t('nav.groups.calculators.title'),
			icon: 'lucide:calculator',
			content: (
				<div className="flex flex-col gap-2">
					<CLink href="/art" size="sm">
						<Icon className="text-xl" icon="lucide:package" />
						<p>{t('nav.groups.calculators.items.art.label')}</p>
					</CLink>
					<CLink href="/ttk" size="sm">
						<Icon className="text-xl" icon="lucide:timer-reset" />
						<p>{t('nav.groups.calculators.items.ttk.label')}</p>
					</CLink>
					<CLink href="/barter" size="sm">
						<Icon className="text-xl" icon="lucide:coins" />
						<p>{t('nav.groups.calculators.items.barter.label')}</p>
					</CLink>
					<CLink href="/bp" size="sm">
						<Icon className="text-xl" icon="lucide:ticket" />
						<p>{t('nav.groups.calculators.items.bp.label')}</p>
					</CLink>
					<CLink href="/dpi" size="sm">
						<Icon className="text-xl" icon="lucide:mouse" />
						<p>{t('nav.groups.calculators.items.dpi.label')}</p>
					</CLink>
				</div>
			),
		},
		{
			key: 'clans',
			title: t('nav.groups.clans.title'),
			icon: 'lucide:shield-half',
			content: (
				<div className="flex flex-col gap-2">
					<CLink href="/kv-maps" size="sm">
						<Icon className="text-xl" icon="lucide:map-pinned" />
						<p>{t('nav.groups.clans.items.clanMaps.label')}</p>
					</CLink>
					<CLink href="/squads" size="sm">
						<Icon className="text-xl" icon="lucide:radio-tower" />
						<p>{t('nav.groups.clans.items.squads.label')}</p>
					</CLink>
					<CLink href="/clan-ratings" size="sm">
						<Icon
							className="text-xl"
							icon="lucide:chart-no-axes-column"
						/>
						<p>{t('nav.groups.clans.items.top.label')}</p>
					</CLink>
				</div>
			),
		},
		{
			key: 'other',
			title: t('nav.groups.other.title'),
			icon: 'lucide:more-horizontal',
			content: (
				<div className="flex flex-col gap-2">
					<CLink href="/maps" size="sm">
						<Icon className="text-xl" icon="lucide:map" />
						<p>{t('nav.groups.other.items.maps.label')}</p>
					</CLink>
					<CLink href="/auction" size="sm">
						<Icon className="text-xl" icon="lucide:landmark" />
						<p>{t('nav.groups.other.items.auction.label')}</p>
					</CLink>
					<CLink href="/players" size="sm">
						<Icon
							className="text-xl"
							icon="lucide:user-round-search"
						/>
						<p>{t('nav.groups.other.items.players.label')}</p>
					</CLink>
					<CLink href="/models" size="sm">
						<Icon className="text-xl" icon="lucide:box" />
						<p>{t('nav.groups.other.items.models.label')}</p>
					</CLink>
				</div>
			),
		},
	]
}
