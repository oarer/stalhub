import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Fragment } from 'react'
import { unbounded } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Divider } from '@/components/ui/Divider'
import type { PlayerStatsResponse } from '@/types/player.type'
import { ROLE_META } from '@/types/playerNote.type'

export function PlayersList({ data }: { data: PlayerStatsResponse[] }) {
	const t = useTranslations()

	return (
		<>
			{data.map((p, index) => (
				<Fragment key={p.uuid}>
					<Link
						className="flex items-center gap-3 px-2 py-2 transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-border/20"
						href={`${p.region}/${p.username}`}
					>
						<Badge
							className={`${unbounded.className} font-semibold text-[10px] uppercase leading-relaxed tracking-widest`}
						>
							{p.region}
						</Badge>
						<Image
							alt={`${p.alliance} icon`}
							height={24}
							src={`/images/alliance/${p.alliance}.png`}
							width={24}
						/>
						<p>{p.username}</p>

						{p.role && (
							<Badge
								className="shadow-transparent"
								variant={ROLE_META[p.role].variant}
							>
								<Icon
									className="size-4"
									icon={ROLE_META[p.role].icon}
								/>
								<span
									className={`${unbounded.className} font-semibold text-[10px] uppercase leading-relaxed tracking-widest`}
								>
									{t(ROLE_META[p.role].title)}
								</span>
							</Badge>
						)}
					</Link>

					{index !== data.length - 1 && (
						<Divider className="bg-gradient-to-r from-transparent via-border-secondary to-transparent" />
					)}
				</Fragment>
			))}
		</>
	)
}
