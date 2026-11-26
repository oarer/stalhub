'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import {
	adminAwardsQueries,
	useUpdateAwardVote,
} from '@/queries/admin/awards.queries'
import type { AdminAwardCampaign } from '@/types/admin.type'

export default function VotesTab({
	campaign,
}: {
	campaign: AdminAwardCampaign | null
}) {
	const t = useTranslations()
	const [excluded, setExcluded] = useState<boolean | undefined>()
	const [categoryFilter, setCategoryFilter] = useState('')
	const [cursor, setCursor] = useState<string | undefined>()
	const [reason, setReason] = useState('')
	const [target, setTarget] = useState<{
		id: string
		excluded: boolean
	} | null>(null)
	const cats = useQuery({
		...adminAwardsQueries.listCategories(campaign?.id ?? ''),
		enabled: !!campaign,
	})
	const q = useQuery({
		...adminAwardsQueries.votes(campaign?.id ?? '', {
			excluded,
			category_id: categoryFilter || undefined,
			cursor,
			take: 25,
		}),
		enabled: !!campaign,
	})
	const nominees = useQuery({
		...adminAwardsQueries.listNominees(campaign?.id ?? '', categoryFilter),
		enabled: !!campaign && !!categoryFilter,
	})
	const nomineeNames = new Map(
		(nominees.data?.items ?? []).map((n) => [n.id, n.name])
	)
	const mutation = useUpdateAwardVote()

	if (!campaign) return <p>{t('admin.awards.selectCampaign')}</p>

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-end gap-2">
				<div className="flex flex-col gap-1 text-sm">
					<span>{t('admin.awards.categories')}</span>
					<Combobox
						className="min-w-48"
						onValueChange={(value) => {
							setCursor(undefined)
							setCategoryFilter(value === 'all' ? '' : value)
						}}
						options={[
							{ value: 'all', label: t('ui.all') },
							...(cats.data?.items ?? []).map((c) => ({
								value: c.id,
								label: c.title_i18n.ru ?? c.slug,
							})),
						]}
						placeholder="ui.all"
						translateOptions={false}
						value={categoryFilter || 'all'}
					/>
				</div>
				<div className="flex flex-col gap-1 text-sm">
					<span>{t('admin.awards.excluded')}</span>
					<Combobox
						className="min-w-36"
						onValueChange={(value) => {
							if (!value) return
							setCursor(undefined)
							setExcluded(
								value === 'all' ? undefined : value === 'true'
							)
						}}
						options={[
							{ value: 'all', label: 'ui.all' },
							{ value: 'false', label: 'ui.no' },
							{ value: 'true', label: 'ui.yes' },
						]}
						placeholder="admin.awards.excluded"
						value={
							excluded === undefined ? 'all' : String(excluded)
						}
					/>
				</div>
			</div>
			<Card.Root>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>ID</Table.Head>
							<Table.Head>{t('admin.awards.user')}</Table.Head>
							<Table.Head>{t('admin.awards.nominee')}</Table.Head>
							<Table.Head>
								{t('admin.awards.createdAt')}
							</Table.Head>
							<Table.Head />
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{(q.data?.items ?? []).map((v) => (
							<Table.Row key={v.id}>
								<Table.Cell>{v.id}</Table.Cell>
								<Table.Cell>{v.user.username}</Table.Cell>
								<Table.Cell>
									{nomineeNames.get(v.nominee_id) ?? (
										<span className="text-muted-foreground">
											{v.nominee_id}
										</span>
									)}
								</Table.Cell>
								<Table.Cell>
									{new Date(v.created_at).toLocaleString()}
								</Table.Cell>
								<Table.Cell>
									<Button
										onClick={() => {
											setTarget({
												id: v.id,
												excluded: !v.excluded_at,
											})
											setReason(v.exclude_reason ?? '')
										}}
										size="sm"
									>
										{v.excluded_at
											? t('admin.awards.restoreVote')
											: t('admin.awards.excludeVote')}
									</Button>
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
				<div className="flex justify-end gap-2 p-3">
					<Button
						disabled={!q.data?.has_more}
						onClick={() =>
							setCursor(q.data?.next_cursor ?? undefined)
						}
					>
						{t('ui.next')}
					</Button>
				</div>
			</Card.Root>
			<Modal.Root
				onOpenChange={(open) => !open && setTarget(null)}
				open={!!target}
			>
				<Modal.Content className="max-w-md" fullScreen={false}>
					<Modal.Header>
						<Modal.Title>
							{target?.excluded
								? t('admin.awards.excludeVote')
								: t('admin.awards.restoreVote')}
						</Modal.Title>
					</Modal.Header>
					<Input
						label={t('admin.awards.reason')}
						onChange={(e) => setReason(e.target.value)}
						value={reason}
					/>
					<div className="mt-3 flex justify-end gap-2">
						<Button onClick={() => setTarget(null)} variant="ghost">
							{t('ui.cancel')}
						</Button>
						<Button
							loading={mutation.isPending}
							onClick={() =>
								target &&
								mutation.mutate(
									{
										campaignId: campaign.id,
										voteId: target.id,
										input: {
											excluded: target.excluded,
											reason: reason || undefined,
										},
									},
									{
										onSuccess: () => setTarget(null),
									}
								)
							}
						>
							{t('ui.save')}
						</Button>
					</div>
				</Modal.Content>
			</Modal.Root>
		</div>
	)
}
