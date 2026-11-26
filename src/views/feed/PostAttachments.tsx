'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { FeedBuild, FeedTierList } from '@/types/feed.type'
import { BuildPreview, TierListPreview } from './ContentPreviews'

export function PostAttachments({
	builds,
	tierLists,
}: {
	builds?: FeedBuild[]
	tierLists?: FeedTierList[]
}) {
	const t = useTranslations()
	const empty =
		(!builds || builds.length === 0) &&
		(!tierLists || tierLists.length === 0)
	if (empty) return null
	return (
		<div className="mt-1 flex flex-col gap-2">
			{builds?.map(
				(build) =>
					build && (
						<Link
							className="border-primary/20 hover:border-primary/40 hover:bg-muted/20 flex flex-col gap-2 rounded-2xl border p-3 transition-colors"
							href={`/builds/${build.external_id ?? build.id}`}
							key={`build-${build.id}`}
						>
							<span className="flex items-center gap-2">
								<Icon
									className="text-primary/70 size-4 shrink-0"
									icon="lucide:boxes"
								/>
								<span className="truncate text-sm font-semibold">
									{build.title}
								</span>
								<span className="text-foreground ml-auto shrink-0 text-[11px]">
									{t('feed.attachments.build')}
								</span>
							</span>
							<BuildPreview build={build} compact />
						</Link>
					)
			)}
			{tierLists?.map(
				(list) =>
					list && (
						<Link
							className="border-primary/20 hover:border-primary/40 hover:bg-muted/20 flex flex-col gap-2 rounded-2xl border p-3 transition-colors"
							href={`/tierlists/${list.external_id ?? list.id}`}
							key={`tier-${list.id}`}
						>
							<span className="flex items-center gap-2">
								<Icon
									className="text-primary/70 size-4 shrink-0"
									icon="lucide:layout-list"
								/>
								<span className="truncate text-sm font-semibold">
									{list.title}
								</span>
								<span className="text-foreground ml-auto shrink-0 text-[11px]">
									{t('feed.attachments.tier_list')}
								</span>
							</span>
							<TierListPreview
								compact
								entries={list.entries}
								itemKind={list.item_kind}
							/>
						</Link>
					)
			)}
		</div>
	)
}
