'use client'

import { useReducedMotion } from 'motion/react'
import { useLocale } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { useClanLog } from '../hooks/useClanLog'
import { useFlow } from '../hooks/useFlow'
import { LogList } from './LogList'
import { PipelineStages } from './PipelineStages'

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
				reducedMotion={frozen}
			/>
			<LogList entries={entries} reducedMotion={frozen} />
		</Card.Root>
	)
}
