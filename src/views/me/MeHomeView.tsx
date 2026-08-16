'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'
import { articleQueries } from '@/queries/article/article.queries'
import { buildApiQueries } from '@/queries/build-api/build-api.queries'
import { exboQueries } from '@/queries/exbo/exbo.queries'
import { userQueries } from '@/queries/user/user.queries'
import { Regions } from '@/types/api.type'
import { ArticleCard } from './components/article/ArticleCard'
import { BuildCard } from './components/BuildCard'
import { CharacterCard } from './components/CharacterCard'
import { HomeSection } from './components/HomeSection'
import { useItemsData } from './hooks/useItemsData'

export default function MeHomeView() {
	const t = useTranslations()
	const { data: user } = useSuspenseQuery(userQueries.getMe())
	const { data: builds } = useSuspenseQuery(
		buildApiQueries.mine({ take: 10 })
	)
	const { data: articles } = useSuspenseQuery(
		articleQueries.list({ take: 10 })
	)
	const { artifacts, armorItems, containers } = useItemsData()

	const hasExbo = Boolean(user.providers?.exbo)

	const publishedArticles =
		articles?.data.filter((a) => a.status === 'APPROVED') ?? []
	const reviewArticles =
		articles?.data.filter((a) => a.status === 'REVIEW') ?? []

	return (
		<div className="flex flex-col gap-6">
			{hasExbo && (
				<Suspense fallback={<CharactersSkeleton />}>
					<ExboSection />
				</Suspense>
			)}

			<HomeSection
				actionHref="/me/builds"
				actionLabel={t('me.home.allBuilds')}
				title={t('me.home.builds')}
			>
				{builds?.data.length === 0 ? (
					<p className="font-semibold text-sm text-text-accent">
						{t('me.home.noBuilds')}
					</p>
				) : (
					<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
						{builds?.data.map((build) => (
							<BuildCard
								armorItems={armorItems}
								artifacts={artifacts}
								build={build}
								containers={containers}
								key={build.id}
							/>
						))}
					</div>
				)}
			</HomeSection>

			{publishedArticles.length > 0 && (
				<HomeSection
					actionHref="/me/articles"
					actionLabel={t('me.home.allArticles')}
					title={t('me.home.publishedArticles')}
				>
					<div className="grid grid-cols-1 gap-2">
						{publishedArticles.map((article) => (
							<ArticleCard article={article} key={article.id} />
						))}
					</div>
				</HomeSection>
			)}

			{reviewArticles.length > 0 && (
				<HomeSection
					actionHref="/me/articles"
					actionLabel={t('me.home.allArticles')}
					title={t('me.home.underReview')}
					titleClassName="text-lg"
				>
					<div className="grid grid-cols-1 gap-2">
						{reviewArticles.map((article) => (
							<ArticleCard article={article} key={article.id} />
						))}
					</div>
				</HomeSection>
			)}
		</div>
	)
}

function CharactersSkeleton() {
	const t = useTranslations()
	return (
		<HomeSection title={t('me.home.characters')}>
			<div className="flex flex-col gap-2">
				{Array.from({ length: 2 }).map((_, i) => (
					<div
						className="flex animate-pulse items-center gap-3 rounded-lg bg-background p-3"
						key={i}
					>
						<div className="size-9 rounded-lg bg-accent" />
						<div className="flex flex-col gap-1.5">
							<div className="h-3 w-32 rounded bg-accent" />
							<div className="h-2.5 w-20 rounded bg-accent" />
						</div>
					</div>
				))}
			</div>
		</HomeSection>
	)
}

function ExboSection() {
	const t = useTranslations()
	const { data: characters } = useSuspenseQuery(
		exboQueries.getCharacters(Regions.RU)
	)

	if (!characters || characters.length === 0) return null

	return (
		<HomeSection title={t('me.home.characters')}>
			<div className="flex flex-col gap-2">
				{characters.map((character) => (
					<CharacterCard character={character} key={character.uuid} />
				))}
			</div>
		</HomeSection>
	)
}
