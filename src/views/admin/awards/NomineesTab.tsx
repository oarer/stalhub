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
	useCreateAwardNominee,
	useDeleteAwardNominee,
	useUpdateAwardNominee,
	useUploadAwardAvatar,
} from '@/queries/admin/awards.queries'
import type {
	AdminAwardCampaign,
	AdminAwardCategory,
	AdminAwardNominee,
	AdminAwardNomineeInput,
} from '@/types/admin.type'
import type { LocalizedText } from '@/types/awards.type'
import AwardImageUpload from './components/AwardImageUpload'

const locales = ['ru', 'en', 'es', 'fr', 'ko'] as const
const emptyText = (): LocalizedText => ({})
type SocialLink = { label: string; url: string }

interface Props {
	campaign: AdminAwardCampaign | null
}

export default function NomineesTab({ campaign }: Props) {
	const t = useTranslations()
	const [categoryId, setCategoryId] = useState('')
	const [editing, setEditing] = useState<AdminAwardNominee | null>(null)
	const [deleting, setDeleting] = useState<AdminAwardNominee | null>(null)
	const [open, setOpen] = useState(false)
	const [name, setName] = useState('')
	const [avatar, setAvatar] = useState<string | null>(null)
	const [date, setDate] = useState('')
	const [patch, setPatch] = useState('')
	const [description, setDescription] = useState<LocalizedText>(emptyText())
	const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
	const categories = useQuery({
		...adminAwardsQueries.listCategories(campaign?.id ?? ''),
		enabled: !!campaign,
	})
	const category: AdminAwardCategory | undefined =
		categories.data?.items.find((item) => item.id === categoryId) ??
		categories.data?.items[0]
	const nominees = useQuery({
		...adminAwardsQueries.listNominees(
			campaign?.id ?? '',
			category?.id ?? ''
		),
		enabled: !!campaign && !!category,
	})
	const create = useCreateAwardNominee()
	const update = useUpdateAwardNominee()
	const remove = useDeleteAwardNominee()
	const upload = useUploadAwardAvatar()

	if (!campaign) return <p>{t('admin.awards.selectCampaign')}</p>

	const reset = (nominee?: AdminAwardNominee) => {
		setEditing(nominee ?? null)
		setName(nominee?.name ?? '')
		setAvatar(nominee?.avatar_url ?? null)
		setDate(nominee?.date ?? '')
		setPatch(nominee?.patch_url ?? '')
		setDescription(nominee?.description_i18n ?? emptyText())
		setSocialLinks(
			Array.isArray(nominee?.social_links) ? nominee.social_links : []
		)
		setOpen(true)
	}
	const save = () => {
		if (!category || !name.trim()) return
		if (category.kind === 'nominees' && !description.ru?.trim()) return
		const trimmedPatch = patch.trim()
		if (
			category.kind === 'updates' &&
			trimmedPatch &&
			!/^https?:\/\//.test(trimmedPatch)
		)
			return
		const links = socialLinks
			.map((link) => ({
				label: link.label.trim(),
				url: link.url.trim(),
			}))
			.filter((link) => link.label || link.url)
		if (links.some((link) => !/^https?:\/\//.test(link.url))) {
			toast.error(t('admin.awards.invalidUrl'))
			return
		}
		const input: AdminAwardNomineeInput = {
			name: name.trim(),
			avatar_url: avatar,
			social_links: links,
			description_i18n: description,
		}
		if (category.kind === 'updates') {
			if (date) input.date = date
			if (trimmedPatch) input.patch_url = trimmedPatch
		}
		const done = () => {
			setOpen(false)
			toast.success(t('admin.awards.saved'))
		}
		editing
			? update.mutate(
					{
						campaignId: campaign.id,
						categoryId: category.id,
						id: editing.id,
						input,
					},
					{ onSuccess: done }
				)
			: create.mutate(
					{
						campaignId: campaign.id,
						categoryId: category.id,
						input,
					},
					{ onSuccess: done }
				)
	}
	const confirmDelete = () => {
		if (!category || !deleting) return
		remove.mutate(
			{
				campaignId: campaign.id,
				categoryId: category.id,
				id: deleting.id,
			},
			{
				onSuccess: () => {
					setDeleting(null)
					toast.success(t('admin.awards.saved'))
				},
			}
		)
	}
	const addLink = () =>
		setSocialLinks([...socialLinks, { label: '', url: '' }])
	const updateLink = (index: number, key: keyof SocialLink, value: string) =>
		setSocialLinks(
			socialLinks.map((link, i) =>
				i === index ? { ...link, [key]: value } : link
			)
		)
	const removeLink = (index: number) =>
		setSocialLinks(socialLinks.filter((_, i) => i !== index))

	if (!category) return <p>{t('admin.awards.selectCategory')}</p>

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-end justify-between gap-2">
				<h2 className="text-xl font-semibold">
					{t('admin.awards.nominees')}
				</h2>
				<div className="flex flex-col gap-1 text-sm">
					<span>{t('admin.awards.categories')}</span>
					<Combobox
						className="min-w-56"
						onValueChange={(value) => value && setCategoryId(value)}
						options={(categories.data?.items ?? []).map((c) => ({
							value: c.id,
							label: c.title_i18n.ru ?? c.slug,
						}))}
						placeholder="admin.awards.selectCategory"
						translateOptions={false}
						value={category.id}
					/>
				</div>
				{category.kind !== 'clan' && category.kind !== 'player' && (
					<Button onClick={() => reset()}>{t('ui.create')}</Button>
				)}
			</div>
			<Card.Root>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>{t('admin.awards.name')}</Table.Head>
							<Table.Head>{t('admin.awards.clan')}</Table.Head>
							<Table.Head>
								{t('admin.awards.clanMembers')}
							</Table.Head>
							<Table.Head>
								{t('admin.awards.nominatedBy')}
							</Table.Head>
							<Table.Head>
								{t('admin.awards.createdAt')}
							</Table.Head>
							<Table.Head />
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{nominees.data?.items.map((n) => (
							<Table.Row key={n.id}>
								<Table.Cell>
									<div className="flex items-center gap-3">
										{n.avatar_url && (
											<img
												alt=""
												className="size-10 rounded-lg object-cover"
												src={
													resolveImageUrl(
														n.avatar_url
													) ?? n.avatar_url
												}
											/>
										)}
										<span className="font-medium">
											{n.name}
										</span>
									</div>
								</Table.Cell>
								<Table.Cell>
									{n.clan_name ?? '—'}{' '}
									{n.clan_tag ? `[${n.clan_tag}]` : ''}
								</Table.Cell>
								<Table.Cell>
									{n.clan_member_count ?? '—'}
								</Table.Cell>
								<Table.Cell>{n.nominated_by ?? '—'}</Table.Cell>
								<Table.Cell>
									{n.created_at
										? new Date(
												n.created_at
											).toLocaleString()
										: '—'}
								</Table.Cell>
								<Table.Cell>
									{category.kind === 'clan' ||
									category.kind === 'player' ? (
										<Button
											onClick={() => setDeleting(n)}
											size="sm"
											variant="ghost"
										>
											{t('ui.delete')}
										</Button>
									) : (
										<>
											<Button
												onClick={() => reset(n)}
												size="sm"
												variant="outline"
											>
												{t('ui.edit')}
											</Button>
											<Button
												onClick={() => setDeleting(n)}
												size="sm"
												variant="ghost"
											>
												{t('ui.delete')}
											</Button>
										</>
									)}
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
					<div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto">
						<Input
							label={t('admin.awards.name')}
							onChange={(e) => setName(e.target.value)}
							value={name}
						/>
						<div className="flex flex-col gap-2">
							<p className="text-sm font-semibold">
								{t('admin.awards.avatar')}
							</p>
							<AwardImageUpload
								className="min-h-32"
								onFile={(file) =>
									upload.mutate(file, {
										onSuccess: (result) =>
											setAvatar(result.url),
										onError: () =>
											toast.error(
												t('admin.awards.uploadError')
											),
									})
								}
								previewClassName="mx-auto size-24 rounded-full"
								uploading={upload.isPending}
								value={avatar}
							/>
						</div>
						{category.kind === 'updates' && (
							<>
								<Input
									label={t('admin.awards.date')}
									onChange={(e) => setDate(e.target.value)}
									type="date"
									value={date}
								/>
								<Input
									label={t('admin.awards.patchUrl')}
									onChange={(e) => setPatch(e.target.value)}
									value={patch}
								/>
							</>
						)}
						<Input
							label={
								category.kind === 'nominees'
									? `${t('admin.awards.description')} *`
									: `${t('admin.awards.description')} (${t('admin.awards.optional')})`
							}
							onChange={(e) =>
								setDescription({
									...description,
									ru: e.target.value,
								})
							}
							value={description.ru ?? ''}
						/>
						<Accordion
							className="gap-2"
							items={[
								{
									key: 'nominee-locales',
									title: t('admin.awards.otherLocales'),
									content: (
										<div className="flex flex-col gap-3">
											{locales
												.filter(
													(locale) => locale !== 'ru'
												)
												.map((locale) => (
													<Input
														key={locale}
														label={t(
															`admin.awards.descriptionLocale.${locale}`
														)}
														onChange={(e) =>
															setDescription({
																...description,
																[locale]:
																	e.target
																		.value,
															})
														}
														value={
															description[
																locale
															] ?? ''
														}
													/>
												))}
										</div>
									),
								},
								{
									key: 'nominee-social',
									title: t('admin.awards.socialLinks'),
									content: (
										<div className="flex flex-col gap-2">
											{socialLinks.map((link, index) => (
												<div
													className="flex gap-2"
													key={`${index}-${link.label}`}
												>
													<Input
														label={t(
															'admin.awards.socialLabel'
														)}
														onChange={(e) =>
															updateLink(
																index,
																'label',
																e.target.value
															)
														}
														value={link.label}
													/>
													<Input
														label={t(
															'admin.awards.socialUrl'
														)}
														onChange={(e) =>
															updateLink(
																index,
																'url',
																e.target.value
															)
														}
														value={link.url}
													/>
													<Button
														aria-label={t(
															'ui.delete'
														)}
														onClick={() =>
															removeLink(index)
														}
														variant="ghost"
													>
														×
													</Button>
												</div>
											))}
											<Button
												onClick={addLink}
												size="sm"
												variant="outline"
											>
												{t('admin.awards.addSocial')}
											</Button>
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
									!name.trim() ||
									(category.kind === 'nominees' &&
										!description.ru?.trim()) ||
									upload.isPending
								}
								loading={create.isPending || update.isPending}
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
					<p>{deleting?.name}</p>
					<Modal.Footer>
						<Modal.Close>{t('ui.cancel')}</Modal.Close>
						<Button
							loading={remove.isPending}
							onClick={confirmDelete}
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
