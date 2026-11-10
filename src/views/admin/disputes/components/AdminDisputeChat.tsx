'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatDate } from '@/lib/date'
import { adminDisputeQueries } from '@/queries/admin/dispute.queries'
import { adminDisputeService } from '@/services/admin/dispute.service'
import type { AdminDisputeMessage } from '@/types/admin.type'
import type { CommissionFile } from '@/types/commission.type'
import { ChatMessage } from '@/views/commissions/components/ChatMessage'
import {
	Area,
	Feedback,
	FilePicker,
} from '@/views/commissions/components/shared'

export function AdminDisputeChat({
	caseId,
	user,
	canWrite,
	downloadFile,
}: {
	caseId: string
	user: number
	canWrite: boolean
	downloadFile: (file: CommissionFile) => Promise<void>
}) {
	const t = useTranslations('commissions')
	const client = useQueryClient()
	const [messages, setMessages] = useState<AdminDisputeMessage[]>([])
	const [hasOlder, setHasOlder] = useState(false)
	const [loadingOlder, setLoadingOlder] = useState(false)
	const [content, setContent] = useState('')
	const [files, setFiles] = useState<CommissionFile[]>([])
	const [busy, setBusy] = useState(false)
	const initial = useQuery(adminDisputeQueries.messages(caseId))
	const last = messages.at(-1)?.id ?? 0
	const updates = useQuery(adminDisputeQueries.messagesAfter(caseId, last))
	const send = useMutation({
		mutationFn: async () => {
			const latest = await adminDisputeService.get(caseId)
			return adminDisputeService.command(caseId, {
				action: 'message',
				key: crypto.randomUUID(),
				version: latest.version,
				content,
				file_ids: files.map((file) => file.id),
			})
		},
		onSuccess: async () => {
			setContent('')
			setFiles([])
			await client.invalidateQueries({
				queryKey: ['admin', 'dispute', caseId],
			})
			await client.invalidateQueries({
				queryKey: ['admin', 'dispute', caseId, 'messages'],
			})
			void client.invalidateQueries({ queryKey: ['admin', 'disputes'] })
		},
	})

	useEffect(() => {
		if (!initial.data) return
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
	}, [initial.data])

	useEffect(() => {
		if (!updates.data?.data.length) return
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
				<Feedback error={initial.error || updates.error} />
			</div>
			<div className="flex max-h-[62vh] min-h-80 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-4">
				{hasOlder && (
					<Button
						className="mx-auto w-fit"
						loading={loadingOlder}
						onClick={async () => {
							setLoadingOlder(true)
							try {
								const page = await adminDisputeService.messages(
									caseId,
									{ before: messages[0].id }
								)
								setMessages((old) => [...page.data, ...old])
								setHasOlder(page.has_more)
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
				{messages.map((message) => (
					<div className="flex flex-col gap-2" key={message.id}>
						<div className="flex items-center gap-3">
							<span className="text-[11px] text-muted-foreground">
								{formatDate(message.created_at)}
							</span>
						</div>
						<ChatMessage
							downloadFile={downloadFile}
							message={message}
							showAuthorBadge={false}
							user={user}
						/>
					</div>
				))}
			</div>
			{canWrite && (
				<div className="flex flex-col gap-2 border-primary/20 border-t px-4 pt-3 pb-4">
					<Area
						label={t('comment')}
						onChange={setContent}
						value={content}
					/>
					<FilePicker
						files={files}
						onBusy={setBusy}
						onChange={setFiles}
					/>
					<Feedback error={send.error} />
					<Button
						className="w-fit"
						disabled={
							busy ||
							send.isPending ||
							(!content.trim() && !files.length)
						}
						loading={send.isPending}
						onClick={() => send.mutate()}
					>
						{t('send')}
					</Button>
				</div>
			)}
		</Card.Root>
	)
}
