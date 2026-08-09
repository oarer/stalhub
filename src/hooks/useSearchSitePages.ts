'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import {
	NAV_STRUCTURE,
	type NavGroup,
	type NavItem,
} from '@/constants/nav.const'

export type SitePage = {
	href: string
	title: string
	description?: string
	groupTitle?: string
	icon: string
}

const EXTRA_PAGES: Array<{
	href: string
	icon: string
	labelKey: string
	descriptionKey?: string
	groupKey: string
}> = [
	{
		href: '/articles',
		icon: 'lucide:book-open',
		labelKey: 'nav.articles',
		groupKey: 'nav.groups.other.title',
	},
	{
		href: '/about',
		icon: 'lucide:info',
		labelKey: 'footer.links.about',
		groupKey: 'nav.groups.other.title',
	},
]

const mapItemToPages = (
	item: NavItem,
	t: ReturnType<typeof useTranslations>,
	groupTitle: string,
	acc: SitePage[]
) => {
	if (item.disabled || !item.href) return

	acc.push({
		href: item.href,
		title: t(item.labelKey),
		description: item.descriptionKey ? t(item.descriptionKey) : undefined,
		groupTitle,
		icon: item.icon,
	})

	item.submenu?.forEach((subItem) =>
		mapItemToPages(subItem, t, t(item.labelKey), acc)
	)
}

const mapGroupToPages = (
	group: NavGroup,
	t: ReturnType<typeof useTranslations>,
	acc: SitePage[]
) => {
	const groupTitle = t(group.titleKey)

	group.items.forEach((item) => mapItemToPages(item, t, groupTitle, acc))
}

export function useSearchSitePages() {
	const t = useTranslations()

	return useMemo(() => {
		const pages: SitePage[] = []

		NAV_STRUCTURE.forEach((group) => mapGroupToPages(group, t, pages))

		EXTRA_PAGES.forEach((page) => {
			pages.push({
				href: page.href,
				title: t(page.labelKey),
				description: page.descriptionKey
					? t(page.descriptionKey)
					: undefined,
				groupTitle: t(page.groupKey),
				icon: page.icon,
			})
		})

		return pages
	}, [t])
}
