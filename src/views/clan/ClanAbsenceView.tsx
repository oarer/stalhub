'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@/components/ui/Skeleton'
import { mskDate, mskHour } from '@/lib/date'
import { clanQueries } from '@/queries/clan/clan.queries'
import { AbsenceForm } from './components/absences/AbsenceForm'
import { AbsenceList } from './components/absences/AbsenceList'
import { DEADLINE_MSK_HOUR } from './components/absences/absence.const'
import { DeadlineNotice } from './components/absences/DeadlineNotice'
import { useClanAbsence } from './hooks/useClanAbsence'

export default function ClanAbsenceView() {
	const { data: profile } = useSuspenseQuery(clanQueries.getMe())
	const clanId = profile?.clan?.id
	if (!clanId) return null

	return (
		<ClanAbsenceContent clanId={clanId} currentUserId={profile?.userId} />
	)
}

function ClanAbsenceContent({
	clanId,
	currentUserId,
}: {
	clanId: string
	currentUserId?: number
}) {
	const t = useTranslations()
	const {
		date,
		setDate,
		absences,
		isLoading,
		selected,
		stageSel,
		note,
		setNote,
		myAbsence,
		saveMutation,
		removeMutation,
		memberName,
		toggleEvent,
		toggleStage,
	} = useClanAbsence(clanId, currentUserId)

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-40 w-full" />
			</div>
		)
	}

	const canLeaveToday = mskHour() < DEADLINE_MSK_HOUR

	return (
		<div className="flex flex-col gap-4">
			<div>
				<h1 className="font-semibold text-lg">
					{t('clan.absence.title')}
				</h1>
				<p className="font-semibold text-sm text-text-accent">
					{t('clan.absence.desc', {
						hour: String(DEADLINE_MSK_HOUR).padStart(2, '0'),
					})}
				</p>
			</div>

			<DeadlineNotice canLeaveToday={canLeaveToday} />

			<AbsenceForm
				date={date}
				hasAbsence={myAbsence != null}
				isRemoving={removeMutation.isPending}
				isSaving={saveMutation.isPending}
				minDate={mskDate()}
				note={note}
				onDateChange={setDate}
				onNoteChange={setNote}
				onRemove={() => removeMutation.mutate()}
				onSave={() => saveMutation.mutate()}
				onToggleEvent={toggleEvent}
				onToggleStage={toggleStage}
				selected={selected}
				stageSel={stageSel}
			/>

			<AbsenceList
				absences={absences ?? []}
				date={date}
				memberName={memberName}
			/>
		</div>
	)
}
