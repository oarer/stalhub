'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import { playerQueries } from '@/queries/player/player.queries'
import ClanView from './components/ClanView'
import StatsView from './components/StatsView'
import HeroView from './components/hero/HeroView'

export default function PlayerView({
    region,
    character,
}: {
    region: string
    character: string
}) {
    const { data } = useSuspenseQuery(playerQueries.get({ region, character }))

    return (
        <div className="mx-auto max-w-360 gap-12 space-y-6 px-4 pt-42 pb-12 sm:px-6 md:px-8">
            <HeroView data={data} />
            {data.clan && <ClanView data={data.clan} />}
            <StatsView data={data.stats} />
        </div>
    )
}
