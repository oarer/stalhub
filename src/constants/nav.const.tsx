'use client'

import { Icon } from '@iconify/react'
import { CLink } from '@/components/ui/Link'
import { useTranslations } from 'next-intl'
import type { AccordionItem } from '@/types/ui/accordion.type'
import type { DropdownMenuGroup } from '@/types/ui/dropdown.type'

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

export const DropDownLinks = (): DropdownMenuGroup[] => {
	const t = useTranslations()

	return [
		{
			key: 'calculators',
			title: 'nav.groups.calculators.title',
			icon: 'lucide:calculator',
			items: [
				{
					key: 'art',
					content: (
						<CLink
							className="flex w-full items-center justify-start gap-2 rounded-lg px-3 py-1"
							href="/calcs/builds"
						>
							<Icon className="text-xl" icon="lucide:package" />
							<div className="flex flex-col">
								<p className="font-semibold text-neutral-700 dark:text-neutral-100">
									{t(
										'nav.groups.calculators.items.art.label'
									)}
								</p>
								<span className="font-semibold text-neutral-500 text-xs dark:text-neutral-400">
									{t(
										'nav.groups.calculators.items.art.description'
									)}
								</span>
							</div>
						</CLink>
					),
				},
				{
					key: 'TTK',
					content: (
						<CLink
							className="flex w-full items-center justify-start gap-2 rounded-lg px-3 py-1"
							href="/calcs/ttk"
						>
							<Icon
								className="text-xl"
								icon="lucide:timer-reset"
							/>
							<div className="flex flex-col">
								<p className="font-semibold text-neutral-700 dark:text-neutral-100">
									{t(
										'nav.groups.calculators.items.ttk.label'
									)}
								</p>
								<span className="font-semibold text-neutral-500 text-xs dark:text-neutral-400">
									{t(
										'nav.groups.calculators.items.ttk.description'
									)}
								</span>
							</div>
						</CLink>
					),
				},
				{
					key: 'barter',
					content: (
						<CLink
							className="flex w-full items-center justify-start gap-2 rounded-lg px-3 py-1"
							href={'test'}
						>
							<Icon className="text-xl" icon="lucide:coins" />
							<div className="flex flex-col">
								<p className="font-semibold text-neutral-700 dark:text-neutral-100">
									{t(
										'nav.groups.calculators.items.barter.label'
									)}
								</p>
								<span className="font-semibold text-neutral-500 text-xs dark:text-neutral-400">
									{t(
										'nav.groups.calculators.items.barter.description'
									)}
								</span>
							</div>
						</CLink>
					),
				},
				{
					key: 'bp',
					content: (
						<CLink
							className="flex w-full items-center justify-start gap-2 rounded-lg px-3 py-1"
							href={'test'}
						>
							<Icon className="text-xl" icon="lucide:ticket" />
							<div className="flex flex-col">
								<p className="font-semibold text-neutral-700 dark:text-neutral-100">
									{t('nav.groups.calculators.items.bp.label')}
								</p>
								<span className="font-semibold text-neutral-500 text-xs dark:text-neutral-400">
									{t(
										'nav.groups.calculators.items.bp.description'
									)}
								</span>
							</div>
						</CLink>
					),
				},
				{
					key: 'dpi',
					content: (
						<CLink
							className="flex w-full items-center justify-start gap-2 rounded-lg px-3 py-1"
							href={'test'}
						>
							<Icon className="text-xl" icon="lucide:mouse" />
							<div className="flex flex-col">
								<p className="font-semibold text-neutral-700 dark:text-neutral-100">
									{t(
										'nav.groups.calculators.items.dpi.label'
									)}
								</p>
								<span className="font-semibold text-neutral-500 text-xs dark:text-neutral-400">
									{t(
										'nav.groups.calculators.items.dpi.description'
									)}
								</span>
							</div>
						</CLink>
					),
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
					content: (
						<CLink
							className="flex w-full items-center justify-start gap-2 rounded-lg px-3 py-1"
							href={'test'}
						>
							<Icon
								className="text-xl"
								icon="lucide:map-pinned"
							/>
							<div className="flex flex-col">
								<p className="font-semibold text-neutral-700 dark:text-neutral-100">
									{t('nav.groups.clans.items.clanMaps.label')}
								</p>
								<span className="font-semibold text-neutral-500 text-xs dark:text-neutral-400">
									{t(
										'nav.groups.clans.items.clanMaps.description'
									)}
								</span>
							</div>
						</CLink>
					),
				},
				{
					key: 'squads',
					content: (
						<CLink
							className="flex w-full items-center justify-start gap-2 rounded-lg px-3 py-1"
							href={'test'}
						>
							<Icon
								className="text-xl"
								icon="lucide:radio-tower"
							/>
							<div className="flex flex-col">
								<p className="font-semibold text-neutral-700 dark:text-neutral-100">
									{t('nav.groups.clans.items.squads.label')}
								</p>
								<span className="font-semibold text-neutral-500 text-xs dark:text-neutral-400">
									{t(
										'nav.groups.clans.items.squads.description'
									)}
								</span>
							</div>
						</CLink>
					),
					disabled: true,
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
					content: (
						<CLink
							className="flex w-full items-center justify-start gap-2 rounded-lg px-3 py-1"
							href={'test'}
						>
							<Icon className="text-xl" icon="lucide:map" />
							<p className="font-semibold text-neutral-700 dark:text-neutral-100">
								{t('nav.groups.other.items.maps.label')}
							</p>
						</CLink>
					),
				},
				{
					key: 'auction',
					content: (
						<CLink
							className="flex w-full items-center justify-start gap-2 rounded-lg px-3 py-1"
							href={'test'}
						>
							<Icon className="text-xl" icon="lucide:landmark" />
							<p className="font-semibold text-neutral-700 dark:text-neutral-100">
								{t('nav.groups.other.items.auction.label')}
							</p>
						</CLink>
					),
				},
				{
					key: 'players',
					content: (
						<CLink
							className="flex w-full items-center justify-start gap-2 rounded-lg px-3 py-1"
							href={'test'}
						>
							<Icon
								className="text-xl"
								icon="lucide:user-round-search"
							/>
							<p className="font-semibold text-neutral-700 dark:text-neutral-100">
								{t('nav.groups.other.items.players.label')}
							</p>
						</CLink>
					),
				},
				{
					key: 'markerEditor',
					content: (
						<CLink
							className="flex w-full items-center justify-start gap-2 rounded-lg px-3 py-1"
							href="/marker-editor"
						>
							<Icon className="text-xl" icon="lucide:map-pin" />
							<div className="flex flex-col">
								<p className="font-semibold text-neutral-700 dark:text-neutral-100">
									Редактор меток
								</p>
								<span className="font-semibold text-neutral-500 text-xs dark:text-neutral-400">
									CFG + генерация + экспорт
								</span>
							</div>
						</CLink>
					),
				},
				{
					key: 'models',
					content: (
						<CLink
							className="flex w-full cursor-not-allowed items-center justify-start gap-2 rounded-lg px-3 py-1 opacity-50"
							href={'test'}
						>
							<Icon className="text-xl" icon="lucide:box" />
							<div className="flex flex-col">
								<p className="font-semibold text-neutral-700 dark:text-neutral-100">
									{t('nav.groups.other.items.models.label')}
								</p>
								<span className="font-semibold text-neutral-500 text-xs dark:text-neutral-400">
									{t(
										'nav.groups.other.items.models.description'
									)}
								</span>
							</div>
						</CLink>
					),
					disabled: true,
				},
			],
		},
	]
}

export const DropDownMobile = (
	t: ReturnType<typeof useTranslations>
): AccordionItem[] => [
	{
		key: 'calculators',
		title: t('nav.groups.calculators.title'),
		icon: 'lucide:calculator',
		content: (
			<>
				<CLink
					className="flex items-center justify-start gap-3 px-2 py-1"
					href="/art"
				>
					<Icon className="text-xl" icon="lucide:package" />
					<p>{t('nav.groups.calculators.items.art.label')}</p>
				</CLink>
				<CLink
					className="flex items-center justify-start gap-3 px-2 py-1"
					href="/ttk"
				>
					<Icon className="text-xl" icon="lucide:timer-reset" />
					<p>{t('nav.groups.calculators.items.ttk.label')}</p>
				</CLink>
				<CLink
					className="flex items-center justify-start gap-3 px-2 py-1"
					href="/barter"
				>
					<Icon className="text-xl" icon="lucide:coins" />
					<p>{t('nav.groups.calculators.items.barter.label')}</p>
				</CLink>
				<CLink
					className="flex items-center justify-start gap-3 px-2 py-1"
					href="/bp"
				>
					<Icon className="text-xl" icon="lucide:ticket" />
					<p>{t('nav.groups.calculators.items.bp.label')}</p>
				</CLink>
				<CLink
					className="flex items-center justify-start gap-3 px-2 py-1"
					href="/dpi"
				>
					<Icon className="text-xl" icon="lucide:mouse" />
					<p>{t('nav.groups.calculators.items.dpi.label')}</p>
				</CLink>
			</>
		),
	},
	{
		key: 'clans',
		title: t('nav.groups.clans.title'),
		icon: 'lucide:shield-half',
		content: (
			<>
				<CLink
					className="flex items-center justify-start gap-3 px-2 py-1"
					href="/kv-maps"
				>
					<Icon className="text-xl" icon="lucide:map-pinned" />
					<p>{t('nav.groups.clans.items.clanMaps.label')}</p>
				</CLink>
				<CLink
					className="flex items-center justify-start gap-3 px-2 py-1"
					href="/squads"
				>
					<Icon className="text-xl" icon="lucide:radio-tower" />
					<p>{t('nav.groups.clans.items.squads.label')}</p>
				</CLink>
				<CLink
					className="flex items-center justify-start gap-3 px-2 py-1"
					href="/clan-ratings"
				>
					<Icon
						className="text-xl"
						icon="lucide:chart-no-axes-column"
					/>
					<p>{t('nav.groups.clans.items.top.label')}</p>
				</CLink>
			</>
		),
	},
	{
		key: 'other',
		title: t('nav.groups.other.title'),
		icon: 'lucide:more-horizontal',
		content: (
			<>
				<CLink
					className="flex items-center justify-start gap-3 px-2 py-1"
					href="/maps"
				>
					<Icon className="text-xl" icon="lucide:map" />
					<p>{t('nav.groups.other.items.maps.label')}</p>
				</CLink>
				<CLink
					className="flex items-center justify-start gap-3 px-2 py-1"
					href="/auction"
				>
					<Icon className="text-xl" icon="lucide:landmark" />
					<p>{t('nav.groups.other.items.auction.label')}</p>
				</CLink>
				<CLink
					className="flex items-center justify-start gap-3 px-2 py-1"
					href="/players"
				>
					<Icon className="text-xl" icon="lucide:user-round-search" />
					<p>{t('nav.groups.other.items.players.label')}</p>
				</CLink>
				<CLink
					className="flex items-center justify-start gap-3 px-2 py-1"
					href="/marker-editor"
				>
					<Icon className="text-xl" icon="lucide:map-pin" />
					<p>Редактор меток</p>
				</CLink>
				<CLink
					className="flex items-center justify-start gap-3 px-2 py-1"
					href="/models"
				>
					<Icon className="text-xl" icon="lucide:box" />
					<p>{t('nav.groups.other.items.models.label')}</p>
				</CLink>
			</>
		),
	},
]
