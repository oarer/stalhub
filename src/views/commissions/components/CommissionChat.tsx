'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import Input from '@/components/ui/Input'
import { formatDate } from '@/lib/date'
import { commissionService as api } from '@/services/commission/commission.service'
import type { CommissionFile, CommissionMessage } from '@/types/commission.type'
import { ChatMessage } from './ChatMessage'
import { commissionFileAccept, Feedback, useCommissionFiles } from './shared'

export default function CommissionChat({
	orderId,
	user,
	canRead = true,
	content,
	files,
	busy,
	sending,
	error,
	onContentChange,
	onFilesChange,
	onBusy,
	onSend,
}: {
	orderId: string
	user: number
	canRead?: boolean
	content: string
	files: CommissionFile[]
	busy: boolean
	sending: boolean
	error: unknown
	onContentChange: (value: string) => void
	onFilesChange: (files: CommissionFile[]) => void
	onBusy: (busy: boolean) => void
	onSend: () => void
}) {
	const t = useTranslations('commissions')
	const [messages, setMessages] = useState<CommissionMessage[]>([])
	const [hasOlder, setHasOlder] = useState(false)
	const [loadingOlder, setLoadingOlder] = useState(false)
	const [readError, setReadError] = useState<unknown>()
	const [bottom, setBottom] = useState(true)
	const [visible, setVisible] = useState(true)
	const viewport = useRef<HTMLDivElement>(null)
	const lastRead = useRef(0)
	const bottomRef = useRef(true)
	const uploads = useCommissionFiles({
		files,
		onChange: onFilesChange,
		onBusy,
	})
	const [thumbs, setThumbs] = useState<Record<string, string>>({})

	useEffect(() => {
		let cancelled = false
		const created: string[] = []
		void (async () => {
			const next: Record<string, string> = {}
			for (const file of files.filter((f) =>
				f.mime.startsWith('image/')
			)) {
				try {
					const url = await api.fileUrl(file)
					created.push(url)
					next[file.id] = url
				} catch {
					// ignore preview errors
				}
			}
			if (!cancelled) setThumbs(next)
		})()
		return () => {
			cancelled = true
			for (const url of created) URL.revokeObjectURL(url)
		}
	}, [files])
	const initial = useQuery({
		queryKey: ['commissions', user, 'messages', orderId],
		queryFn: () => api.messages(orderId),
	})
	const last = messages.at(-1)?.id ?? 0
	const updates = useQuery({
		queryKey: ['commissions', user, 'messages-after', orderId, last],
		queryFn: () => api.messages(orderId, { after: last }),
		enabled: !!last && visible,
		refetchInterval: 3000,
		refetchIntervalInBackground: false,
		retry: 1,
	})
	useEffect(() => {
		const changed = () => setVisible(!document.hidden)
		changed()
		document.addEventListener('visibilitychange', changed)
		return () => document.removeEventListener('visibilitychange', changed)
	}, [])
	useEffect(() => {
		if (initial.data) {
			setMessages((old) =>
				[
					...new Map(
						[...old, ...initial.data.data].map((message) => [
							message.id,
							message,
						])
					).values(),
				].sort((a, b) => a.id - b.id)
			)
			setHasOlder(initial.data.has_more)
		}
	}, [initial.data])
	useEffect(() => {
		if (updates.data?.data.length)
			setMessages((old) =>
				[
					...new Map(
						[...old, ...updates.data.data].map((message) => [
							message.id,
							message,
						])
					).values(),
				].sort((a, b) => a.id - b.id)
			)
	}, [updates.data])
	useEffect(() => {
		if (!visible || !last) return
		if (bottomRef.current)
			viewport.current?.scrollTo({ top: viewport.current.scrollHeight })
		if (canRead && last > lastRead.current) {
			lastRead.current = last
			void api.read(orderId, last).catch((error) => {
				lastRead.current = 0
				setReadError(error)
			})
		}
	}, [last, visible, orderId, canRead])
	const groups = useMemo(() => {
		const list: { date: string; items: CommissionMessage[] }[] = []
		for (const message of messages) {
			const date = new Date(message.created_at).toDateString()
			const tail = list.at(-1)
			if (tail?.date === date) tail.items.push(message)
			else list.push({ date, items: [message] })
		}
		return list
	}, [messages])
	return (
		<Card.Root className="min-w-0 gap-0 overflow-hidden">
			<div className="flex items-center gap-2 px-4 pt-4">
				<Icon
					className="text-muted-foreground text-xl"
					icon="lucide:messages-square"
				/>
				<h2 className="font-semibold text-xl">{t('chat')}</h2>
			</div>
			<div className="px-4 pt-3">
				<Feedback error={readError || initial.error || updates.error} />
			</div>
			<div
				className="flex max-h-[62vh] min-h-80 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-4"
				onScroll={() => {
					const el = viewport.current
					if (!el) return
					const nearBottom =
						el.scrollHeight - el.scrollTop - el.clientHeight < 80
					bottomRef.current = nearBottom
					setBottom(nearBottom)
				}}
				ref={viewport}
			>
				{hasOlder && (
					<Button
						className="mx-auto w-fit"
						loading={loadingOlder}
						onClick={async () => {
							setLoadingOlder(true)
							try {
								const page = await api.messages(orderId, {
									before: messages[0].id,
								})
								setMessages((old) => [...page.data, ...old])
								setHasOlder(page.has_more)
							} catch (error) {
								setReadError(error)
							} finally {
								setLoadingOlder(false)
							}
						}}
						size="sm"
						variant="ghost"
					>
						{t('older')}
					</Button>
				)}
				{initial.isPending && !messages.length && (
					<div className="flex flex-col gap-3 py-4">
						{[0, 1, 2].map((index) => (
							<div
								className={`flex ${index % 2 ? 'justify-end' : 'justify-start'}`}
								key={index}
							>
								<div
									className={`h-10 w-2/3 animate-pulse rounded-2xl ${index % 2 ? 'bg-primary/20' : 'bg-muted'}`}
								/>
							</div>
						))}
					</div>
				)}
				{!messages.length && initial.isSuccess && (
					<div className="flex flex-col items-center gap-2 py-12 text-center">
						<Icon
							className="text-3xl text-muted-foreground"
							icon="lucide:message-circle"
						/>
						<p className="text-muted-foreground text-sm">
							{t('empty')}
						</p>
					</div>
				)}
				{groups.map((group) => (
					<Fragment key={group.date}>
						<div className="flex items-center gap-3">
							<Divider className="flex-1" />
							<time className="text-[11px] text-muted-foreground">
								{formatDate(group.date, 'longDate')}
							</time>
							<Divider className="flex-1" />
						</div>
						{group.items.map((message) => (
							<ChatMessage
								key={message.id}
								message={message}
								user={user}
							/>
						))}
					</Fragment>
				))}
				{!bottom && updates.data?.data.length ? (
					<Button
						className="sticky bottom-2 z-10 mx-auto w-fit"
						onClick={() => {
							bottomRef.current = true
							setBottom(true)
							viewport.current?.scrollTo({
								top: viewport.current.scrollHeight,
							})
						}}
						size="sm"
						variant="secondary"
					>
						{t('newMessages')}
					</Button>
				) : null}
			</div>
			<div className="flex flex-col gap-2 px-4 pt-3 pb-4">
				{uploads.progress !== null && (
					<progress
						aria-label={t('addFiles')}
						className="h-1.5 w-full accent-primary"
						max={100}
						value={uploads.progress}
					/>
				)}
				{files.length > 0 && (
					<div className="flex flex-wrap gap-1.5">
						{files.map((file) => (
							<span
								className="flex items-center gap-1 rounded-full bg-muted py-0.5 pr-1 pl-1 text-muted-foreground text-xs"
								key={file.id}
							>
								{thumbs[file.id] ? (
									<img
										alt={file.name}
										className="size-6 rounded-full object-cover"
										src={thumbs[file.id]}
									/>
								) : (
									<Icon
										className="shrink-0 text-sm"
										icon={
											file.mime.startsWith('image/')
												? 'lucide:image'
												: 'lucide:file-text'
										}
									/>
								)}
								<span className="max-w-32 truncate">
									{file.name}
								</span>
								<button
									aria-label={t('remove')}
									className="cursor-pointer rounded-full p-0.5 transition-colors hover:text-foreground"
									disabled={uploads.progress !== null}
									onClick={() => void uploads.remove(file.id)}
									type="button"
								>
									<Icon className="text-sm" icon="lucide:x" />
								</button>
							</span>
						))}
					</div>
				)}
				<div className="flex items-center gap-1.5">
					<Button
						aria-label={t('addFiles')}
						className="p-2"
						disabled={busy || files.length >= 10}
						onClick={uploads.pick}
						size="sm"
						type="button"
						variant="ghost"
					>
						<Icon className="text-lg" icon="lucide:paperclip" />
					</Button>
					<input
						accept={commissionFileAccept}
						className="hidden"
						multiple
						onChange={(e) => void uploads.upload(e.target.files)}
						ref={uploads.inputRef}
						type="file"
					/>
					<Input
						aria-label={t('comment')}
						className="min-w-0"
						containerClass="min-w-0 flex-1"
						onChange={(e) => onContentChange(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault()
								if (!busy && (content.trim() || files.length))
									onSend()
							}
						}}
						placeholder={t('comment')}
						value={content}
					/>
					<Button
						aria-label={t('send')}
						className="p-2"
						disabled={busy || (!content.trim() && !files.length)}
						loading={sending}
						onClick={onSend}
						size="sm"
						type="button"
					>
						<Icon className="text-lg" icon="lucide:send" />
					</Button>
				</div>
				<Feedback error={uploads.error || error} />
			</div>
		</Card.Root>
	)
}
