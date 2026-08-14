'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { unbounded } from '@/app/fonts'
import { CheckBox } from '@/components/ui/CheckBox'
import ClanCard from '@/components/ui/clan/ClanCard'
import Input from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { clanQueries } from '@/queries/clan/clan.queries'

export default function ClanCatalogView() {
	const { data: clans, isLoading } = useSuspenseQuery(
		clanQueries.getPublicClans()
	)
	const [query, setQuery] = useState('')
	const [onlyRecruiting, setOnlyRecruiting] = useState(false)
	const t = useTranslations()

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()
		return (clans ?? []).filter((clan) => {
			if (onlyRecruiting && !clan.recruiting) return false
			if (!q) return true
			return (
				clan.name.toLowerCase().includes(q) ||
				clan.tag.toLowerCase().includes(q)
			)
		})
	}, [clans, query, onlyRecruiting])

	return (
		<section className="mx-auto max-w-380 space-y-6 px-4 pt-32 pb-12 sm:px-6">
			<h1 className={`${unbounded.className} font-semibold text-2xl`}>
				{t('clans.title')}
			</h1>

			<div className="flex flex-wrap items-center gap-3">
				<div className="flex w-full max-w-68 items-center gap-2">
					<Icon className="text-xl" icon="lucide:search" />
					<Input
						label="clans.searchLabel"
						onChange={(e) => setQuery(e.target.value)}
						value={query}
					/>
				</div>
				<div className="flex items-center gap-2">
					<CheckBox
						checked={onlyRecruiting}
						className="size-4"
						onCheckedChange={(prev) => setOnlyRecruiting(prev)}
					/>
					<p className="font-semibold">{t('clans.recruiting')}</p>
				</div>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{[...Array(6)].map((_, i) => (
						<Skeleton className="h-40 w-full" key={i} />
					))}
				</div>
			) : filtered.length === 0 ? (
				<p className="font-semibold text-sm text-text-accent">
					{t('clans.empty')}
				</p>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{filtered.map((clan) => (
						<ClanCard clan={clan} key={clan.id} />
					))}
				</div>
			)}
		</section>
	)
}
