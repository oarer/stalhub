'use client'

import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { toast } from '@/components/ui/Toast'
import { mskDate } from '@/lib/date'
import { getQueryClient } from '@/providers/QueryProvider'
import { clanQueries } from '@/queries/clan/clan.queries'
import { clanService } from '@/services/clan/clan.service'
import type { AbsenceEventType } from '@/types/clan/clan.type'
import { EVENT_OPTIONS } from '../components/absences/absence.const'

export function useClanAbsence(clanId: string, currentUserId?: number) {
	const t = useTranslations()
	const queryClient = getQueryClient()
	const [date, setDate] = useState(mskDate())

	const { data: absences, isLoading } = useSuspenseQuery(
		clanQueries.getAbsences(clanId, date)
	)
	const { data: members } = useSuspenseQuery(clanQueries.getMembers(clanId))

	const [selected, setSelected] = useState<Record<string, boolean>>({})
	const [stageSel, setStageSel] = useState<Record<string, number[]>>({})
	const [note, setNote] = useState('')

	const myAbsence = absences?.find((a) => a.userId === currentUserId)

	useEffect(() => {
		const events = myAbsence?.events ?? []
		const nextSelected: Record<string, boolean> = {}
		const nextStages: Record<string, number[]> = {}
		for (const e of events) {
			nextSelected[e.eventType] = true
			if (e.stages?.length) nextStages[e.eventType] = e.stages
		}
		setSelected(nextSelected)
		setStageSel(nextStages)
		setNote(myAbsence?.note ?? '')
	}, [myAbsence])

	const invalidate = () =>
		queryClient.invalidateQueries({
			queryKey: ['clan', clanId, 'absences'],
		})

	const saveMutation = useMutation({
		mutationFn: () => {
			const events = EVENT_OPTIONS.filter((o) => selected[o.value]).map(
				(o) => ({
					eventType: o.value,
					...(stageSel[o.value]?.length
						? { stages: stageSel[o.value] }
						: {}),
				})
			)
			return clanService.upsertAbsence({
				date,
				events,
				note: note.trim() || null,
			})
		},
		onSuccess: () => {
			toast.success(t('clan.absence.toasts.saved'))
			invalidate()
		},
		onError: (e: Error) => {
			toast.error(e.message || t('clan.absence.toasts.saveError'))
		},
	})

	const removeMutation = useMutation({
		mutationFn: () => clanService.removeAbsence(date),
		onSuccess: () => {
			toast.success(t('clan.absence.toasts.deleted'))
			invalidate()
		},
		onError: () => {
			toast.error(t('clan.absence.toasts.deleteError'))
		},
	})

	const memberName = useMemo(() => {
		const map = new Map(
			(members ?? [])
				.filter((m) => m.userId != null)
				.map((m) => [m.userId as number, m.name])
		)
		return (userId: number) =>
			map.get(userId) ??
			absences?.find((a) => a.userId === userId)?.user.name ??
			''
	}, [members, absences])

	const toggleEvent = (value: AbsenceEventType) => {
		setSelected((prev) => {
			const next = { ...prev, [value]: !prev[value] }
			if (!next[value]) {
				setStageSel((s) => {
					const n = { ...s }
					delete n[value]
					return n
				})
			}
			return next
		})
	}

	const toggleStage = (value: AbsenceEventType, stage: number) => {
		setStageSel((prev) => {
			const current = prev[value] ?? []
			const next = current.includes(stage)
				? current.filter((s) => s !== stage)
				: [...current, stage].sort((a, b) => a - b)
			return { ...prev, [value]: next }
		})
	}

	return {
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
	}
}
