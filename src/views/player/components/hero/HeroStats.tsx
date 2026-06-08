import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Tooltip } from '@/components/ui/Tooltip'
import { formatDate } from '@/lib/date'
import { dateSince, stringTimeDeltaFull } from '@/lib/time'
import type { PlayerResponse } from '@/types/player.type'
import { getStatValue } from '@/utils/player/StatParse'

export default function HeroStats({ data }: { data: PlayerResponse }) {
	const t = useTranslations()

	return (
		<div className="flex flex-col gap-2 font-semibold">
			<div className="flex items-center gap-2">
				<Icon className="text-xl" icon="lucide:user-round-plus" />
				<span>{t('player.stats.reg')}</span>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{formatDate(getStatValue(data.stats, 'reg-tim'))}
					</Tooltip.Trigger>
					<Tooltip.Content>
						{formatDate(getStatValue(data.stats, 'reg-tim'))}
					</Tooltip.Content>
				</Tooltip.Root>
			</div>
			<div className="flex items-center gap-2">
				<Icon className="text-xl" icon="lucide:clock" />
				<span>{t('player.stats.hours')}</span>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{(
							Number(getStatValue(data.stats, 'pla-tim') ?? 0) /
							(1000 * 60 * 60)
						).toFixed(0)}{' '}
						{t('time.hour.many')}
					</Tooltip.Trigger>
					<Tooltip.Content>
						{stringTimeDeltaFull(
							Number(getStatValue(data.stats, 'pla-tim')) / 1000,
							t
						)}
					</Tooltip.Content>
				</Tooltip.Root>
			</div>
			<div className="flex items-center gap-2">
				<Icon className="text-xl" icon="lucide:clock-fading" />
				<span>{t('player.stats.last_login')}</span>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{dateSince(data.lastLogin, t)}
					</Tooltip.Trigger>
					<Tooltip.Content>
						{formatDate(data.lastLogin)}
					</Tooltip.Content>
				</Tooltip.Root>
				<span>{t('time.back')}</span>
			</div>
		</div>
	)
}
