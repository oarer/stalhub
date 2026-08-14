'use client'

import { DiscordBotSection } from './components/settings/DiscordBotSection'
import { FreezeSection } from './components/settings/FreezeSection'
import { PublicProfileSection } from './components/settings/PublicProfileSection'
import { RecruitingSection } from './components/settings/RecruitingSection'
import { ScheduleSection } from './components/settings/ScheduleSection'
import { SyncSection } from './components/settings/SyncSection'
import { useClanSettings } from './hooks/useClanSettings'

export default function ClanSettingsView() {
	const {
		isLeader,
		isOfficer,
		isPublic,
		recruiting,
		schedule,
		guilds,
		linkToken,
		togglePublic,
		toggleRecruiting,
		setScheduleField,
		saveSchedule,
		sync,
		freeze,
		generateBotToken,
		unlinkBot,
		closeBotToken,
		isPublicPending,
		isRecruitingPending,
		isSchedulePending,
		isSyncPending,
		isFreezePending,
		isBotLinkPending,
		unlinkPendingId,
	} = useClanSettings()

	return (
		<div className="flex flex-col gap-4">
			<PublicProfileSection
				isPending={isPublicPending}
				isPublic={isPublic}
				onToggle={togglePublic}
			/>
			{isOfficer && (
				<SyncSection isPending={isSyncPending} onSync={sync} />
			)}
			{isOfficer && (
				<DiscordBotSection
					guilds={guilds}
					isLinkPending={isBotLinkPending}
					linkToken={linkToken}
					onCloseToken={closeBotToken}
					onGenerate={generateBotToken}
					onUnlink={unlinkBot}
					unlinkPendingId={unlinkPendingId}
				/>
			)}
			{isLeader && (
				<ScheduleSection
					isPending={isSchedulePending}
					onFieldChange={setScheduleField}
					onSave={saveSchedule}
					schedule={schedule}
				/>
			)}
			{isLeader && (
				<RecruitingSection
					isPending={isRecruitingPending}
					onToggle={toggleRecruiting}
					recruiting={recruiting}
				/>
			)}
			{isLeader && (
				<FreezeSection
					isPending={isFreezePending}
					onFreeze={freeze}
				/>
			)}
		</div>
	)
}
