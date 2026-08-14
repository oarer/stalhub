'use client'

import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Alert } from '@/components/ui/Alert'
import { mskTimeString } from '@/lib/date'
import { DEADLINE_MSK_HOUR_STRING } from './absence.const'

export function DeadlineNotice({ canLeaveToday }: { canLeaveToday: boolean }) {
	const t = useTranslations()

	return (
		<Alert.Root variant={canLeaveToday ? 'info' : 'destructive'}>
			<Alert.Description className={montserrat.className}>
				{t.rich('clan.absence.now', {
					b: (chunks) => (
						<span className="font-semibold">{chunks}</span>
					),
					time: mskTimeString(),
				})}{' '}
				{canLeaveToday
					? t.rich('clan.absence.canLeave', {
							b: (chunks) => (
								<span className="font-semibold">{chunks}</span>
							),
							deadline: DEADLINE_MSK_HOUR_STRING,
						})
					: t('clan.absence.pastDeadline', {
							deadline: DEADLINE_MSK_HOUR_STRING,
						})}
			</Alert.Description>
		</Alert.Root>
	)
}
