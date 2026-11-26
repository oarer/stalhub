'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { effectiveAwardStatus } from '@/lib/awardStatus'
import {
	useCreateAwardCampaign,
	useUpdateAwardCampaign,
} from '@/queries/admin/awards.queries'
import type { AdminAwardCampaign } from '@/types/admin.type'

const nextStatus: Partial<
	Record<AdminAwardCampaign['status'], AdminAwardCampaign['status'][]>
> = {
	draft: ['voting'],
	voting: ['ended'],
	ended: ['voting'],
	published: [],
}

const localDate = (value: string | null) =>
	value ? new Date(value).toISOString().slice(0, 16) : ''

interface Props {
	campaigns: AdminAwardCampaign[]
	selectedId: string
	onSelect: (id: string) => void
}

export default function CampaignsTab({
	campaigns,
	selectedId,
	onSelect,
}: Props) {
	const t = useTranslations()
	const create = useCreateAwardCampaign()
	const update = useUpdateAwardCampaign()
	const [editing, setEditing] = useState<AdminAwardCampaign | null>(null)
	const [open, setOpen] = useState(false)
	const [year, setYear] = useState(new Date().getFullYear())
	const [title, setTitle] = useState('')
	const [endsAt, setEndsAt] = useState('')

	const startCreate = () => {
		setEditing(null)
		setYear(new Date().getFullYear())
		setTitle('')
		setEndsAt('')
		setOpen(true)
	}
	const startEdit = (campaign: AdminAwardCampaign) => {
		setEditing(campaign)
		setYear(campaign.year)
		setTitle(campaign.title)
		setEndsAt(localDate(campaign.ends_at))
		setOpen(true)
	}
	const save = () => {
		if (!year || !title.trim()) return
		const ends_at = endsAt ? new Date(endsAt).toISOString() : null
		if (editing)
			update.mutate(
				{
					id: editing.id,
					input: { title: title.trim(), ends_at },
				},
				{
					onSuccess: () => {
						setOpen(false)
						toast.success(t('admin.awards.saved'))
					},
				}
			)
		else
			create.mutate(
				{ year, title: title.trim(), ends_at },
				{
					onSuccess: () => {
						setOpen(false)
						toast.success(t('admin.awards.created'))
					},
				}
			)
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">
					{t('admin.awards.campaigns')}
				</h2>
				<Button onClick={startCreate}>
					{t('admin.awards.createCampaign')}
				</Button>
			</div>
			<Card.Root>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>
								{t('admin.awards.campaignYear')}
							</Table.Head>
							<Table.Head>
								{t('admin.awards.campaignTitle')}
							</Table.Head>
							<Table.Head>
								{t('admin.awards.campaignStatus')}
							</Table.Head>
							<Table.Head>{t('admin.awards.endsAt')}</Table.Head>
							<Table.Head />
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{campaigns.map((c) => {
							const locked = c.status === 'published'
							const status = effectiveAwardStatus(
								c.status,
								c.ends_at
							)
							return (
								<Table.Row
									className={
										c.id === selectedId
											? 'bg-primary/10 ring-primary/30 ring-1'
											: undefined
									}
									key={c.id}
								>
									<Table.Cell>{c.year}</Table.Cell>
									<Table.Cell>{c.title}</Table.Cell>
									<Table.Cell>
										{t(`awards.status.${status}`)}
									</Table.Cell>
									<Table.Cell>
										{c.ends_at
											? new Date(
													c.ends_at
												).toLocaleString()
											: '—'}
									</Table.Cell>
									<Table.Cell>
										<div className="flex flex-wrap gap-2">
											{!locked && (
												<Button
													onClick={() => startEdit(c)}
													size="sm"
													variant="outline"
												>
													{t('ui.edit')}
												</Button>
											)}
											{(nextStatus[c.status] ?? []).map(
												(status) => {
													const actionLabel =
														status === 'voting'
															? c.status ===
																'ended'
																? 'admin.awards.resumeVoting'
																: 'admin.awards.startVoting'
															: 'admin.awards.finishVoting'
													return (
														<Button
															disabled={
																update.isPending
															}
															key={status}
															onClick={() =>
																update.mutate(
																	{
																		id: c.id,
																		input: {
																			status,
																		},
																	},
																	{
																		onSuccess:
																			() =>
																				toast.success(
																					t(
																						'admin.awards.saved'
																					)
																				),
																	}
																)
															}
															size="sm"
															variant="bordered"
														>
															{t(actionLabel)}
														</Button>
													)
												}
											)}
											<Button
												onClick={() => onSelect(c.id)}
												size="sm"
												variant={
													c.id === selectedId
														? 'primary'
														: 'ghost'
												}
											>
												{t('admin.awards.select')}
											</Button>
										</div>
										{locked && (
											<p className="text-muted-foreground mt-1 text-xs">
												{t(
													'admin.awards.readOnlyAfterPublish'
												)}
											</p>
										)}
									</Table.Cell>
								</Table.Row>
							)
						})}
					</Table.Body>
				</Table.Root>
			</Card.Root>
			<Modal.Root onOpenChange={setOpen} open={open}>
				<Modal.Content className="max-w-xl" fullScreen={false}>
					<Modal.Header>
						<Modal.Title>
							{editing
								? t('admin.awards.editCampaign')
								: t('admin.awards.createCampaign')}
						</Modal.Title>
					</Modal.Header>
					<div className="flex flex-col gap-3">
						<Input
							disabled={!!editing}
							label={t('admin.awards.campaignYear')}
							onChange={(e) => setYear(Number(e.target.value))}
							type="number"
							value={String(year)}
						/>
						<Input
							label={t('admin.awards.campaignTitle')}
							onChange={(e) => setTitle(e.target.value)}
							value={title}
						/>
						<Input
							label={t('admin.awards.endsAt')}
							onChange={(e) => setEndsAt(e.target.value)}
							type="datetime-local"
							value={endsAt}
						/>
						<div className="flex justify-end gap-2">
							<Button
								onClick={() => setOpen(false)}
								variant="ghost"
							>
								{t('ui.cancel')}
							</Button>
							<Button
								disabled={!year || !title.trim()}
								loading={create.isPending || update.isPending}
								onClick={save}
							>
								{t('ui.save')}
							</Button>
						</div>
					</div>
				</Modal.Content>
			</Modal.Root>
		</div>
	)
}
