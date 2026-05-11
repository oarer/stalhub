import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { unbounded } from '@/app/fonts'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/Tooltip'
import type { PlayerStatsResponse } from '@/types/player.type'
import { PlayersList } from './PlayersList'

type Props = {
	popular: PlayerStatsResponse[]
	recent: PlayerStatsResponse[]
}

export default function PlayersCards({ popular, recent }: Props) {
	const t = useTranslations()

	return (
		<div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
			<Card.Root className="w-full">
				<Card.Header className="">
					<Card.Title className="items-center">
						<Icon icon="lucide:chart-column" />
						<h1
							className={`${unbounded.className} font-bold text-[15px] uppercase tracking-tight`}
						>
							{t('playerSearch.popular_title')}
						</h1>
					</Card.Title>
				</Card.Header>
				<Card.Content className="border-border-secondary border-t pt-2">
					<PlayersList data={popular} />
				</Card.Content>
			</Card.Root>
			<Card.Root className="w-full">
				<Card.Header className="">
					<Tooltip.Root>
						<Tooltip.Trigger>
							<Card.Title className="items-center">
								<Icon icon="lucide:clock-fading" />
								<h1
									className={`${unbounded.className} font-bold text-[15px] uppercase tracking-tight`}
								>
									{t('playerSearch.recent_title')}
								</h1>
							</Card.Title>
						</Tooltip.Trigger>
						<Tooltip.Content>
							{t('playerSearch.recent_tooltip')}
						</Tooltip.Content>
					</Tooltip.Root>
				</Card.Header>
				<Card.Content className="border-border-secondary border-t pt-2">
					<PlayersList data={recent} />
				</Card.Content>
			</Card.Root>
		</div>
	)
}
