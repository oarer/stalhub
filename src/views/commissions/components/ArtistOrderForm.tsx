'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CheckBox } from '@/components/ui/CheckBox'
import { CLink } from '@/components/ui/Link'
import { commissionService as api } from '@/services/commission/commission.service'
import { useAuthStore } from '@/stores/useAuth.store'
import {
	type ArtistProfile,
	type CommissionFile,
	commissionMoney,
} from '@/types/commission.type'
import { Area, Feedback, Field, FilePicker } from './shared'

export function ArtistOrderForm({ artist }: { artist: ArtistProfile }) {
	const t = useTranslations('commissions')
	const user = useAuthStore((s) => s.user)
	const router = useRouter()
	const client = useQueryClient()
	const [selected, setSelected] = useState<string[]>([])
	const [step, setStep] = useState(0)
	const [title, setTitle] = useState('')
	const [brief, setBrief] = useState('')
	const [files, setFiles] = useState<CommissionFile[]>([])
	const [busy, setBusy] = useState(false)
	const [agree, setAgree] = useState(false)
	const [key] = useState(() => crypto.randomUUID())
	const items = artist.prices.filter((p) => p.id && selected.includes(p.id))
	const total = items.reduce((sum, p) => sum + p.amount, 0)
	const mutation = useMutation({
		mutationFn: () =>
			api.create({
				key,
				artist_id: artist.user_id,
				profile_version: artist.version,
				price_ids: selected,
				title,
				brief,
				file_ids: files.map((f) => f.id),
			}),
		onSuccess: ({ id }) => router.push(`/me/commissions/${id}`),
		onError: () => {
			setAgree(false)
			void client.invalidateQueries({
				queryKey: ['artists', artist.user.username],
			})
		},
	})
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				mutation.mutate()
			}}
		>
			<Card.Root className="gap-4">
				<h2 className="font-semibold text-xl">
					{t(step ? 'briefStep' : 'choose')}
				</h2>
				{!step ? (
					<>
						<fieldset
							className="flex flex-col gap-3"
							disabled={!artist.accepting || mutation.isPending}
						>
							<legend className="sr-only">{t('prices')}</legend>
							{artist.prices.map((price) => {
								const checked = selected.includes(
									price.id ?? ''
								)
								return (
									<div
										className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${checked ? 'border-primary bg-primary/5' : 'border-border/20'}`}
										key={price.id}
									>
										<CheckBox
											aria-label={price.title}
											checked={checked}
											className="mt-1"
											onCheckedChange={(value) => {
												setSelected(
													value
														? [
																...selected,
																price.id ?? '',
															]
														: selected.filter(
																(id) =>
																	id !==
																	price.id
															)
												)
												setAgree(false)
											}}
										/>
										<span className="flex min-w-0 flex-1 flex-col gap-1">
											<span className="font-medium">
												{price.title}
											</span>
											{price.description && (
												<span className="text-muted-foreground text-sm">
													{price.description}
												</span>
											)}
											<span className="flex flex-wrap justify-between gap-2 text-sm">
												<span className="font-medium text-primary">
													{commissionMoney(
														price.amount,
														artist.currency
													)}
												</span>
												<span className="text-muted-foreground">
													{t('days', {
														min: price.days_min,
														max: price.days_max,
													})}
												</span>
											</span>
										</span>
									</div>
								)
							})}
						</fieldset>
						<div className="flex justify-between border-border/20 border-t pt-3 font-semibold">
							<span>{t('total')}</span>
							<span className="text-primary">
								{commissionMoney(total, artist.currency)}
							</span>
						</div>
						{items.length > 0 && (
							<p className="text-muted-foreground text-sm">
								{t('estimate')}:{' '}
								{t('days', {
									min: items.reduce(
										(s, p) => s + p.days_min,
										0
									),
									max: items.reduce(
										(s, p) => s + p.days_max,
										0
									),
								})}
							</p>
						)}
					</>
				) : (
					<>
						<Field
							label={t('title')}
							onChange={setTitle}
							required
							value={title}
						/>
						<Area
							label={t('brief')}
							maxLength={20000}
							minLength={10}
							onChange={setBrief}
							value={brief}
						/>
						<h3 className="font-medium">{t('references')}</h3>
						<FilePicker
							files={files}
							onBusy={setBusy}
							onChange={setFiles}
						/>
						<p className="text-muted-foreground text-xs">
							{t('privacy')}
						</p>
						<CheckBox
							checked={agree}
							id="order-agree"
							label={t('agree')}
							onCheckedChange={setAgree}
						/>
					</>
				)}
				<Feedback error={mutation.error} />
				{!artist.accepting ? (
					<p>{t('closed')}</p>
				) : user?.id === artist.user_id ? (
					<p>{t('selfOrder')}</p>
				) : !user ? (
					<CLink
						className="w-fit px-0 text-primary underline"
						href={`/auth?returnUrl=${encodeURIComponent(`/artists/${artist.user.username}`)}`}
						variant="none"
					>
						{t('login')}
					</CLink>
				) : !step ? (
					<Button
						disabled={
							!selected.length || selected.length !== items.length
						}
						onClick={() => setStep(1)}
						type="button"
					>
						{t('next')}
					</Button>
				) : (
					<div className="flex flex-wrap gap-2">
						<Button
							disabled={
								!agree ||
								!selected.length ||
								selected.length !== items.length ||
								!title.trim() ||
								brief.trim().length < 10 ||
								busy
							}
							loading={mutation.isPending}
							type="submit"
						>
							{t('sendOrder')}
						</Button>
						<Button
							onClick={() => setStep(0)}
							type="button"
							variant="secondary"
						>
							{t('back')}
						</Button>
					</div>
				)}
			</Card.Root>
		</form>
	)
}
