'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { playerQueries } from '@/queries/player/player.queries'
import { Regions } from '@/types/api.type'
import PlayersCards from './components/PlayersCards'

const regionOptions = Object.values(Regions).map((region) => ({
	value: region,
	label: 'region.' + region,
}))

export default function PlayerSearchView() {
	const [region, setRegion] = useState<string>(Regions.RU)
	const [character, setCharacter] = useState('')
	const router = useRouter()
	const t = useTranslations()

	const { data: popular } = useSuspenseQuery(playerQueries.getPopular())
	const { data: recent } = useSuspenseQuery(playerQueries.getRecent())

	const handleSearch = () => {
		if (!character.trim()) return
		router.push(`/player/${region}/${encodeURIComponent(character.trim())}`)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSearch()
		}
	}

	return (
		<section className="mx-auto flex max-w-4xl flex-col gap-8 px-4 pt-32 pb-12 lg:pt-36">
			<div className="text-center">
				<h1
					className={`${unbounded.className} mb-2 font-semibold text-3xl tracking-tight md:text-3xl xl:text-4xl`}
				>
					{t('playerSearch.title')}
				</h1>
				<p className="font-semibold text-sm text-text-accent">
					{t('playerSearch.description')}
				</p>
			</div>

			<div className="flex w-full flex-col gap-4">
				<div className="grid w-full grid-cols-[80px_1fr] gap-2">
					<Combobox
						onValueChange={setRegion}
						options={regionOptions}
						placeholder={region}
						value={region}
					/>

					<Input
						className="h-full border-border/40"
						id="nickname-input"
						label="playerSearch.nickname"
						onChange={(e) => setCharacter(e.target.value)}
						onKeyDown={handleKeyDown}
						value={character}
					/>
				</div>
				<Button
					className="flex w-full items-center gap-2"
					disabled={!character}
					onClick={handleSearch}
					size="lg"
					variant={'bordered'}
				>
					<Icon className="text-xl" icon="lucide:search" />
					{t('playerSearch.search')}
				</Button>
			</div>
			<PlayersCards popular={popular} recent={recent} />
		</section>
	)
}
