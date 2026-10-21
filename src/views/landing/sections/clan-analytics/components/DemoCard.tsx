'use client'

import { useReducedMotion } from 'motion/react'
import { useLocale } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { PipelineStages } from '../../shared/PipelineStages'
import { CLAN_STAGES } from '../config'
import { useClanLog } from '../hooks/useClanLog'
import { useFlow } from '../hooks/useFlow'
import { LogList } from './LogList'

export function DemoCard() {
	const locale = useLocale()
	const shouldReduceMotion = useReducedMotion()
	const frozen = shouldReduceMotion ?? false

	const flow = useFlow(frozen)
	const entries = useClanLog(locale)

	return (
		<Card.Root>
			<PipelineStages
				flow={flow}
				frozen={frozen}
				namespace="landing.clan"
				reducedMotion={frozen}
				stages={CLAN_STAGES}
			/>
			<LogList entries={entries} reducedMotion={frozen} />
		</Card.Root>
	)
}
