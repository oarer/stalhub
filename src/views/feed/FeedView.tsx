'use client'

import { Icon } from '@iconify/react'
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { ShareButton } from '@/components/ui/ShareButton'
import { Skeleton } from '@/components/ui/Skeleton'
import Avatar from '@/components/ui/user/Avatar'
import { Gallery } from '@/components/wiki/gallery'
import { resolveImageUrl } from '@/lib/imageUrl'
import { getQueryClient } from '@/providers/QueryProvider'
import { feedQueries } from '@/queries/feed/feed.queries'
import { artService } from '@/services/art/art.service'
import { buildApiService } from '@/services/build-api/build-api.service'
import { postService } from '@/services/post/post.service'
import { tierListService } from '@/services/tier-list/tier-list.service'
import { useAuthStore } from '@/stores/useAuth.store'
import type { FeedContentType, FeedItem, FeedSort } from '@/types/feed.type'
import { FEED_CONTENT_TYPES } from '@/types/feed.type'
import { ActionMenu } from './ActionMenu'
import { BuildPreview, TierListPreview } from './ContentPreviews'
import { FeedComments } from './FeedComments'
import { FeedFilters } from './FeedFilters'
import { FeedRowHeader } from './FeedRowHeader'
import { HideFeedMenuItem } from './HideFeed'
import { MarkdownContent } from './MarkdownContent'
import { PostAttachments } from './PostAttachments'
import { PostFormModal } from './PostFormModal'
import { PostOwnerMenu } from './PostOwnerMenu'
import { PostPoll } from './PostPoll'
import { QuotedPost } from './QuotedPost'
import { RepostModal } from './RepostModal'

const PAGE_SIZE = 20

export default function FeedView() {
	const t = useTranslations()
	const user = useAuthStore((s) => s.user)
	const queryClient = getQueryClient()
	const [types, setTypes] = useState<FeedContentType[]>([
		...FEED_CONTENT_TYPES,
	])
	const [categoryIds, setCategoryIds] = useState<number[]>([])
	const [sort, setSort] = useState<FeedSort>('new')
	const { data: categoriesData } = useQuery(feedQueries.categories())
	const categories = categoriesData?.categories ?? []
	const [expanded, setExpanded] = useState<string | null>(null)
	const sentinelRef = useRef<HTMLDivElement>(null)
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useInfiniteQuery({
		...feedQueries.list({
			types,
			categories: categoryIds,
			sort,
			take: PAGE_SIZE,
		}),
		enabled: types.length > 0,
	})

	const toggleType = (value: FeedContentType, checked: boolean) => {
		setExpanded(null)
		setTypes((previous) => {
			const next = checked
				? [...previous, value]
				: previous.filter((type) => type !== value)
			return FEED_CONTENT_TYPES.filter((type) => next.includes(type))
		})
	}

	const toggleCategories = (ids: number[]) => {
		setExpanded(null)
		setCategoryIds(ids)
	}

	useEffect(() => {
		const sentinel = sentinelRef.current
		if (!sentinel || !hasNextPage) return
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && !isFetchingNextPage) {
					void fetchNextPage()
				}
			},
			{ rootMargin: '320px' }
		)
		observer.observe(sentinel)
		return () => observer.disconnect()
	}, [fetchNextPage, hasNextPage, isFetchingNextPage])

	const items = data?.pages.flatMap((page) => page.data) ?? []

	return (
		<section className="mx-auto max-w-380 px-4 pt-32 pb-12 md:px-8 xl:pt-36">
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
				<FeedFilters
					categories={categories}
					categoryIds={categoryIds}
					onCategoriesChange={toggleCategories}
					onSortChange={setSort}
					onTypeChange={toggleType}
					sort={sort}
					types={types}
				/>
				<div className="flex min-w-0 flex-col gap-5">
					<header className="flex flex-col gap-4">
						<h1
							className={`${mtsExtended.className} text-primary text-4xl font-semibold`}
						>
							{t('feed.title')}
						</h1>
						{user ? (
							<PostFormModal
								avatar={
									<Avatar
										className="size-11"
										height={44}
										id={user.id}
										username={user.username}
										width={44}
									/>
								}
								inline
							/>
						) : (
							<Link
								className="border-primary/20 bg-card/40 hover:border-primary/50 hover:bg-card flex items-center gap-3 rounded-2xl border p-4 transition-colors"
								href="/auth"
							>
								<span className="bg-muted flex size-11 shrink-0 items-center justify-center rounded-full">
									<Icon
										className="text-primary/70 size-5"
										icon="lucide:pen-line"
									/>
								</span>
								<span className="text-muted-foreground min-w-0 flex-1 truncate text-sm">
									{t('feed.composer.login')}
								</span>
								<span className="text-primary shrink-0 text-sm font-medium">
									{t('auth.login')}
								</span>
							</Link>
						)}
					</header>

					{types.length === 0 ? (
						<div className="flex flex-col items-center gap-3 py-16 text-center">
							<Icon
								className="text-foreground size-10"
								icon="lucide:list-filter"
							/>
							<p className="text-foreground text-sm font-medium">
								{t('feed.noTypes')}
							</p>
						</div>
					) : isLoading ? (
						<div className="flex flex-col">
							{Array.from({ length: 8 }).map((_, index) => (
								<div
									className="border-primary/15 flex gap-3 border-b px-2 py-4"
									key={index}
								>
									<Skeleton className="size-10 rounded-full" />
									<div className="flex flex-1 flex-col gap-2">
										<Skeleton className="h-4 w-1/3" />
										<Skeleton className="h-3 w-full" />
										<Skeleton className="h-3 w-2/3" />
									</div>
								</div>
							))}
						</div>
					) : isError ? (
						<div className="flex flex-col items-center gap-3 py-16 text-center">
							<Icon
								className="text-foreground size-10"
								icon="lucide:cloud-off"
							/>
							<p className="text-foreground text-sm font-medium">
								{t('feed.error')}
							</p>
						</div>
					) : items.length === 0 ? (
						<div className="flex flex-col items-center gap-3 py-16 text-center">
							<Icon
								className="text-foreground size-10"
								icon="lucide:radio-tower"
							/>
							<p className="text-foreground text-sm font-medium">
								{t('feed.empty')}
							</p>
						</div>
					) : (
						<div className="flex flex-col">
							{items.map((item) => (
								<FeedCard
									expanded={expanded === itemKey(item)}
									item={item}
									key={itemKey(item)}
									onComments={() =>
										setExpanded((value) =>
											value === itemKey(item)
												? null
												: itemKey(item)
										)
									}
									queryClient={queryClient}
									user={user}
								/>
							))}
							<div className="h-2" ref={sentinelRef} />
							{isFetchingNextPage && (
								<div className="flex gap-3 px-2 py-4">
									<Skeleton className="size-10 rounded-full" />
									<div className="flex flex-1 flex-col gap-2">
										<Skeleton className="h-4 w-1/3" />
										<Skeleton className="h-3 w-full" />
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</section>
	)
}

function itemKey(item: FeedItem): string {
	const content = item.post ?? item.art ?? item.build ?? item.tier_list
	return `${item.type}-${content?.external_id ?? content?.id}-${item.post?.external_id}`
}

interface FeedCardProps {
	item: FeedItem
	expanded: boolean
	onComments: () => void
	user: ReturnType<typeof useAuthStore.getState>['user']
	queryClient: ReturnType<typeof getQueryClient>
}

function FeedCard(props: FeedCardProps) {
	if (props.item.type === 'post') return <PostCard {...props} />
	if (props.item.type === 'art') return <ArtCard {...props} />
	return <BuildOrTierListCard {...props} />
}

function FeedRow({
	avatar,
	header,
	children,
	menu,
}: {
	avatar: React.ReactNode
	header?: React.ReactNode
	children: React.ReactNode
	menu?: React.ReactNode
}) {
	return (
		<article className="group/post border-primary/10 hover:bg-card flex gap-4 border-b px-4 py-5 transition-all">
			<div className="flex w-10 shrink-0 flex-col items-center gap-1">
				{avatar}
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-2.5">
				{(header || menu) && (
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0 flex-1">{header}</div>
						{menu && (
							<div className="shrink-0 opacity-0 transition-opacity group-hover/post:opacity-100 has-focus-visible:opacity-100">
								{menu}
							</div>
						)}
					</div>
				)}
				{children}
			</div>
		</article>
	)
}

function PostCard({
	item,
	expanded,
	onComments,
	user,
	queryClient,
}: FeedCardProps) {
	const t = useTranslations()
	const post = item.post
	const starMutation = useMutation({
		mutationFn: () => {
			if (!post) return Promise.resolve()
			return item.is_starred
				? postService.unstar(post.external_id)
				: postService.star(post.external_id)
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
	})
	if (!post) return null
	const href = `/posts/${post.external_id}`
	const author = post.author
	const images = post.image_urls ?? []
	const displayName =
		author?.name?.trim() ||
		author?.username ||
		post.author_name ||
		t(`feed.sources.${post.source}`)
	const isOwner = Boolean(user?.id) && user?.id === author?.id

	return (
		<FeedRow
			avatar={
				author?.id != null ? (
					<Link className="shrink-0" href={`/users/${author.id}`}>
						<Avatar
							height={40}
							id={author.id}
							username={author.username}
							width={40}
						/>
					</Link>
				) : post.source_avatar_url ? (
					<img
						alt=""
						className="bg-muted size-10 shrink-0 rounded-full object-cover"
						src={post.source_avatar_url}
					/>
				) : (
					<div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full">
						<Icon
							className="text-primary/70 size-5"
							icon="lucide:radio-tower"
						/>
					</div>
				)
			}
			header={
				<FeedRowHeader
					author={author}
					createdAt={post.created_at}
					editedBy={post.edited_by}
					fallbackName={
						post.author_name?.trim() ||
						t(`feed.sources.${post.source}`)
					}
					sourceUrl={post.source_url}
				/>
			}
			menu={
				isOwner || post.can_manage ? (
					<PostOwnerMenu
						onDeleted={() =>
							queryClient.invalidateQueries({
								queryKey: ['feed'],
							})
						}
						post={post}
					/>
				) : null
			}
		>
			{post.title && (
				<Link href={href}>
					<h2 className="text-sm font-semibold sm:text-base">
						{post.title}
					</h2>
				</Link>
			)}
			<Link className="block" href={href}>
				<MarkdownContent compact content={post.content} />
			</Link>
			{images.length > 0 && <PostImageGallery images={images} />}
			{post.poll && (
				<PostPoll poll={post.poll} postId={post.external_id} />
			)}
			{post.repost_of && <QuotedPost repost={post.repost_of} />}
			<PostAttachments
				builds={post.attached_builds}
				tierLists={post.attached_tier_lists}
			/>
			<FeedActions
				commentsCount={item.comments_count}
				expanded={expanded}
				isPending={starMutation.isPending}
				isStarred={item.is_starred}
				onComments={onComments}
				onRepost={
					user ? (
						<RepostModal
							post={post}
							trigger={
								<Button
									className="p-2.5 text-sm"
									variant={'secondary'}
								>
									<Icon
										className="size-5"
										icon="lucide:repeat-2"
									/>
									<Count value={null} />
								</Button>
							}
						/>
					) : null
				}
				onStar={() => starMutation.mutate()}
				starsCount={item.stars_count}
				title={post.title ?? t('post.untitled')}
				url={href}
				user={user}
			/>
			{expanded && (
				<div className="border-primary/20 mt-2 border-t pt-4">
					<FeedComments id={post.external_id} target="post" />
				</div>
			)}
		</FeedRow>
	)
}

function Count({ value }: { value: number | null }) {
	if (value == null) return null
	return <span className="font-mono text-xs">{value}</span>
}

function PostImageGallery({ images }: { images: string[] }) {
	return (
		<Gallery
			className="my-1 max-w-xl"
			images={images}
			resolveUrl={resolveImageUrl}
		/>
	)
}

function ArtCard({
	item,
	expanded,
	onComments,
	user,
	queryClient,
}: FeedCardProps) {
	const t = useTranslations()
	const art = item.art
	const starMutation = useMutation({
		mutationFn: () => {
			if (!art) return Promise.resolve()
			return item.is_starred
				? artService.unstar(art.id)
				: artService.star(art.id)
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
	})
	if (!art) return null
	const href = `/arts/${art.id}`
	const image = resolveImageUrl(art.image_url ?? art.image_urls[0])
	const displayName =
		art.author?.name?.trim() || art.author?.username || 'Stalhub'

	return (
		<FeedRow
			avatar={
				art.author?.id != null ? (
					<Link className="shrink-0" href={`/users/${art.author.id}`}>
						<Avatar
							height={40}
							id={art.author.id}
							username={art.author.username}
							width={40}
						/>
					</Link>
				) : (
					<div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full">
						<Icon
							className="text-primary/70 size-5"
							icon="lucide:palette"
						/>
					</div>
				)
			}
			header={
				<FeedRowHeader
					author={art.author}
					createdAt={art.created_at}
					fallbackName={displayName}
				/>
			}
		>
			<Link className="group block" href={href}>
				{image ? (
					<div className="border-primary/10 bg-muted relative mt-2 aspect-video overflow-hidden rounded-xl border shadow-sm transition-shadow group-hover:shadow-md">
						<Image
							alt={art.title || t('feed.artUntitled')}
							className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
							fill
							sizes="(max-width: 768px) 100vw, 900px"
							src={image}
							unoptimized
						/>
					</div>
				) : (
					<div className="border-primary/10 bg-muted mt-2 flex aspect-video items-center justify-center rounded-xl border">
						<Icon
							className="text-primary/50 size-10"
							icon="lucide:image-off"
						/>
					</div>
				)}
				{art.title && (
					<h2 className="mt-2.5 text-base leading-snug font-semibold">
						{art.title}
					</h2>
				)}
				{art.description && (
					<p className="text-foreground/80 mt-0.5 line-clamp-2 text-sm leading-relaxed">
						{art.description}
					</p>
				)}
			</Link>
			<FeedActions
				commentsCount={item.comments_count}
				expanded={expanded}
				isPending={starMutation.isPending}
				isStarred={item.is_starred}
				onComments={onComments}
				onStar={() => starMutation.mutate()}
				starsCount={item.stars_count}
				title={art.title || t('feed.artUntitled')}
				url={href}
				user={user}
			/>
			{expanded && (
				<div className="border-primary/20 mt-2 border-t pt-4">
					<FeedComments id={art.id} target="art" />
				</div>
			)}
		</FeedRow>
	)
}

function BuildOrTierListCard({
	item,
	expanded,
	onComments,
	user,
	queryClient,
}: FeedCardProps) {
	const t = useTranslations()
	const isBuild = item.type === 'build'
	const content = isBuild ? item.build : item.tier_list
	const starMutation = useMutation({
		mutationFn: () => {
			if (!content) return Promise.resolve()
			if (isBuild) {
				return item.is_starred
					? buildApiService.unstar(String(content.id))
					: buildApiService.star(String(content.id))
			}
			return item.is_starred
				? tierListService.unstar(String(content.id))
				: tierListService.star(String(content.id))
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
	})
	if (!content) return null
	const href = isBuild
		? `/builds/${content.external_id ?? content.id}`
		: `/tierlists/${content.external_id ?? content.id}`
	const title = content.title
	const preview = isBuild
		? (item.build?.image_url ??
			item.build?.preview_image ??
			item.build?.screenshot_url)
		: (item.tier_list?.image_url ?? item.tier_list?.preview_image)
	const authorName =
		'author_name' in content
			? (content.author_name as string | null | undefined)
			: null
	const displayName =
		authorName?.trim() || content.author?.username || 'Stalhub'

	return (
		<FeedRow
			avatar={
				content.author?.id != null ? (
					<Link
						className="shrink-0"
						href={`/users/${content.author.id}`}
					>
						<Avatar
							height={40}
							id={content.author.id}
							username={content.author.username}
							width={40}
						/>
					</Link>
				) : (
					<div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full">
						<Icon
							className="text-primary/70 size-5"
							icon={
								isBuild ? 'lucide:boxes' : 'lucide:layout-list'
							}
						/>
					</div>
				)
			}
			header={
				<FeedRowHeader
					author={content.author}
					createdAt={content.created_at}
					fallbackName={displayName}
				/>
			}
			menu={
				Boolean(user?.id) && user?.id === content.author?.id ? (
					<ActionMenu label={t('post.actions')}>
						{(close) => (
							<HideFeedMenuItem
								hidden={
									isBuild
										? item.build?.hidden_from_feed
										: item.tier_list?.hidden_from_feed
								}
								id={String(content.id)}
								onDone={close}
								type={isBuild ? 'build' : 'tier_list'}
							/>
						)}
					</ActionMenu>
				) : null
			}
		>
			<Link className="group block" href={href}>
				{preview ? (
					<div className="border-primary/10 bg-muted relative mt-2 aspect-video overflow-hidden rounded-xl border shadow-sm transition-shadow group-hover:shadow-md">
						<Image
							alt={title}
							className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
							fill
							sizes="(max-width: 768px) 100vw, 900px"
							src={preview}
							unoptimized
						/>
					</div>
				) : isBuild && item.build ? (
					<div className="border-primary/10 bg-muted/30 group-hover:border-primary/20 group-hover:bg-muted/40 mt-2 rounded-xl border p-4 shadow-sm transition-all">
						<BuildPreview build={item.build} compact />
					</div>
				) : item.tier_list ? (
					<div className="border-primary/10 bg-muted/30 group-hover:border-primary/20 group-hover:bg-muted/40 mt-2 rounded-xl border p-4 shadow-sm transition-all">
						<TierListPreview
							compact
							entries={item.tier_list.entries}
							itemKind={item.tier_list.item_kind}
						/>
					</div>
				) : (
					<div className="border-primary/10 from-primary/5 via-card to-muted mt-2 flex aspect-video items-center justify-center rounded-xl border bg-linear-to-br">
						<Icon
							className="text-primary/50 size-10"
							icon={
								isBuild ? 'lucide:boxes' : 'lucide:layout-list'
							}
						/>
					</div>
				)}
				<h2 className="mt-2.5 text-base leading-snug font-semibold">
					{title}
				</h2>
				{!isBuild && content.description && (
					<p className="text-foreground/80 mt-0.5 line-clamp-2 text-sm leading-relaxed">
						{content.description}
					</p>
				)}
			</Link>
			<FeedActions
				commentsCount={item.comments_count}
				expanded={expanded}
				isPending={starMutation.isPending}
				isStarred={item.is_starred}
				onComments={onComments}
				onStar={() => starMutation.mutate()}
				starsCount={item.stars_count}
				title={title}
				url={href}
				user={user}
			/>
			{expanded && (
				<div className="border-primary/20 mt-2 border-t pt-4">
					<FeedComments id={String(content.id)} target={item.type} />
				</div>
			)}
		</FeedRow>
	)
}

function FeedActions({
	commentsCount,
	expanded,
	isPending,
	isStarred,
	onComments,
	onStar,
	onRepost,
	starsCount,
	title,
	url,
	user,
}: {
	commentsCount: number
	expanded: boolean
	isPending: boolean
	isStarred: boolean
	onComments: () => void
	onStar: () => void
	onRepost?: React.ReactNode | null
	starsCount: number
	title: string
	url: string
	user: ReturnType<typeof useAuthStore.getState>['user']
}) {
	return (
		<div className="mt-2 flex w-full items-center justify-between gap-2">
			<Button
				className="flex items-center gap-1.5 px-3 py-2 text-sm"
				onClick={onComments}
				type="button"
				variant={'secondary'}
			>
				<Icon className="size-4" icon="lucide:message-square" />
				<Count value={commentsCount || null} />
			</Button>
			{onRepost}
			{user ? (
				<Button
					className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${isStarred ? 'text-red-400 hover:text-red-500' : 'hover:text-red-400'}`}
					disabled={isPending}
					onClick={onStar}
					variant={'secondary'}
				>
					<Icon
						className="size-4"
						icon={
							isStarred ? 'lucide:heart-filled' : 'lucide:heart'
						}
					/>
					<Count value={starsCount || null} />
				</Button>
			) : (
				<span className="text-foreground flex items-center gap-1.5 px-3 py-2 text-sm">
					<Icon className="size-4" icon="lucide:heart" />
					<Count value={starsCount || null} />
				</span>
			)}
			<ShareButton title={title} url={url} />
		</div>
	)
}
