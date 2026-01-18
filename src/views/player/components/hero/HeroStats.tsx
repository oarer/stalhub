import { useTranslation } from 'react-i18next'

import { Icon } from '@iconify/react'

import { Tooltip } from '@/components/ui/Tooltip'
import { formatDate } from '@/lib/date'
import { dateSince, stringTimeDeltaFull } from '@/lib/time'
import type { PlayerInfo } from '@/types/player.type'
import { getStatValue } from '@/utils/player/StatParse'

export default function HeroStats({ data }: { data: PlayerInfo }) {
    const { t } = useTranslation()
    return (
        <div className="flex flex-col gap-2 font-semibold">
            <div className="flex items-center gap-2">
                <Icon className="text-xl" icon="lucide:user-round-plus" />
                <span>В зоне:</span>
                <Tooltip.Root>
                    <Tooltip.Trigger>
                        {dateSince(
                            new Date(getStatValue(data.stats, 'reg-tim')),
                            t
                        )}
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        {formatDate(getStatValue(data.stats, 'reg-tim'))}
                    </Tooltip.Content>
                </Tooltip.Root>
            </div>
            <div className="flex items-center gap-2">
                <Icon className="text-xl" icon="lucide:clock" />
                <span>В игре:</span>
                <Tooltip.Root>
                    <Tooltip.Trigger>
                        {(
                            getStatValue(data.stats, 'pla-tim') /
                            (1000 * 60 * 60)
                        ).toFixed(0)}{' '}
                        часов
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        {stringTimeDeltaFull(
                            getStatValue(data.stats, 'pla-tim') / 1000,
                            t
                        )}
                    </Tooltip.Content>
                </Tooltip.Root>
            </div>
            <div className="flex items-center gap-2">
                <Icon className="text-xl" icon="lucide:clock-fading" />
                <span>Последний вход:</span>
                <Tooltip.Root>
                    <Tooltip.Trigger>
                        {dateSince(data.lastLogin, t)}
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        {formatDate(data.lastLogin)}
                    </Tooltip.Content>
                </Tooltip.Root>
                <span>назад</span>
            </div>
        </div>
    )
}
