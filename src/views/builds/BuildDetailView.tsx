'use client'

import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { ShareButton } from '@/components/ui/ShareButton'
import { getQueryClient } from '@/providers/QueryProvider'
import { buildApiQueries } from '@/queries/build-api/build-api.queries'
import { buildApiService } from '@/services/build-api/build-api.service'
import { useAuthStore } from '@/stores/useAuth.store'
import { ActionMenu } from '@/views/feed/ActionMenu'
import {
	ContentDetailHeader,
	DetailShell,
	DetailStat,
} from '@/views/feed/ContentDetail'
import { BuildPreview } from '@/views/feed/ContentPreviews'
import { FeedComments } from '@/views/feed/FeedComments'
import { HideFeedMenuItem } from '@/views/feed/HideFeed'

export default function BuildDetailView({ id }: { id: string }) {
	const t = useTranslations()
	const { data: build } = useSuspenseQuery(buildApiQueries.get(id))
	const user = useAuthStore((s) => s.user)
	const queryClient = getQueryClient()
	const starMutation = useMutation({
		mutationFn: () =>
			build.is_starred
				? buildApiService.unstar(id)
				: buildApiService.star(id),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ['build', id] }),
	})
	const isOwner = user?.id === build.author?.id

	return (
		<DetailShell>
			<ContentDetailHeader
				actions={
					<>
						<ShareButton
							title={build.title}
							url={`/builds/${id}`}
						/>
						{isOwner && (
							<ActionMenu label={t('post.actions')}>
								<HideFeedMenuItem
									hidden={build.hidden_from_feed}
									id={id}
									type="build"
								/>
							</ActionMenu>
						)}
					</>
				}
				author={build.author}
				createdAt={build.created_at}
				stats={
					<>
						{user ? (
							<DetailStat
								active={build.is_starred}
								disabled={starMutation.isPending}
								icon="lucide:star"
								onClick={() => starMutation.mutate()}
								value={build.stars_count}
							/>
						) : (
							<DetailStat
								icon="lucide:star"
								value={build.stars_count}
							/>
						)}
						<DetailStat icon="lucide:eye" value={build.views} />
						<DetailStat
							icon="lucide:message-square"
							value={build.comments_count ?? 0}
						/>
						{build.tags.length > 0 && (
							<div className="flex flex-wrap items-center gap-1.5">
								{build.tags.map((tag) => (
									<span
										className="bg-border-secondary rounded-md px-2 py-0.5 text-xs"
										key={tag}
									>
										{tag}
									</span>
								))}
							</div>
						)}
					</>
				}
				title={build.title}
			/>

			<article className="flex flex-col gap-4">
				<div className="border-primary/20 bg-muted/20 rounded-2xl border p-4">
					<BuildPreview build={build} />
				</div>
			</article>

			<div className="border-primary/25 border-t pt-6">
				<FeedComments id={id} target="build" />
			</div>
		</DetailShell>
	)
}
