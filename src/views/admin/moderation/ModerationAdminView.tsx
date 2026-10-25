'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Tabs } from '@/components/ui/Tabs'
import { toast } from '@/components/ui/Toast'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/date'
import { getQueryClient } from '@/providers/QueryProvider'
import { adminModerationQueries } from '@/queries/admin/moderation.queries'
import { adminModerationService } from '@/services/admin/moderation.service'

const ARTICLE_STATUSES = ['PENDING', 'REVIEW', 'APPROVED', 'DENIED', 'BANNED']

const TABS: {
	key: 'articles' | 'autoBans' | 'multiaccounts' | 'comments'
	icon: string
}[] = [
	{ key: 'articles', icon: 'lucide:book-check' },
	{ key: 'autoBans', icon: 'lucide:bot' },
	{ key: 'multiaccounts', icon: 'lucide:users-2' },
	{ key: 'comments', icon: 'lucide:message-square' },
]

const numberFmt = new Intl.NumberFormat()

export default function ModerationAdminView() {
	const t = useTranslations()
	const [tab, setTab] = useState<
		'articles' | 'autoBans' | 'multiaccounts' | 'comments'
	>('articles')

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="font-semibold text-2xl">
					{t('admin.moderation.title')}
				</h1>
			</div>

			<Tabs.Root
				onValueChange={(v) => setTab(v as typeof tab)}
				value={tab}
			>
				<Tabs.List className="justify-start">
					{TABS.map((item) => (
						<Tabs.Trigger key={item.key} value={item.key}>
							<Icon className="size-4" icon={item.icon} />
							{t(`admin.moderation.tabs.${item.key}`)}
						</Tabs.Trigger>
					))}
				</Tabs.List>
				<Tabs.Content value="articles">
					<ArticlesQueue />
				</Tabs.Content>
				<Tabs.Content value="autoBans">
					<AutoBans />
				</Tabs.Content>
				<Tabs.Content value="multiaccounts">
					<Multiaccounts />
				</Tabs.Content>
				<Tabs.Content value="comments">
					<Comments />
				</Tabs.Content>
			</Tabs.Root>
		</div>
	)
}

function ArticlesQueue() {
	const t = useTranslations()
	const [page, setPage] = useState(1)
	const [status, setStatus] = useState<string | undefined>(undefined)

	const { data } = useSuspenseQuery(
		adminModerationQueries.articleQueue({ page, status })
	)

	const mutation = {
		setPage: (next: number) => setPage(next),
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap gap-2">
				{ARTICLE_STATUSES.map((status_) => (
					<Button
						className={cn(
							'font-semibold text-xs',
							
						)}
						key={status_}
						onClick={() => {
							setStatus(status === status_ ? undefined : status_)
							mutation.setPage(1)
						}}
						size="sm"
						variant={status === status_ ? 'primary' : 'outline'}
					>
						{t(`admin.dashboard.status.${status_.toLowerCase()}`)}
					</Button>
				))}
			</div>

			<div className="flex flex-col gap-2">
				{data.data.map((article) => (
					<Card.Root
						className="flex-row flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3"
						key={article.id}
					>
						<div className="flex min-w-0 flex-col">
							<span className="truncate font-semibold text-sm">
								{article.title}
							</span>
							<span className="truncate text-muted-foreground text-xs">
								{article.author?.username ?? '—'}
								{' · '}
								{formatDate(article.created_at, 'date')}
								{article.views > 0 &&
									` · ${numberFmt.format(article.views)}`}
							</span>
						</div>
						<div className="ml-auto flex items-center gap-2">
							<Badge variant={'secondary'}>
								{t(
									`admin.dashboard.status.${article.status.toLowerCase()}`
								)}
							</Badge>
							<Link
								className="text-primary text-sm hover:underline"
								href={`/admin/articles/${article.id}/edit`}
							>
								{t('admin.moderation.open')}
							</Link>
						</div>
					</Card.Root>
				))}
				{data.data.length === 0 && (
					<p className="py-12 text-center text-muted-foreground text-sm">
						{t('admin.moderation.empty')}
					</p>
				)}
			</div>

			<Pagination
				onPageChange={mutation.setPage}
				page={data.page}
				totalPages={Math.ceil(data.total_count / data.take)}
			/>
		</div>
	)
}

function AutoBans() {
	const t = useTranslations()
	const [page, setPage] = useState(1)

	const { data } = useSuspenseQuery(adminModerationQueries.autoBans({ page }))

	const queryClient = getQueryClient()

	const clearMutation = useMutation({
		mutationFn: (user_id: number) =>
			adminModerationService.clearAutoBan(user_id),
		onSuccess: () => {
			toast.success(t('admin.moderation.autoBanCleared'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'moderation', 'autoBans'],
			})
		},
		onError: () => toast.error(t('admin.moderation.error')),
	})

	return (
		<div className="flex flex-col gap-4">
			<div className="rounded-xl bg-card px-4 py-3 text-muted-foreground text-sm shadow-sm">
				{t('admin.moderation.autoBansHint', {
					count: numberFmt.format(data.total_count),
				})}
			</div>

			<div className="flex flex-col gap-2">
				{data.data.map((entry) => (
					<Card.Root
						className="flex-row flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3"
						key={entry.id}
					>
						<div className="flex min-w-0 flex-col">
							<span className="truncate font-semibold text-sm">
								{entry.username}
								{entry.name && (
									<span className="ml-2 text-muted-foreground text-xs">
										{entry.name}
									</span>
								)}
							</span>
							<span className="truncate font-mono text-muted-foreground text-xs">
								#{entry.id} ·{' '}
								{formatDate(entry.joined_at, 'date')}
								{entry.discord_auth?.username &&
									` · ds:${entry.discord_auth.username}`}
								{entry.telegram_auth?.login &&
									` · tg:${entry.telegram_auth.login}`}
							</span>
						</div>
						<div className="ml-auto flex items-center gap-2">
							{entry.user_settings?.banned && (
								<Badge className="bg-rose-500/10 text-rose-400 ring-rose-500/50">
									{t('admin.dashboard.users.banned')}
								</Badge>
							)}
							{entry.user_settings?.auto_warned &&
								!entry.user_settings?.banned && (
									<Badge className="bg-amber-500/10 text-amber-400 ring-amber-500/50">
										{t('admin.moderation.autoWarned')}
									</Badge>
								)}
							<Button
								disabled={clearMutation.isPending}
								onClick={() => clearMutation.mutate(entry.id)}
								size="sm"
								variant="bordered"
							>
								<Icon
									className="size-4"
									icon="lucide:rotate-ccw"
								/>
								{t('admin.moderation.clearAutoBan')}
							</Button>
							<Link
								className="text-primary text-sm hover:underline"
								href={`/admin/users/${entry.id}`}
							>
								{t('admin.moderation.open')}
							</Link>
						</div>
					</Card.Root>
				))}
				{data.data.length === 0 && (
					<p className="py-12 text-center text-muted-foreground text-sm">
						{t('admin.moderation.autoBansEmpty')}
					</p>
				)}
			</div>

			<Pagination
				onPageChange={setPage}
				page={data.page}
				totalPages={Math.ceil(data.total_count / data.take)}
			/>
		</div>
	)
}

function Multiaccounts() {
	const t = useTranslations()
	const { data } = useSuspenseQuery(adminModerationQueries.multiaccounts(30))

	return (
		<div className="flex flex-col gap-3">
			<p className="text-muted-foreground text-sm">
				{t('admin.moderation.multiaccountsHint', {
					count: numberFmt.format(data.total_count),
				})}
			</p>
			<div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
				{data.data.map((group) => (
					<Card.Root key={group.ip !== '' ? group.ip : 'empty'}>
						<div className="flex items-center gap-2">
							<Icon
								className={cn(
									'size-4',
									group.banned_count > 0
										? 'text-rose-400'
										: 'text-amber-400'
								)}
								icon="lucide:network"
							/>
							<span className="font-mono font-semibold text-sm">
								{group.ip}
							</span>
							<span className="text-muted-foreground text-xs">
								×{group.accounts.length}
							</span>
						</div>
						<div className="flex flex-wrap gap-1.5">
							{group.accounts.map((account) => (
								<Link
									className={cn(
										'rounded-full px-2 py-0.5 font-semibold text-xs',
										account.banned
											? 'bg-rose-500/10 text-rose-400'
											: 'bg-muted text-card-foreground hover:text-primary'
									)}
									href={`/admin/users/${account.id}`}
									key={account.id}
									title={`${account.name || account.username} · ${formatDate(account.last_used_at, 'datetime')}`}
								>
									{account.username}
									{account.banned ? ' ✕' : ''}
								</Link>
							))}
						</div>
					</Card.Root>
				))}
				{data.data.length === 0 && (
					<p className="py-12 text-center text-muted-foreground text-sm">
						{t('admin.moderation.multiaccountsEmpty')}
					</p>
				)}
			</div>
		</div>
	)
}

function Comments() {
	const t = useTranslations()
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState('')
	const debounced = useDebounce(search)

	const { data } = useSuspenseQuery(adminModerationQueries.comments({ page }))

	const queryClient = getQueryClient()

	const deleteMutation = useMutation({
		mutationFn: (commentId: number) =>
			adminModerationService.deleteComment(commentId),
		onSuccess: () => {
			toast.success(t('admin.moderation.commentDeleted'))
			queryClient.invalidateQueries({
				queryKey: ['admin', 'moderation', 'comments'],
			})
		},
		onError: () => toast.error(t('admin.moderation.error')),
	})

	const filtered = debounced
		? data.data.filter(
				(c) =>
					c.content.toLowerCase().includes(debounced.toLowerCase()) ||
					c.author?.username
						.toLowerCase()
						.includes(debounced.toLowerCase())
			)
		: data.data

	return (
		<div className="flex flex-col gap-4">
			<Input
				className="w-full md:w-72"
				onChange={(e) => {
					setSearch(e.target.value)
					setPage(1)
				}}
				placeholder={t('admin.moderation.searchComments')}
				value={search}
			/>

			<div className="flex flex-col gap-2">
				{filtered.map((comment) => (
					<Card.Root
						className="flex-row flex-wrap items-start gap-x-4 gap-y-1 px-4 py-3"
						key={comment.id}
					>
						<div className="flex min-w-0 flex-1 flex-col">
							<span className="line-clamp-2 text-sm">
								{comment.content}
							</span>
							<span className="truncate text-muted-foreground text-xs">
								{comment.author?.username ?? '—'} ·{' '}
								{formatDate(comment.created_at, 'datetime')}
								{comment.article
									? ` · 📄 ${comment.article.title}`
									: comment.art
										? ` · 🎨 ${comment.art.title ?? ''}`
										: comment.profile_user
											? ` · 👤 ${comment.profile_user.username}`
											: ''}
							</span>
						</div>
						<Button
							className="shrink-0"
							onClick={() => deleteMutation.mutate(comment.id)}
							size="sm"
							variant="danger"
						>
							<Icon className="size-4" icon="lucide:trash-2" />
						</Button>
					</Card.Root>
				))}
				{filtered.length === 0 && (
					<p className="py-12 text-center text-muted-foreground text-sm">
						{t('admin.moderation.empty')}
					</p>
				)}
			</div>

			<Pagination
				onPageChange={setPage}
				page={data.page}
				totalPages={Math.ceil(data.total_count / data.take)}
			/>
		</div>
	)
}
