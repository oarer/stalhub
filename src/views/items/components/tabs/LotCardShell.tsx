import type { ReactNode } from 'react'
import type { ArtifactAdditional } from '@/utils/artUtils'
import { AdditionalDetails, getLotRankTint, LotRankBadge } from './LotDetails'

export default function LotCardShell({
	additional,
	children,
}: {
	additional?: ArtifactAdditional
	children: ReactNode
}) {
	const tint = getLotRankTint(additional)

	return (
		<div
			className="flex flex-col gap-3 rounded-xl bg-card px-5 py-4 backdrop-blur-none md:backdrop-blur-md"
			style={tint ? { background: tint } : undefined}
		>
			<LotRankBadge additional={additional} />
			<div className="flex flex-col gap-1">{children}</div>
			<AdditionalDetails additional={additional} />
		</div>
	)
}
