import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { getLocale } from '@/lib/getLocale'
import type { Achievements } from '@/types/player.type'
import { messageToString } from '@/utils/itemUtils'
import { ACHIEVEMENTS_MAP } from '@/utils/player/AchievementsParse'

export default function AchievementsView({ data }: { data: Achievements[] }) {
	const locale = getLocale()
	return (
		<div className="flex flex-col gap-2">
			{data.map((ach) => {
				const achievement = ACHIEVEMENTS_MAP[ach]

				if (!achievement) return null

				return (
					<div className="flex gap-2" key={ach}>
						<Badge
							className={`${montserrat.className} flex min-w-9 items-center justify-center self-center bg-primary/50 p-2 text-sms`}
						>
							{achievement.point}
						</Badge>

						<div className="flex flex-col gap-1">
							<p className="text-primary">
								{messageToString(achievement.title, locale)}
							</p>
							<p className="text-sm">
								{messageToString(
									achievement.description,
									locale
								)}
							</p>
						</div>
					</div>
				)
			})}
		</div>
	)
}
