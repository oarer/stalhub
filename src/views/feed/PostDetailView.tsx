'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ShareButton } from '@/components/ui/ShareButton'
import { resolveImageUrl } from '@/lib/imageUrl'
import { getQueryClient } from '@/providers/QueryProvider'
import { postQueries } from '@/queries/post/post.queries'
import { postService } from '@/services/post/post.service'
import { useAuthStore } from '@/stores/useAuth.store'
import { ContentDetailHeader, DetailShell, DetailStat } from './ContentDetail'
import { FeedComments } from './FeedComments'
import { MarkdownContent } from './MarkdownContent'
import { PostAttachments } from './PostAttachments'
import { PostOwnerMenu } from './PostOwnerMenu'
import { PostPoll } from './PostPoll'
import { QuotedPost } from './QuotedPost'
import { RepostModal } from './RepostModal'

function ImagePreview({ url }: { url: string }) {
	return (
		<Image
			alt=""
			className="max-h-100 w-full rounded-lg object-contain"
			height={600}
			src={resolveImageUrl(url) ?? url}
			unoptimized
			width={900}
		/>
	)
}

export default function PostDetailView({ id }: { id: string }) {
	const t = useTranslations()
	const router = useRouter()
	const user = useAuthStore((s) => s.user)
	const queryClient = getQueryClient()
	const { data: post } = useSuspenseQuery(postQueries.get(id))
	const starMutation = useMutation({
		mutationFn: () =>
			post.is_starred ? postService.unstar(id) : postService.star(id),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ['post', id] }),
	})

	const isOwner = Boolean(user?.id) && user?.id === post.author?.id
	const canManage = isOwner || Boolean(post.can_manage)

	return (
		<DetailShell>
			<ContentDetailHeader
				actions={
					<>
						<ShareButton
							title={post.title ?? t('post.untitled')}
							url={`/posts/${post.external_id}`}
						/>
						{user && (
							<RepostModal
								post={post}
								trigger={
									<button
										aria-label={t('post.repost.action')}
										className="flex cursor-pointer items-center justify-center rounded-lg bg-secondary p-2.5 text-secondary-foreground transition-all duration-300 hover:brightness-110"
										type="button"
									>
										<Icon
											className="size-5"
											icon="lucide:repeat-2"
										/>
									</button>
								}
							/>
						)}
						{canManage && (
							<PostOwnerMenu
								onDeleted={() => router.push('/feed')}
								post={post}
							/>
						)}
					</>
				}
				author={post.author}
				authorAvatarUrl={post.source_avatar_url}
				authorFallback={
					post.author_name?.trim() || t(`feed.sources.${post.source}`)
				}
				createdAt={post.created_at}
				editedBy={post.edited_by}
				sourceUrl={post.source_url}
				stats={
					<>
						{user ? (
							<DetailStat
								active={post.is_starred}
								disabled={starMutation.isPending}
								icon="lucide:star"
								onClick={() => starMutation.mutate()}
								value={post.stars_count}
							/>
						) : (
							<DetailStat
								icon="lucide:star"
								value={post.stars_count}
							/>
						)}
						<DetailStat
							icon="lucide:message-square"
							value={post.comments_count ?? 0}
						/>
					</>
				}
				title={post.title || t('post.untitled')}
			/>

			<article className="flex flex-col gap-4">
				<MarkdownContent content={post.content} />
				{post.image_urls?.length > 0 && (
					<div className="grid grid-cols-2 gap-2">
						{post.image_urls.map((url) => (
							<ImagePreview key={url} url={url} />
						))}
					</div>
				)}
				{post.poll && (
					<PostPoll poll={post.poll} postId={post.external_id} />
				)}
				{post.repost_of && <QuotedPost repost={post.repost_of} />}
				<PostAttachments
					builds={post.attached_builds}
					tierLists={post.attached_tier_lists}
				/>
			</article>

			<div className="border-primary/25 border-t pt-6">
				<FeedComments id={post.external_id} target="post" />
			</div>
		</DetailShell>
	)
}
