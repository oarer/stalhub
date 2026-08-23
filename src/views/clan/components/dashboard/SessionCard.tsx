'use client'

import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/date'
import type { StageSession } from '@/types/clan/clan.type'
import { STAGE_TYPE_COLORS } from '@/views/clan/clan.const'

export function SessionCard({ session }: { session: StageSession }) {
	const t = useTranslations()

	return (
		<div className="rounded-lg border border-primary/40 bg-card/30 p-3">
			<div className="flex items-start justify-between">
				<div className="flex flex-col gap-0.5">
					<div className="flex items-center gap-2">
						<Badge
							className={STAGE_TYPE_COLORS[session.type] ?? ''}
							variant="secondary"
						>
							{t(`clan.stage.${session.type}`)}
						</Badge>
						<span
							className={`rounded px-1.5 py-0.5 font-semibold text-xs ${
								session.victory
									? 'bg-green-500/20 text-success'
									: 'bg-red-500/20 text-destructive'
							}`}
						>
							{session.victory
								? t('clan.common.victory')
								: t('clan.common.defeat')}
						</span>
						<span className="font-semibold">{session.map_name}</span>
					</div>
					<p
						className={`${montserrat.className} font-semibold text-[11px] text-text-accent`}
					>
						{formatDate(session.started_at)}
					</p>
				</div>
			</div>
		</div>
	)
}
