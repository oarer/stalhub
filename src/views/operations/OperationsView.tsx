'use client'

import { Icon } from '@iconify/react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Suspense, useState } from 'react'
import { unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { playerService } from '@/services/player/player.service'
import { Regions } from '@/types/api.type'
import OperationSessionCard from './components/OperationSessionCard'

const regionOptions = Object.values(Regions).map((region) => ({
	value: region,
	label: 'region.' + region,
}))

const PAGE_SIZE = 20

function OperationsContent() {
	const t = useTranslations()
	const router = useRouter()
	const searchParams = useSearchParams()

	const region = (searchParams.get('region') ?? Regions.RU) as string
	const character = searchParams.get('character') ?? ''
	const isSearch = Boolean(region && character)

	const [regionInput, setRegionInput] = useState(region)
	const [characterInput, setCharacterInput] = useState(character)

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useInfiniteQuery({
		queryKey: ['operations', region, character],
		initialPageParam: 0,
		enabled: isSearch,
		queryFn: ({ pageParam }) =>
			playerService.getOperations({
				region,
				username: character,
				limit: PAGE_SIZE,
				offset: pageParam,
			}),
		getNextPageParam: (lastPage, allPages) => {
			const loaded = allPages.reduce(
				(sum, p) => sum + p.sessions.length,
				0
			)
			return loaded < lastPage.total ? loaded : undefined
		},
	})

	const sessions = data?.pages.flatMap((p) => p.sessions) ?? []
	const total = data?.pages[0]?.total ?? 0

	const handleSearch = () => {
		if (!characterInput.trim()) return
		const params = new URLSearchParams()
		params.set('region', regionInput)
		params.set('character', characterInput.trim())
		router.replace(`/operations?${params.toString()}`)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSearch()
		}
	}

	return (
		<section className="mx-auto flex max-w-4xl flex-col gap-4 px-4 pt-32 pb-12 lg:pt-36">
			<div className="text-center">
				<h1
					className={`${unbounded.className} mb-2 font-semibold text-3xl tracking-tight md:text-3xl xl:text-4xl`}
				>
					{t('operations.title')}
				</h1>
				<p className="font-semibold text-sm text-text-accent">
					{t('operations.description')}
				</p>
			</div>

			<div className="grid w-full grid-cols-[80px_1fr] gap-2">
				<Combobox
					onValueChange={setRegionInput}
					options={regionOptions}
					placeholder={regionInput}
					value={regionInput}
				/>
				<Input
					className="h-full border-border/40 py-1"
					id="operations-nickname-input"
					label="operations.nickname"
					onChange={(e) => setCharacterInput(e.target.value)}
					onKeyDown={handleKeyDown}
					value={characterInput}
				/>
			</div>
			<Button
				className="flex w-full items-center gap-2"
				disabled={!characterInput.trim()}
				onClick={handleSearch}
				size="lg"
				variant="bordered"
			>
				<Icon className="text-xl" icon="lucide:search" />
				{t('operations.search')}
			</Button>

			{!isSearch && (
				<p className="text-center font-semibold text-sm text-text-accent">
					{t('operations.prompt')}
				</p>
			)}

			{isSearch && (
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-2">
						<Icon className="text-2xl" icon="lucide:siren" />
						<h2 className="font-semibold text-xl">
							{t('player.operations.title')}
						</h2>
						{total > 0 && (
							<span className="rounded-full bg-accent px-2 py-0.5 font-semibold text-xs">
								{total}
							</span>
						)}
					</div>

					{isLoading && (
						<div className="flex flex-col gap-4">
							<Skeleton className="h-24 w-full" />
							<Skeleton className="h-24 w-full" />
						</div>
					)}

					{!isLoading && isError && (
						<Card.Root>
							<Card.Content>
								<p className="font-semibold text-text-accent">
									{t('player.operations.error')}
								</p>
							</Card.Content>
						</Card.Root>
					)}

					{!isLoading && !isError && sessions.length === 0 && (
						<Card.Root>
							<Card.Content>
								<p className="font-semibold text-text-accent">
									{t('player.operations.empty')}
								</p>
							</Card.Content>
						</Card.Root>
					)}

					{!isLoading &&
						sessions.map((session) => (
							<OperationSessionCard
								key={session.id}
								session={session}
							/>
						))}

					{hasNextPage && (
						<Button
							loading={isFetchingNextPage}
							onClick={() => fetchNextPage()}
							variant="secondary"
						>
							{t('operations.loadMore')}
						</Button>
					)}
				</div>
			)}
		</section>
	)
}

export default function OperationsView() {
	return (
		<Suspense fallback={null}>
			<OperationsContent />
		</Suspense>
	)
}
