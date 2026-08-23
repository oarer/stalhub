'use client'

import { Icon } from '@iconify/react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@/components/ui/Skeleton'
import { clanQueries } from '@/queries/clan/clan.queries'
import type { UserClanProfile } from '@/types/clan/clan.type'
import { SessionRow } from './components/sessions/SessionRow'
import { UploadScreenshotModal } from './components/sessions/UploadScreenshotModal'
import { useScreenshotUpload } from './hooks/useScreenshotUpload'

export default function ClanSessionsView() {
	const { data: profile } = useSuspenseQuery(clanQueries.getMe())
	const clanId = profile?.clan?.id
	if (!clanId) return null
	return <ClanSessionsContent clanId={clanId} profile={profile} />
}

function ClanSessionsContent({
	clanId,
	profile,
}: {
	clanId: string
	profile: UserClanProfile
}) {
	const t = useTranslations()
	const { data: sessions, isLoading, isFetching } = useQuery(
		clanQueries.getSessions(clanId)
	)
	const {
		uploadOpen,
		uploadType,
		uploadStage,
		uploadDate,
		uploadFiles,
		uploading,
		detected,
		setUploadDate,
		setUploadFiles,
		setUploadStage,
		handleUploadOpenChange,
		handleTypeChange,
		invalidateSessions,
		uploadMutation,
	} = useScreenshotUpload(profile)

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				{[...Array(3)].map((_, i) => (
					<Skeleton className="h-24 w-full" key={i} />
				))}
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h1 className="font-bold text-2xl">
						{t('clan.sessions.title')}
					</h1>
					{isFetching && (
						<Icon
							className="animate-spin text-base text-text-accent"
							icon="lucide:loader-circle"
						/>
					)}
				</div>
				<UploadScreenshotModal
					detected={detected}
					onDateChange={setUploadDate}
					onFilesChange={setUploadFiles}
					onOpenChange={handleUploadOpenChange}
					onStageChange={setUploadStage}
					onTypeChange={handleTypeChange}
					onUpload={() =>
						uploadFiles && uploadMutation.mutate(uploadFiles)
					}
					open={uploadOpen}
					uploadDate={uploadDate}
					uploadFiles={uploadFiles}
					uploading={uploading || uploadMutation.isPending}
					uploadStage={uploadStage}
					uploadType={uploadType}
				/>
			</div>

			{!sessions || sessions.length === 0 ? (
				<div className="flex flex-col items-center gap-2 rounded-xl bg-card px-5 py-4">
					<Icon className="text-4xl" icon="lucide:swords" />
					<h3 className="font-semibold text-lg">
						{t('clan.common.noGames')}
					</h3>
					<p className="font-semibold text-md">
						{t('clan.sessions.noGamesDesc')}
					</p>
				</div>
			) : (
				sessions.map((session) => (
					<SessionRow
						key={session.id}
						onUpload={invalidateSessions}
						session={session}
					/>
				))
			)}
		</div>
	)
}
