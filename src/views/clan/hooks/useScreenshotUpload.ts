'use client'

import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from '@/components/ui/Toast'
import {
	type DetectedStage,
	detectStageFromNow,
	STAGE_SCHEDULE,
} from '@/constants/stageSchedule'
import { getQueryClient } from '@/providers/QueryProvider'
import { clanService } from '@/services/clan/clan.service'
import type { UserClanProfile } from '@/types/clan/clan.type'

export function useScreenshotUpload(profile: UserClanProfile) {
	const t = useTranslations()
	const queryClient = getQueryClient()

	const [uploadOpen, setUploadOpen] = useState(false)
	const [uploadMapName, setUploadMapName] = useState('')
	const [uploadType, setUploadType] = useState('TOURNAMENT')
	const [uploadStage, setUploadStage] = useState(1)
	const [uploadDate, setUploadDate] = useState('')
	const [uploadFiles, setUploadFiles] = useState<File | null>(null)
	const [uploading, setUploading] = useState(false)
	const [detected, setDetected] = useState<DetectedStage | null>(null)

	const stageCountForType = (type: string) =>
		type === 'BASE_CAPTURE' ? 4 : 3

	const handleUploadOpenChange = (open: boolean) => {
		setUploadOpen(open)
		if (!open) return
		const d = detectStageFromNow()
		setDetected(d)
		setUploadType(d?.type ?? 'TOURNAMENT')
		setUploadStage(d?.stage ?? 1)
		setUploadDate(new Date().toISOString().slice(0, 10))
		setUploadMapName('')
		setUploadFiles(null)
	}

	const handleTypeChange = (type: string) => {
		setUploadType(type)
		setUploadStage((prev) => Math.min(prev, stageCountForType(type)))
	}

	const invalidateSessions = () => {
		queryClient.invalidateQueries({ queryKey: ['clan', 'sessions'] })
	}

	const uploadMutation = useMutation({
		mutationFn: async (file: File) => {
			const startTime = STAGE_SCHEDULE[uploadType]?.stages.find(
				(s) => s.stage === uploadStage
			)?.start
			const startedAt = uploadDate
				? new Date(
						`${uploadDate}T${
							startTime
								? `${String(startTime[0]).padStart(2, '0')}:${String(startTime[1]).padStart(2, '0')}`
								: '12:00'
						}:00`
					).toISOString()
				: undefined
			const session = await clanService.createSession({
				region: profile?.region ?? 'RU',
				map_name: uploadMapName.trim() || t(`clan.stage.${uploadType}`),
				stage_number: uploadStage,
				type: uploadType,
				started_at: startedAt,
			})
			const { default: axios } = await import('axios')
			const formData = new FormData()
			formData.append('file', file)
			await axios.post(
				`${process.env.NEXT_PUBLIC_API}/api/v1/clan/analytics/sessions/${session.id}/screenshots`,
				formData,
				{ withCredentials: true }
			)
		},
		onMutate: () => setUploading(true),
		onSuccess: () => {
			setUploadOpen(false)
			setUploadMapName('')
			setUploadType('TOURNAMENT')
			setUploadStage(1)
			setUploadDate('')
			setUploadFiles(null)
			queryClient.invalidateQueries({ queryKey: ['clan', 'sessions'] })
			toast.success(t('clan.sessions.toasts.uploaded'))
		},
		onError: () => {
			toast.error(t('clan.sessions.toasts.uploadError'))
		},
		onSettled: () => setUploading(false),
	})

	return {
		uploadOpen,
		uploadMapName,
		setUploadMapName,
		uploadType,
		setUploadType,
		uploadStage,
		setUploadStage,
		uploadDate,
		setUploadDate,
		uploadFiles,
		setUploadFiles,
		uploading,
		detected,
		handleUploadOpenChange,
		handleTypeChange,
		invalidateSessions,
		uploadMutation,
	}
}
