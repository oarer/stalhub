'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CheckBox } from '@/components/ui/CheckBox'
import { CLink } from '@/components/ui/Link'
import { Switch } from '@/components/ui/Switch'
import { Tabs } from '@/components/ui/Tabs'
import { artQueries } from '@/queries/art/art.queries'
import { commissionService as api } from '@/services/commission/commission.service'
import { useAuthStore } from '@/stores/useAuth.store'
import {
	type ArtistInput,
	type ArtistProfile,
	parseCommissionMoney,
} from '@/types/commission.type'
import { Area, Feedback, Field } from './shared'

export function StudioForm({ initial }: { initial: ArtistProfile | null }) {
	const t = useTranslations('commissions')
	const user = useAuthStore((s) => s.user)
	const client = useQueryClient()
	const [draft, setDraft] = useState<ArtistInput>(() =>
		initial
			? {
					description: initial.description,
					accepting: initial.accepting,
					currency: initial.currency,
					terms: initial.terms,
					revisions: initial.revisions,
					portfolio_ids: initial.portfolio_ids,
					prices: initial.prices,
					version: initial.version,
				}
			: {
					description: '',
					accepting: false,
					currency: 'RUB',
					terms: '',
					revisions: 2,
					portfolio_ids: [],
					prices: [],
					version: 0,
				}
	)
	const [prices, setPrices] = useState(() =>
		draft.prices.map((p) => ({
			...p,
			amountText: (p.amount / 100).toFixed(2),
		}))
	)
	const works = useQuery(artQueries.mine({ take: 100, page: 1 }))
	const mutation = useMutation({
		mutationFn: () =>
			api.saveProfile({
				...draft,
				prices: prices.map(({ amountText, ...p }) => ({
					...p,
					amount: parseCommissionMoney(amountText) ?? 0,
				})),
			}),
		onSuccess: async () => {
			await client.invalidateQueries({ queryKey: ['artists'] })
			await client.invalidateQueries({
				queryKey: ['commissions', user?.id, 'profile'],
			})
		},
	})
	const pricesInvalid = prices.some(
		(p) =>
			!parseCommissionMoney(p.amountText) ||
			!p.title.trim() ||
			p.days_min < 1 ||
			p.days_min > p.days_max
	)
	return (
		<form
			className="flex flex-col gap-5"
			onSubmit={(e) => {
				e.preventDefault()
				mutation.mutate()
			}}
		>
			<CLink
				className="w-fit px-0 text-primary"
				href={`/artists/${user?.username}`}
				variant="none"
			>
				{t('portfolio')}
			</CLink>
			<Tabs.Root defaultValue="about">
				<Tabs.List className="w-fit">
					<Tabs.Trigger value="about">
						{t('description')}
					</Tabs.Trigger>
					<Tabs.Trigger value="prices">{t('prices')}</Tabs.Trigger>
					<Tabs.Trigger value="portfolio">
						{t('selectWorks')}
					</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content className="flex flex-col gap-4" value="about">
					<Card.Root className="gap-4">
						<Area
							label={t('description')}
							maxLength={4000}
							onChange={(description) =>
								setDraft({ ...draft, description })
							}
							value={draft.description}
						/>
						<Switch
							checked={draft.accepting}
							id="studio-accepting"
							label={t('accepting')}
							onCheckedChange={(accepting) =>
								setDraft({ ...draft, accepting })
							}
						/>
						<div className="flex flex-col gap-1.5">
							<span className="text-sm">{t('currency')}</span>
							<Tabs.Root
								onValueChange={(currency) =>
									setDraft({ ...draft, currency })
								}
								value={draft.currency}
							>
								<Tabs.List className="w-fit">
									{['RUB', 'USD', 'EUR'].map((value) => (
										<Tabs.Trigger key={value} value={value}>
											{value}
										</Tabs.Trigger>
									))}
								</Tabs.List>
							</Tabs.Root>
						</div>
						<Field
							label={t('revisionCount')}
							max={20}
							min={0}
							onChange={(value) =>
								setDraft({ ...draft, revisions: Number(value) })
							}
							type="number"
							value={draft.revisions}
						/>
						<Area
							label={t('terms')}
							onChange={(terms) => setDraft({ ...draft, terms })}
							value={draft.terms}
						/>
					</Card.Root>
				</Tabs.Content>
				<Tabs.Content className="flex flex-col gap-4" value="prices">
					{prices.map((price, index) => {
						const update = (fields: Partial<typeof price>) =>
							setPrices(
								prices.map((p, i) =>
									i === index ? { ...p, ...fields } : p
								)
							)
						return (
							<Card.Root
								className="gap-3"
								key={price.id ?? `new-${index}`}
							>
								<Field
									label={t('priceTitle')}
									onChange={(title) => update({ title })}
									required
									value={price.title}
								/>
								<Area
									label={t('priceDescription')}
									maxLength={2000}
									onChange={(description) =>
										update({ description })
									}
									value={price.description}
								/>
								<Field
									label={`${t('amount')} (${draft.currency})`}
									onChange={(amountText) =>
										update({ amountText })
									}
									required
									value={price.amountText}
								/>
								<div className="grid grid-cols-2 gap-3">
									<Field
										label={t('minDays')}
										max={365}
										min={1}
										onChange={(v) =>
											update({ days_min: Number(v) })
										}
										type="number"
										value={price.days_min}
									/>
									<Field
										label={t('maxDays')}
										max={365}
										min={1}
										onChange={(v) =>
											update({ days_max: Number(v) })
										}
										type="number"
										value={price.days_max}
									/>
								</div>
								<Button
									className="w-fit"
									onClick={() =>
										setPrices(
											prices.filter((_, i) => i !== index)
										)
									}
									type="button"
									variant="secondary"
								>
									{t('remove')}
								</Button>
							</Card.Root>
						)
					})}
					<Button
						className="w-fit"
						disabled={prices.length >= 20}
						onClick={() =>
							setPrices([
								...prices,
								{
									title: '',
									description: '',
									amount: 0,
									amountText: '',
									days_min: 7,
									days_max: 14,
								},
							])
						}
						type="button"
						variant="secondary"
					>
						{t('addPrice')}
					</Button>
				</Tabs.Content>
				<Tabs.Content className="flex flex-col gap-4" value="portfolio">
					<Card.Root className="gap-3">
						<h2 className="font-semibold">{t('selectWorks')}</h2>
						<Feedback error={works.error} />
						{works.data?.data.length ? (
							works.data.data.map((art) => (
								<CheckBox
									checked={draft.portfolio_ids.includes(
										art.external_id
									)}
									id={`portfolio-${art.external_id}`}
									key={art.external_id}
									label={art.title || art.external_id}
									onCheckedChange={(checked) =>
										setDraft({
											...draft,
											portfolio_ids: checked
												? [
														...draft.portfolio_ids,
														art.external_id,
													]
												: draft.portfolio_ids.filter(
														(id) =>
															id !==
															art.external_id
													),
										})
									}
								/>
							))
						) : (
							<p className="text-muted-foreground text-sm">
								{t('empty')}
							</p>
						)}
					</Card.Root>
				</Tabs.Content>
			</Tabs.Root>
			<Feedback error={mutation.error} />
			<div className="sticky bottom-4 z-10">
				<Card.Root className="flex-row items-center justify-between gap-3 px-4 py-3">
					<p className="min-w-0 flex-1 text-muted-foreground text-xs">
						{pricesInvalid ||
						(draft.accepting &&
							(!prices.length || !draft.terms.trim())) ||
						draft.portfolio_ids.length > 20
							? t('errors.INVALID_INPUT')
							: ''}
					</p>
					<Button
						disabled={
							pricesInvalid ||
							(draft.accepting &&
								(!prices.length || !draft.terms.trim())) ||
							draft.portfolio_ids.length > 20
						}
						loading={mutation.isPending}
						type="submit"
					>
						{t('save')}
					</Button>
				</Card.Root>
			</div>
		</form>
	)
}
