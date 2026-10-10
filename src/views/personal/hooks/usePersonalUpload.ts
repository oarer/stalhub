'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from '@/components/ui/Toast'
import {
	type DetectedStage,
	detectStageFromNow,
	STAGE_SCHEDULE,
} from '@/constants/stageSchedule'
import { personalService } from '@/services/personal/personal.service'

export type PersonalUploadMode = 'stage' | 'quick'

const stageCountForType = (type: string) => (type === 'BASE_CAPTURE' ? 4 : 3)

function startedAtFor(type: string, stage: number, date: string): string {
	const startTime = STAGE_SCHEDULE[type]?.stages.find(
		(s) => s.stage === stage
	)?.start
	const hh = String(startTime?.[0] ?? 12).padStart(2, '0')
	const mm = String(startTime?.[1] ?? 0).padStart(2, '0')
	return new Date(`${date}T${hh}:${mm}:00`).toISOString()
}

export function usePersonalUpload(region: string) {
	const t = useTranslations()
	const qc = useQueryClient()

	const [uploadOpen, setUploadOpen] = useState(false)
	const [mode, setMode] = useState<PersonalUploadMode>('stage')
	const [mapName, setMapName] = useState('')
	const [uploadType, setUploadType] = useState('TOURNAMENT')
	const [uploadStage, setUploadStage] = useState(1)
	const [uploadDate, setUploadDate] = useState('')
	const [uploadFile, setUploadFile] = useState<File | null>(null)
	const [detected, setDetected] = useState<DetectedStage | null>(null)

	const handleOpenChange = (open: boolean) => {
		setUploadOpen(open)
		if (!open) return
		const d = detectStageFromNow()
		setDetected(d)
		setUploadType(d?.type ?? 'TOURNAMENT')
		setUploadStage(d?.stage ?? 1)
		setUploadDate(new Date().toISOString().slice(0, 10))
		setMapName('')
		setUploadFile(null)
		setMode('stage')
	}

	const handleTypeChange = (type: string) => {
		setUploadType(type)
		setUploadStage((prev) => Math.min(prev, stageCountForType(type)))
	}

	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ['personal'] })
	}

	const uploadMutation = useMutation({
		mutationFn: async (file: File) => {
			const quick = mode === 'quick'
			const type = quick ? (detected?.type ?? 'TOURNAMENT') : uploadType
			const stage = quick ? (detected?.stage ?? 1) : uploadStage
			const date = quick
				? new Date().toISOString().slice(0, 10)
				: uploadDate || new Date().toISOString().slice(0, 10)
			const session = await personalService.createSession({
				region,
				map_name: mapName.trim() || t(`clan.stage.${type}`),
				stage_number: stage,
				type,
				started_at: startedAtFor(type, stage, date),
			})
			await personalService.uploadScreenshot(session.id, file)
		},
		onSuccess: () => {
			setUploadOpen(false)
			setMapName('')
			setUploadFile(null)
			invalidate()
			toast.success(t('clan.sessions.toasts.uploaded'))
		},
		onError: (e) => {
			const msg =
				typeof e === 'object' && e !== null && 'response' in e
					? (e as { response?: { data?: { error?: string } } })
							.response?.data?.error
					: null
			toast.error(msg ?? t('clan.sessions.toasts.uploadError'))
		},
	})

	return {
		uploadOpen,
		mode,
		setMode,
		mapName,
		setMapName,
		uploadType,
		uploadStage,
		uploadDate,
		uploadFile,
		setUploadFile,
		detected,
		handleOpenChange,
		handleTypeChange,
		setUploadStage,
		setUploadDate,
		invalidate,
		uploadMutation,
	}
}
