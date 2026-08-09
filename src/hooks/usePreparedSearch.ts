'use client'

import {
	normalizeText,
	type PreparedEntry,
	useFuseSearch,
} from '@/hooks/useFuseSearch'
import { useSearchArticles } from '@/hooks/useSearchArticles'
import { useSearchItem } from '@/hooks/useSearchItem'
import { type SitePage, useSearchSitePages } from '@/hooks/useSearchSitePages'
import type { ItemListing } from '@/types/api.type'
import type { Article } from '@/types/article.type'
import type { ItemName, Locale } from '@/types/item.type'

export type PreparedItem = PreparedEntry<ItemListing>
export type PreparedPage = PreparedEntry<SitePage>
export type PreparedArticle = PreparedEntry<Article>

interface UsePreparedSearchOptions {
	locale?: Locale
	minLength?: number
	threshold?: number
}

export function usePreparedSearch(
	query: string,
	opts?: UsePreparedSearchOptions
) {
	const MIN_LENGTH = opts?.minLength ?? 2
	const locale: keyof ItemName = opts?.locale ?? 'ru'
	const threshold = opts?.threshold ?? 0.4

	const { items, loading: itemsLoading, error: itemsError } = useSearchItem()
	const pages = useSearchSitePages()
	const {
		articles,
		loading: articlesLoading,
		error: articlesError,
	} = useSearchArticles()

	const { preparedEntries: preparedItems, filteredEntries: filteredItems } =
		useFuseSearch<ItemListing>(items ?? [], query, {
			getName: (i) => (i.name && i.name[locale]) ?? '',
			getKey: (i) =>
				`${i.data ?? ''}-${normalizeText((i.name && i.name[locale]) ?? '')}-${i.icon ?? ''}`,
			locale,
			minLength: MIN_LENGTH,
			threshold,
		})

	const { preparedEntries: preparedPages, filteredEntries: filteredPages } =
		useFuseSearch<SitePage>(pages, query, {
			getName: (p) =>
				`${p.title} ${p.description ?? ''} ${p.groupTitle ?? ''}`,
			getKey: (p) => `page-${p.href}`,
			locale,
			alwaysTranslit: true,
			minLength: MIN_LENGTH,
			threshold,
		})

	const {
		preparedEntries: preparedArticles,
		filteredEntries: filteredArticles,
	} = useFuseSearch<Article>(articles, query, {
		getName: (a) =>
			`${a.title} ${a.author?.username ?? ''} ${a.tags?.join(' ') ?? ''}`,
		getKey: (a) => `article-${a.id}`,
		locale,
		alwaysTranslit: true,
		minLength: MIN_LENGTH,
		threshold,
	})

	return {
		filteredItems,
		preparedItems,
		filteredPages,
		preparedPages,
		filteredArticles,
		preparedArticles,
		loading: itemsLoading || articlesLoading,
		error: itemsError || articlesError,
	}
}
