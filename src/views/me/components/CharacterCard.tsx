'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { Regions } from '@/types/api.type'
import type { PlayerResponse } from '@/types/player.type'
import { allianceBackground } from '@/types/user.type'

interface Props {
	character: PlayerResponse
	region: Regions
}

export function CharacterCard({ character, region }: Props) {
	const t = useTranslations()

	return (
		<Link
			className={`${allianceBackground[character.alliance] ?? 'bg-card'} flex items-center gap-3 rounded-lg p-3 transition-all hover:brightness-90`}
			href={`/player/${region}/${character.username}`}
		>
			<div className="rounded-lg bg-card p-1">
				{character.alliance ? (
					<Image
						alt={character.alliance}
						height={28}
						src={`/images/alliance/${character.alliance}.png`}
						width={28}
					/>
				) : (
					<Icon className="size-7" icon="lucide:user" />
				)}
			</div>

			<div className="flex flex-col gap-0.5">
				<h3 className="truncate font-semibold text-md">
					{character.username}
				</h3>

				{character.clan && (
					<span className="font-bold text-muted-foreground text-xs">
						{character.clan.info.name} ·{' '}
						{t(`player.rank.${character.clan.member.rank}`)}
					</span>
				)}
			</div>
		</Link>
	)
}
