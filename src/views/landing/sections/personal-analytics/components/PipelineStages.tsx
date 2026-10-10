'use client'

import type { MotionValue } from 'motion/react'
import { useTranslations } from 'next-intl'
import { Fragment } from 'react'
import { FlowDot } from '../../clan-analytics/components/FlowDot'
import { PassBox } from '../../clan-analytics/components/PassBox'
import { DOTS } from '../../clan-analytics/config'
import { nodeFraction } from '../../clan-analytics/utils'
import { PERSONAL_STAGES } from '../config'

export function PersonalPipelineStages({
	flow,
	frozen,
	reducedMotion,
}: {
	flow: MotionValue<number>
	frozen: boolean
	reducedMotion: boolean
}) {
	const t = useTranslations('landing.personal')

	return (
		<div className="relative">
			<div className="relative grid grid-cols-[auto_1fr_auto_1fr_auto] items-start">
				{PERSONAL_STAGES.map((stage, i) => (
					<Fragment key={stage.id}>
						{i > 0 && (
							<div
								aria-hidden="true"
								className="mx-2 mt-6 border-foreground/50 border-t-2 border-dotted"
							/>
						)}
						<div className="flex flex-col items-center gap-2">
							<PassBox
								flow={flow}
								fraction={nodeFraction(
									PERSONAL_STAGES.length,
									i
								)}
								frozen={frozen}
								icon={stage.icon}
							/>
							<span
								className={`font-mono font-semibold text-[11px] text-muted-foreground`}
							>
								{t(`stages.${stage.id}`)}
							</span>
						</div>
					</Fragment>
				))}
			</div>
			<div className="pointer-events-none absolute inset-x-1 top-5.25 h-1.5">
				{reducedMotion ? (
					<span className="absolute top-0 left-1/2 size-1.5 rounded-full bg-primary" />
				) : (
					Array.from({ length: DOTS }, (_, k) => (
						<FlowDot flow={flow} key={k} offset={k / DOTS} />
					))
				)}
			</div>
		</div>
	)
}
