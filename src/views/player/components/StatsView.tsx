import { Icon } from '@iconify/react'

import { Card } from '@/components/ui/Card'
import type { Stat, StatCategory } from '@/types/player.type'
import { groupPlayerStats, StatsSection } from './Stats.helper'

export default function StatsView({ data }: { data: Stat[] }) {
    const grouped = groupPlayerStats(data ?? [])
    return (
        <Card.Root>
            <Card.Header>
                <div className="flex items-center gap-2">
                    <Icon
                        className="text-xl"
                        icon="lucide:chart-no-axes-column"
                    />
                    <h1 className="text-xl font-semibold">Статистика</h1>
                </div>
            </Card.Header>
            <Card.Content className="space-y-3">
                {Object.entries(grouped).map(([category, stats]) => {
                    if (!stats || stats.length === 0 || category === 'NONE')
                        return null

                    return (
                        <StatsSection
                            key={category}
                            stats={stats}
                            title={category as StatCategory}
                        />
                    )
                })}
            </Card.Content>
        </Card.Root>
    )
}
