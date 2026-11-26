'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import {
	adminAwardsQueries,
	useSetAwardPlaces,
	useUpdateAwardCampaign,
} from '@/queries/admin/awards.queries'
import type {
	AdminAwardCampaign,
	AdminAwardPlaceBulkInput,
} from '@/types/admin.type'
import type { AwardResults } from '@/types/awards.type'
import AwardResultsPngDialog from '@/views/awards/components/AwardResultsPngDialog'
import { localizedText, toAwardResults } from './utils'

export default function ResultsTab({
	campaign,
}: {
	campaign: AdminAwardCampaign | null
}) {
	const t = useTranslations()
	const locale = useLocale()
	const router = useRouter()
	const q = useQuery({
		...adminAwardsQueries.results(campaign?.id ?? ''),
		enabled: !!campaign,
	})
	const categoriesQuery = useQuery({
		...adminAwardsQueries.listCategories(campaign?.id ?? ''),
		enabled: !!campaign,
	})
	const place = useSetAwardPlaces()
	const publish = useUpdateAwardCampaign()
	const [confirm, setConfirm] = useState(false)
	const [imagesOpen, setImagesOpen] = useState(false)
	const [initialPlaces, setInitialPlaces] = useState<Record<string, string>>(
		{}
	)
	const [places, setPlaces] = useState<Record<string, string>>({})
	const [errors, setErrors] = useState<Record<string, string | null>>({})
	const [saving, setSaving] = useState(false)
	const imageResults = useMemo<AwardResults | null>(() => {
		if (!campaign || !q.data) return null
		return toAwardResults(
			campaign,
			q.data,
			categoriesQuery.data?.items,
			locale
		)
	}, [campaign, categoriesQuery.data?.items, locale, q.data])

	const pendingChanges = useMemo(() => {
		if (!q.data) return []
		const changes: {
			categoryId: string
			nomineeId: string
			raw: string
			max: number
		}[] = []
		for (const category of q.data.categories) {
			for (const nominee of category.nominees) {
				const raw = places[nominee.id] ?? ''
				if (raw === (initialPlaces[nominee.id] ?? '')) continue
				changes.push({
					categoryId: category.id,
					max: category.nominees.length,
					nomineeId: nominee.id,
					raw,
				})
			}
		}
		return changes
	}, [initialPlaces, places, q.data])

	useEffect(() => {
		if (!q.data) return
		const map: Record<string, string> = {}
		q.data.categories.forEach((c) =>
			c.nominees.forEach((n) => {
				map[n.id] = String(n.manual_place ?? '')
			})
		)
		setInitialPlaces(map)
		setPlaces(map)
		setErrors({})
	}, [q.data])

	if (!campaign) return <p>{t('admin.awards.selectCampaign')}</p>
	if (!q.data) return <p>{t('admin.awards.noVotes')}</p>
	if (campaign.status === 'published' || q.data.published_at)
		return (
			<div>
				<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
					<p className="text-muted-foreground text-sm">
						{t('admin.awards.readOnlyAfterPublish')}
					</p>
					<div className="flex flex-wrap gap-2">
						<Button
							onClick={() =>
								router.push(`/admin/ceremony/${campaign.id}`)
							}
						>
							{t('awards.results.ceremony')}
						</Button>
						<Button
							onClick={() => router.push('/awards')}
							variant="secondary"
						>
							{t('awards.results.watch')}
						</Button>
						<Button onClick={() => setImagesOpen(true)}>
							{t('awards.results.images')}
						</Button>
					</div>
				</div>
				{q.data.categories.map((c) => (
					<Card.Root className="overflow-hidden" key={c.id}>
						<Card.Header>
							<Card.Title>
								{localizedText(c.title_i18n, locale) ?? c.slug}
							</Card.Title>
						</Card.Header>
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>
										{t('admin.awards.nominee')}
									</Table.Head>
									<Table.Head>
										{t('admin.awards.votes')}
									</Table.Head>
									<Table.Head>
										{t('admin.awards.place')}
									</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{c.nominees.map((n) => (
									<Table.Row key={n.id}>
										<Table.Cell>{n.name}</Table.Cell>
										<Table.Cell>{n.votes_count}</Table.Cell>
										<Table.Cell>
											{n.place ?? '—'}
										</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table.Root>
					</Card.Root>
				))}
				{imageResults && (
					<AwardResultsPngDialog
						onOpenChange={setImagesOpen}
						open={imagesOpen}
						results={imageResults}
					/>
				)}
			</div>
		)

	const hasUnsavedPlaces = pendingChanges.length > 0
	const publishDisabled =
		campaign.status !== 'ended' || !q.data.can_publish || hasUnsavedPlaces

	const savePlaces = async () => {
		if (!pendingChanges.length) return
		const nextErrors: Record<string, string | null> = {}
		const updates: AdminAwardPlaceBulkInput[] = []
		for (const change of pendingChanges) {
			if (change.raw === '') {
				updates.push({
					category_id: change.categoryId,
					nominee_id: change.nomineeId,
					manual_place: null,
				})
				continue
			}
			const value = Number(change.raw)
			if (!Number.isInteger(value) || value < 1 || value > change.max) {
				nextErrors[change.nomineeId] = t(
					'admin.awards.manualPlaceInvalid'
				)
				continue
			}
			updates.push({
				category_id: change.categoryId,
				nominee_id: change.nomineeId,
				manual_place: value,
			})
		}
		if (Object.keys(nextErrors).length) {
			setErrors(nextErrors)
			return
		}
		setSaving(true)
		try {
			await place.mutateAsync({
				campaignId: campaign.id,
				places: updates,
			})
			setInitialPlaces({ ...places })
			setErrors({})
			toast.success(t('admin.awards.saved'))
		} catch {
			toast.error(t('admin.awards.saveError'))
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap justify-end gap-2">
				<Button
					onClick={() =>
						router.push(`/admin/ceremony/${campaign.id}`)
					}
					variant="secondary"
				>
					{t('awards.results.ceremony')}
				</Button>
				{imageResults && (
					<Button
						onClick={() => setImagesOpen(true)}
						variant="secondary"
					>
						{t('awards.results.images')}
					</Button>
				)}
				<Button
					disabled={!hasUnsavedPlaces || saving}
					loading={saving}
					onClick={savePlaces}
					variant="secondary"
				>
					{t('ui.save')}
				</Button>
				<Button
					disabled={publishDisabled}
					onClick={() => setConfirm(true)}
				>
					{t('admin.awards.publish')}
				</Button>
			</div>
			{q.data.categories.map((c) => (
				<Card.Root className="overflow-hidden" key={c.id}>
					<Card.Header>
						<Card.Title>
							{localizedText(c.title_i18n, locale) ?? c.slug}
							{c.ties && (
								<Badge variant="danger">
									{t('admin.awards.tie')}
								</Badge>
							)}
						</Card.Title>
					</Card.Header>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>
									{t('admin.awards.nominee')}
								</Table.Head>
								<Table.Head>
									{t('admin.awards.votes')}
								</Table.Head>
								<Table.Head>
									{t('admin.awards.place')}
								</Table.Head>
								<Table.Head />
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{c.nominees.map((n) => (
								<Table.Row
									className={
										c.tie_ids.includes(n.id)
											? 'bg-destructive/10'
											: ''
									}
									key={n.id}
								>
									<Table.Cell>{n.name}</Table.Cell>
									<Table.Cell>{n.votes_count}</Table.Cell>
									<Table.Cell>{n.place ?? '—'}</Table.Cell>
									<Table.Cell>
										<div className="flex flex-col gap-1">
											<Input
												aria-label={t(
													'admin.awards.manualPlace'
												)}
												className="w-24"
												disabled={saving}
												max={c.nominees.length}
												min="1"
												onChange={(e) => {
													const raw = e.target.value
													setPlaces((prev) => ({
														...prev,
														[n.id]: raw,
													}))
													setErrors((prev) =>
														prev[n.id]
															? {
																	...prev,
																	[n.id]: null,
																}
															: prev
													)
												}}
												type="number"
												value={places[n.id] ?? ''}
											/>
											{errors[n.id] && (
												<span className="text-destructive text-xs">
													{errors[n.id]}
												</span>
											)}
										</div>
									</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table.Root>
					{c.nominees.every((n) => n.votes_count === 0) && (
						<p className="text-muted-foreground p-3 text-sm">
							{t('admin.awards.noVotes')}
						</p>
					)}
				</Card.Root>
			))}
			{q.data.publish_block_reason === 'tie' && (
				<p className="text-destructive text-sm">
					{t('admin.awards.publishBlockedTie')}
				</p>
			)}
			<Modal.Root onOpenChange={setConfirm} open={confirm}>
				<Modal.Content className="max-w-md" fullScreen={false}>
					<Modal.Header>
						<Modal.Title>{t('admin.awards.publish')}</Modal.Title>
					</Modal.Header>
					<p>{t('admin.awards.publishConfirm')}</p>
					<div className="mt-3 flex justify-end gap-2">
						<Button
							onClick={() => setConfirm(false)}
							variant="ghost"
						>
							{t('ui.cancel')}
						</Button>
						<Button
							loading={publish.isPending}
							onClick={() =>
								publish.mutate(
									{
										id: campaign.id,
										input: {
											status: 'published',
										},
									},
									{
										onError: () =>
											toast.error(
												t('admin.awards.publishError')
											),
										onSuccess: () => {
											setConfirm(false)
											toast.success(
												t('admin.awards.publishSuccess')
											)
											router.push('/awards')
										},
									}
								)
							}
						>
							{t('admin.awards.publish')}
						</Button>
					</div>
				</Modal.Content>
			</Modal.Root>
			{imageResults && (
				<AwardResultsPngDialog
					onOpenChange={setImagesOpen}
					open={imagesOpen}
					results={imageResults}
				/>
			)}
		</div>
	)
}
