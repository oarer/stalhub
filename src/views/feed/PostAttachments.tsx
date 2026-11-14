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
							className="flex flex-col gap-2 rounded-2xl border border-primary/20 p-3 transition-colors hover:border-primary/40 hover:bg-muted/20"
							href={`/builds/${build.external_id ?? build.id}`}
							key={`build-${build.id}`}
						>
							<span className="flex items-center gap-2">
								<Icon
									className="size-4 shrink-0 text-primary/70"
									icon="lucide:boxes"
								/>
								<span className="truncate font-semibold text-sm">
									{build.title}
								</span>
								<span className="ml-auto shrink-0 text-[11px] text-foreground">
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
							className="flex flex-col gap-2 rounded-2xl border border-primary/20 p-3 transition-colors hover:border-primary/40 hover:bg-muted/20"
							href={`/tierlists/${list.external_id ?? list.id}`}
							key={`tier-${list.id}`}
						>
							<span className="flex items-center gap-2">
								<Icon
									className="size-4 shrink-0 text-primary/70"
									icon="lucide:layout-list"
								/>
								<span className="truncate font-semibold text-sm">
									{list.title}
								</span>
								<span className="ml-auto shrink-0 text-[11px] text-foreground">
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
