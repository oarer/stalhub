'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { resolveImageUrl } from '@/lib/imageUrl'
import {
	adminAwardsQueries,
	useCreateAwardCategory,
	useDeleteAwardCategory,
	useUpdateAwardCategory,
	useUploadAwardCategoryImage,
} from '@/queries/admin/awards.queries'
import type {
	AdminAwardCampaign,
	AdminAwardCategory,
	AdminAwardCategoryInput,
} from '@/types/admin.type'
import type { AwardCategoryKind, LocalizedText } from '@/types/awards.type'
import AwardImageUpload from './components/AwardImageUpload'

const locales = ['ru', 'en', 'es', 'fr', 'ko'] as const
const empty = (): LocalizedText => ({})

export default function CategoriesTab({
	campaign,
}: {
	campaign: AdminAwardCampaign | null
}) {
	const t = useTranslations()
	const q = useQuery({
		...adminAwardsQueries.listCategories(campaign?.id ?? ''),
		enabled: !!campaign,
	})
	const [editing, setEditing] = useState<AdminAwardCategory | null>(null)
	const [open, setOpen] = useState(false)
	const [slug, setSlug] = useState('')
	const [position, setPosition] = useState(0)
	const [kind, setKind] = useState<AwardCategoryKind>('nominees')
	const [title, setTitle] = useState<LocalizedText>(empty())
	const [description, setDescription] = useState<LocalizedText>(empty())
	const [imageUrl, setImageUrl] = useState('')
	const create = useCreateAwardCategory()
	const update = useUpdateAwardCategory()
	const del = useDeleteAwardCategory()
	const upload = useUploadAwardCategoryImage()
	const [deleting, setDeleting] = useState<AdminAwardCategory | null>(null)

	if (!campaign) return <p>{t('admin.awards.selectCampaign')}</p>

	const reset = (c?: AdminAwardCategory) => {
		setEditing(c ?? null)
		setSlug(c?.slug ?? '')
		setPosition(c?.position ?? 0)
		setKind(c?.kind ?? 'nominees')
		setTitle(c?.title_i18n ?? empty())
		setDescription(c?.description_i18n ?? empty())
		setImageUrl(c?.image_url ?? '')
		setOpen(true)
	}
	const save = () => {
		if (!title.ru?.trim() || !imageUrl) return
		const input = {
			slug: slug.trim() || undefined,
			position,
			kind: kind.toUpperCase() as AdminAwardCategoryInput['kind'],
			title_i18n: title,
			description_i18n: description,
			image_url: imageUrl,
		}
		const done = () => {
			setOpen(false)
			toast.success(t('admin.awards.saved'))
		}
		editing
			? update.mutate(
					{ campaignId: campaign.id, id: editing.id, input },
					{ onSuccess: done }
				)
			: create.mutate(
					{ campaignId: campaign.id, input },
					{ onSuccess: done }
				)
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between">
				<h2 className="text-xl font-semibold">
					{t('admin.awards.categories')}
				</h2>
				<Button onClick={() => reset()}>{t('ui.create')}</Button>
			</div>
			<Card.Root>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>
								{t('admin.awards.categories')}
							</Table.Head>
							<Table.Head>{t('admin.awards.kind')}</Table.Head>
							<Table.Head>
								{t('admin.awards.position')}
							</Table.Head>
							<Table.Head />
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{(q.data?.items ?? []).map((c) => (
							<Table.Row key={c.id}>
								<Table.Cell>
									<div className="flex items-center gap-3">
										{c.image_url && (
											<img
												alt=""
												className="size-10 rounded-lg object-cover"
												src={
													resolveImageUrl(
														c.image_url
													) ?? c.image_url
												}
											/>
										)}
										<span className="font-medium">
											{c.title_i18n.ru ?? c.slug}
										</span>
									</div>
								</Table.Cell>
								<Table.Cell>
									{t(`awards.kind.${c.kind}`)}
								</Table.Cell>
								<Table.Cell>{c.position}</Table.Cell>
								<Table.Cell>
									<Button
										onClick={() => reset(c)}
										size="sm"
										variant="outline"
									>
										{t('ui.edit')}
									</Button>{' '}
									<Button
										onClick={() => setDeleting(c)}
										size="sm"
										variant="ghost"
									>
										{t('ui.delete')}
									</Button>
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			</Card.Root>
			<Modal.Root onOpenChange={setOpen} open={open}>
				<Modal.Content className="max-w-2xl" fullScreen={false}>
					<Modal.Header>
						<Modal.Title>
							{editing ? t('ui.edit') : t('ui.create')}
						</Modal.Title>
					</Modal.Header>
					<div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
						<div className="flex flex-col gap-3">
							<Input
								label={t('admin.awards.titleLocale.ru')}
								onChange={(e) =>
									setTitle({
										...title,
										ru: e.target.value,
									})
								}
								value={title.ru ?? ''}
							/>
							<Input
								label={`${t('admin.awards.description')} (${t('admin.awards.optional')})`}
								onChange={(e) =>
									setDescription({
										...description,
										ru: e.target.value,
									})
								}
								value={description.ru ?? ''}
							/>
						</div>
						<div className="flex flex-col gap-1 text-sm">
							<span>{t('admin.awards.kind')}</span>
							<Combobox
								onValueChange={(value) =>
									value && setKind(value as AwardCategoryKind)
								}
								options={(
									[
										'nominees',
										'updates',
										'clan',
										'player',
									] as const
								).map((k) => ({
									value: k,
									label: `awards.kind.${k}`,
								}))}
								placeholder="admin.awards.kind"
								value={kind}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<p className="text-sm font-semibold">
								{t('admin.awards.image')} *
							</p>
							<AwardImageUpload
								onFile={(file) =>
									upload.mutate(file, {
										onSuccess: (result) =>
											setImageUrl(result.url),
										onError: () =>
											toast.error(
												t('admin.awards.uploadError')
											),
									})
								}
								uploading={upload.isPending}
								value={imageUrl}
							/>
							{!imageUrl && (
								<p className="text-destructive text-xs">
									{t('admin.awards.imageRequired')}
								</p>
							)}
						</div>
						<Accordion
							className="gap-2"
							items={[
								{
									key: 'category-locales',
									title: t('admin.awards.otherLocales'),
									content: (
										<div className="flex flex-col gap-3">
											{locales
												.filter((l) => l !== 'ru')
												.map((l) => (
													<div
														className="grid gap-2 sm:grid-cols-2"
														key={l}
													>
														<Input
															label={t(
																`admin.awards.titleLocale.${l}`
															)}
															onChange={(e) =>
																setTitle({
																	...title,
																	[l]: e
																		.target
																		.value,
																})
															}
															value={
																title[l] ?? ''
															}
														/>
														<Input
															label={t(
																`admin.awards.descriptionLocale.${l}`
															)}
															onChange={(e) =>
																setDescription({
																	...description,
																	[l]: e
																		.target
																		.value,
																})
															}
															value={
																description[
																	l
																] ?? ''
															}
														/>
													</div>
												))}
										</div>
									),
								},
								{
									key: 'category-settings',
									title: t('admin.awards.additionalSettings'),
									content: (
										<div className="flex flex-col gap-3">
											<div>
												<Input
													label={t(
														'admin.awards.slug'
													)}
													onChange={(e) =>
														setSlug(e.target.value)
													}
													value={slug}
												/>
												<p className="text-muted-foreground mt-1 text-xs">
													{t('admin.awards.slugHint')}
												</p>
											</div>
											<Input
												label={t(
													'admin.awards.position'
												)}
												onChange={(e) =>
													setPosition(
														Number(e.target.value)
													)
												}
												type="number"
												value={String(position)}
											/>
										</div>
									),
								},
							]}
							size="sm"
						/>
						<div className="flex justify-end gap-2">
							<Button
								onClick={() => setOpen(false)}
								variant="ghost"
							>
								{t('ui.cancel')}
							</Button>
							<Button
								disabled={
									!title.ru?.trim() ||
									!imageUrl ||
									upload.isPending
								}
								onClick={save}
							>
								{t('ui.save')}
							</Button>
						</div>
					</div>
				</Modal.Content>
			</Modal.Root>
			<Modal.Root
				onOpenChange={(open) => !open && setDeleting(null)}
				open={!!deleting}
			>
				<Modal.Content className="max-w-md" fullScreen={false}>
					<Modal.Header>
						<Modal.Title>{t('ui.delete')}</Modal.Title>
					</Modal.Header>
					<p>{deleting?.title_i18n.ru ?? deleting?.slug}</p>
					<Modal.Footer>
						<Modal.Close>{t('ui.cancel')}</Modal.Close>
						<Button
							loading={del.isPending}
							onClick={() => {
								if (!deleting || !campaign) return
								del.mutate(
									{
										campaignId: campaign.id,
										id: deleting.id,
									},
									{
										onSuccess: () => {
											setDeleting(null)
											toast.success(
												t('admin.awards.saved')
											)
										},
									}
								)
							}}
							variant="danger"
						>
							{t('ui.delete')}
						</Button>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</div>
	)
}
