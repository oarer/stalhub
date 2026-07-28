'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { articleQueries } from '@/queries/article/article.queries'
import { buildApiQueries } from '@/queries/build-api/build-api.queries'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { exboQueries } from '@/queries/exbo/exbo.queries'
import { userQueries } from '@/queries/user/user.queries'
import { Regions } from '@/types/api.type'
import { ArticleCard } from './components/article/ArticleCard'
import { BuildCard } from './components/BuildCard'
import { CharacterCard } from './components/CharacterCard'

export default function MeHomeView() {
	const { data: user } = useSuspenseQuery(userQueries.getMe())
	const { data: builds } = useSuspenseQuery(
		buildApiQueries.list({ take: 10 })
	)
	const { data: articles } = useSuspenseQuery(
		articleQueries.list({ take: 10 })
	)
	const { data: artifacts } = useSuspenseQuery(
		itemsQueries.get({ type: 'artefact' })
	)
	const { data: armorItems } = useSuspenseQuery(
		itemsQueries.get({ type: 'armor' })
	)
	const { data: containers } = useSuspenseQuery(
		itemsQueries.get({ type: 'containers' })
	)

	const hasExbo = Boolean(user.providers?.exbo)

	const publishedArticles =
		articles?.data.filter((a) => a.status === 'APPROVED') ?? []
	const reviewArticles =
		articles?.data.filter((a) => a.status === 'REVIEW') ?? []

	return (
		<div className="flex flex-col gap-6">
			{hasExbo && <ExboSection />}

			<section className="flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-xl">Сборки</h2>
					<Link
						className="font-semibold text-sm text-text-accent hover:underline"
						href="/me/builds"
					>
						Все сборки
					</Link>
				</div>

				{builds?.data.length === 0 ? (
					<p className="font-semibold text-sm text-text-accent">
						Нет сборок
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
			</section>

			{publishedArticles.length > 0 && (
				<section className="flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<h2 className="font-semibold text-xl">
							Опубликованные статьи
						</h2>
						<Link
							className="font-semibold text-sm text-text-accent hover:underline"
							href="/me/articles"
						>
							Все статьи
						</Link>
					</div>

					<div className="grid grid-cols-1 gap-2">
						{publishedArticles.map((article) => (
							<ArticleCard article={article} key={article.id} />
						))}
					</div>
				</section>
			)}

			{reviewArticles.length > 0 && (
				<section className="flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<h2 className="font-semibold text-lg">
							На рассмотрении
						</h2>
						<Link
							className="font-semibold text-sm text-text-accent hover:underline"
							href="/me/articles"
						>
							Все статьи
						</Link>
					</div>

					<div className="grid grid-cols-1 gap-2">
						{reviewArticles.map((article) => (
							<ArticleCard article={article} key={article.id} />
						))}
					</div>
				</section>
			)}
		</div>
	)
}

function ExboSection() {
	const { data: characters } = useSuspenseQuery(
		exboQueries.getCharacters(Regions.RU)
	)

	if (!characters || characters.length === 0) return null

	return (
		<section className="flex flex-col gap-3">
			<h2 className="font-semibold text-xl">Персонажи</h2>

			<div className="flex flex-col gap-2">
				{characters.map((character) => (
					<CharacterCard character={character} key={character.uuid} />
				))}
			</div>
		</section>
	)
}
