'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Accordion } from '@/components/ui/Accordion'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { CLink } from '@/components/ui/Link'
import {
	GridCardsSkeleton,
	PageTitleSkeleton,
} from '@/components/ui/PageSkeletons'
import Avatar from '@/components/ui/user/Avatar'
import { commissionQueries as queries } from '@/queries/commission/commission.queries'
import { commissionMoney } from '@/types/commission.type'
import { ArtistOrderForm } from './components/ArtistOrderForm'
import { ArtistPortfolio } from './components/ArtistPortfolio'
import { Feedback, Field, Pages } from './components/shared'

export function ArtistsView() {
	const t = useTranslations('commissions')
	const [search, setSearch] = useState('')
	const [page, setPage] = useState(1)
	const query = useQuery(queries.artists(page, search))
	return (
		<section className="mx-auto flex max-w-380 flex-col gap-6 px-4 pt-32 pb-12 md:px-8">
			<h1
				className={`${mtsExtended.className} font-semibold text-[28px] leading-none`}
			>
				{t('catalog')}
			</h1>
			<Field
				label={t('search')}
				onChange={(value) => {
					setSearch(value)
					setPage(1)
				}}
				value={search}
			/>
			<Feedback error={query.error} />
			{query.isPending && (
				<>
					<PageTitleSkeleton center />
					<GridCardsSkeleton className="md:grid-cols-2 xl:grid-cols-3" />
				</>
			)}
			<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
				{query.data?.data.map((artist) => (
					<Card.Root
						className="gap-3 overflow-hidden"
						key={artist.user_id}
					>
						<ArtistPortfolio artist={artist} compact />
						<div className="flex items-start justify-between gap-3 px-5">
							<CLink
								className={`${mtsExtended.className} px-0 text-lg hover:text-primary`}
								href={`/artists/${artist.user.username}`}
								variant="none"
							>
								{artist.user.name || artist.user.username}
							</CLink>
							<Badge variant="success">{t('open')}</Badge>
						</div>
						{artist.description && (
							<p className="line-clamp-2 truncate px-5 text-muted-foreground text-sm">
								{artist.description}
							</p>
						)}
						<div className="mt-auto flex flex-wrap justify-between gap-2 border-border/20 border-t px-5 py-3 text-sm">
							<span className="font-medium text-primary">
								{t('from', {
									price: commissionMoney(
										Math.min(
											...artist.prices.map(
												(p) => p.amount
											)
										),
										artist.currency
									),
								})}
							</span>
							<span className="text-muted-foreground">
								{t('days', {
									min: Math.min(
										...artist.prices.map((p) => p.days_min)
									),
									max: Math.max(
										...artist.prices.map((p) => p.days_max)
									),
								})}
							</span>
						</div>
					</Card.Root>
				))}
			</div>
			{query.data?.total === 0 && (
				<div className="flex flex-col items-center gap-2 py-10 text-center">
					<Icon
						className="text-3xl text-muted-foreground"
						icon="lucide:brush"
					/>
					<p className="text-muted-foreground">{t('empty')}</p>
				</div>
			)}
			<Pages
				onChange={setPage}
				page={page}
				size={12}
				total={query.data?.total ?? 0}
			/>
		</section>
	)
}

export function ArtistView({ username }: { username: string }) {
	const t = useTranslations('commissions')
	const query = useQuery(queries.artist(username))
	return (
		<section className="mx-auto flex max-w-380 flex-col gap-6 px-4 pt-32 pb-12 md:px-8">
			<CLink
				className="w-fit px-0 text-primary"
				href="/artists"
				variant="none"
			>
				{t('catalog')}
			</CLink>
			<Feedback error={query.error} />
			{query.isPending && (
				<>
					<PageTitleSkeleton />
					<GridCardsSkeleton />
				</>
			)}
			{query.data && (
				<>
					<header className="flex flex-wrap items-start gap-4">
						<Avatar
							className="size-12"
							height={64}
							id={query.data.user_id}
							username={query.data.user.username}
							width={64}
						/>
						<div className="flex-col gap-2">
							<h1
								className={`${mtsExtended.className} font-medium text-2xl`}
							>
								{query.data.user.name ||
									query.data.user.username}
							</h1>
							{query.data.description && (
								<p className="max-w-2xl text-muted-foreground">
									{query.data.description}
								</p>
							)}
						</div>
						<Badge
							variant={
								query.data.accepting ? 'success' : 'secondary'
							}
						>
							{t(query.data.accepting ? 'open' : 'closed')}
						</Badge>
					</header>
					<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)]">
						<div className="flex min-w-0 flex-col gap-5">
							{query.data.portfolio?.length ? (
								<>
									<h2 className="font-semibold text-xl">
										{t('portfolio')}
									</h2>
									<ArtistPortfolio artist={query.data} />
								</>
							) : null}
							{query.data.terms && (
								<Accordion
									items={[
										{
											key: 'terms',
											title: t('terms'),
											content: (
												<>
													<p className="whitespace-pre-wrap text-sm leading-relaxed">
														{query.data.terms}
													</p>
													<p className="text-muted-foreground text-sm">
														{t('revisions', {
															count: query.data
																.revisions,
														})}
													</p>
												</>
											),
										},
									]}
								/>
							)}
						</div>
						<div className="lg:sticky lg:top-24">
							<ArtistOrderForm artist={query.data} />
						</div>
					</div>
				</>
			)}
		</section>
	)
}
