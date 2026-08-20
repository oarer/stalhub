'use client'

import { ConsumablesSection } from './components/settings/ConsumablesSection'
import { DiscordBotSection } from './components/settings/DiscordBotSection'
import { FreezeSection } from './components/settings/FreezeSection'
import { PublicProfileSection } from './components/settings/PublicProfileSection'
import { RecruitingSection } from './components/settings/RecruitingSection'
import { ScheduleSection } from './components/settings/ScheduleSection'
import { SyncSection } from './components/settings/SyncSection'
import { useClanSettings } from './hooks/useClanSettings'

export default function ClanSettingsView() {
	const {
		settings,
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
		setBoostMode,
		setGrenadeMode,
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
			{isOfficer && (
				<PublicProfileSection
					isPending={isPublicPending}
					isPublic={isPublic}
					onToggle={togglePublic}
				/>
			)}
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
			{isOfficer && (
				<RecruitingSection
					isPending={isRecruitingPending}
					onToggle={toggleRecruiting}
					recruiting={recruiting}
				/>
			)}
			{isLeader && (
				<ConsumablesSection
					boostMode={settings.boost_mode}
					grenadeMode={settings.grenade_mode}
					onSetBoostMode={setBoostMode}
					onSetGrenadeMode={setGrenadeMode}
				/>
			)}
			{isLeader && (
				<FreezeSection isPending={isFreezePending} onFreeze={freeze} />
			)}
		</div>
	)
}
