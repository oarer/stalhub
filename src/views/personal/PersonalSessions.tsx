'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { personalQueries } from '@/queries/personal/personal.queries'
import { STAGE_TYPES } from '@/views/clan/components/sessions/session.const'
import { usePersonalUpload } from './hooks/usePersonalUpload'
import { PersonalSessionRow } from './PersonalSessionRow'
import { PersonalUploadModal } from './PersonalUploadModal'

type SessionFilter = 'ALL' | string

export function PersonalSessions({ region }: { region: string }) {
	const t = useTranslations()
	const { data: sessions, isFetching } = useSuspenseQuery(
		personalQueries.getSessions()
	)
	const [filter, setFilter] = useState<SessionFilter>('ALL')

	const {
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
	} = usePersonalUpload(region)

	const filtered = useMemo(() => {
		if (!sessions) return []
		return filter === 'ALL'
			? sessions
			: sessions.filter((s) => s.type === filter)
	}, [sessions, filter])

	return (
		<Card.Root className="flex flex-col gap-3 p-5">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h3 className="font-semibold">
						{t('personal.sessionsTitle')}
					</h3>
					{isFetching && (
						<Icon
							className="animate-spin text-base text-text-accent"
							icon="lucide:loader-circle"
						/>
					)}
				</div>
				<PersonalUploadModal
					detected={detected}
					mapName={mapName}
					mode={mode}
					onDateChange={setUploadDate}
					onFileChange={setUploadFile}
					onMapNameChange={setMapName}
					onModeChange={setMode}
					onOpenChange={handleOpenChange}
					onStageChange={setUploadStage}
					onTypeChange={handleTypeChange}
					onUpload={() =>
						uploadFile && uploadMutation.mutate(uploadFile)
					}
					open={uploadOpen}
					uploadDate={uploadDate}
					uploadFile={uploadFile}
					uploading={uploadMutation.isPending}
					uploadStage={uploadStage}
					uploadType={uploadType}
				/>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<Button
					className="font-semibold"
					key="all"
					onClick={() => setFilter('ALL')}
					size="sm"
					variant={filter === 'ALL' ? 'primary' : 'ghost'}
				>
					{t('clan.filters.ALL')}
				</Button>
				{STAGE_TYPES.map((stageType) => (
					<Button
						className="gap-2 font-semibold"
						key={stageType.value}
						onClick={() => setFilter(stageType.value)}
						size="sm"
						variant={
							filter === stageType.value ? 'primary' : 'ghost'
						}
					>
						<Icon className="text-base" icon={stageType.icon} />
						{t(stageType.label)}
					</Button>
				))}
			</div>

			{!sessions || sessions.length === 0 ? (
				<div className="flex flex-col items-center gap-2 rounded-xl bg-card px-5 py-6">
					<Icon className="text-4xl" icon="lucide:swords" />
					<h3 className="font-semibold text-lg">
						{t('personal.noSessions')}
					</h3>
					<p className="font-semibold text-md">
						{t('personal.noSessionsHint')}
					</p>
				</div>
			) : filtered.length === 0 ? (
				<div className="flex flex-col items-center gap-2 rounded-xl bg-card px-5 py-6">
					<Icon className="text-4xl" icon="lucide:filter-x" />
					<h3 className="font-semibold text-lg">
						{t('personal.noSessions')}
					</h3>
				</div>
			) : (
				<div className="flex flex-col gap-2">
					{filtered.map((session) => (
						<PersonalSessionRow
							key={session.id}
							onChanged={invalidate}
							session={session}
						/>
					))}
				</div>
			)}

			{isFetching && (
				<div className="flex flex-col gap-2">
					<Skeleton className="h-16 w-full" />
				</div>
			)}
		</Card.Root>
	)
}
