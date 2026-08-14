'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { buildApiQueries } from '@/queries/build-api/build-api.queries'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { loadoutQueries } from '@/queries/loadout/loadout.queries'
import { userQueries } from '@/queries/user/user.queries'
import type { Layout } from '@/types/user.type'
import { AccountSection } from './components/settings/AccountSection'
import { BannerEditorModal } from './components/settings/BannerEditorModal'
import { DangerZoneSection } from './components/settings/DangerZoneSection'
import { DeleteAccountModal } from './components/settings/DeleteAccountModal'
import { LinkedAccountsSection } from './components/settings/LinkedAccountsSection'
import { PersonalizationSection } from './components/settings/PersonalizationSection'
import { RegionSection } from './components/settings/RegionSection'
import { SessionsSection } from './components/settings/SessionsSection'
import { LoadoutEditorModal } from './components/LoadoutEditorModal'
import { useSettingsMutations } from './hooks/useSettingsMutations'

export default function MeSettingsView() {
	const { data: user } = useSuspenseQuery(userQueries.getMe())
	const { data: settings } = useSuspenseQuery(userQueries.getSettings())
	const { data: sessions } = useSuspenseQuery(userQueries.getSessions())
	const { data: loadout } = useSuspenseQuery(loadoutQueries.getOne(user.id))
	const { data: weapons } = useSuspenseQuery(
		itemsQueries.get({ type: 'weapons' })
	)
	const { data: armors } = useSuspenseQuery(
		itemsQueries.get({ type: 'armor' })
	)
	const { data: builds } = useSuspenseQuery(
		buildApiQueries.list({ take: 500 })
	)

	const {
		updateMutation,
		profileMutation,
		bannerMutation,
		layoutMutation,
		regionMutation,
		uploadBannerMutation,
		saveLoadoutMutation,
		toggleLoadoutPublicMutation,
		deleteSessionMutation,
		deleteAllSessionsMutation,
		linkMutation,
		unlinkMutation,
		deleteAccountMutation,
	} = useSettingsMutations(loadout)

	const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)
	const [isLoadoutEditorOpen, setIsLoadoutEditorOpen] = useState(false)
	const [isBannerEditorOpen, setIsBannerEditorOpen] = useState(false)

	const layout = (user.customization?.layout ?? 'CLASSIC') as Layout
	const bannerMode = user.customization?.bannerMode ?? 'NONE'
	const bannerType = user.customization?.bannerType ?? 'BACKGROUND'
	const bannerColor = user.customization?.bannerColor ?? '#000000'

	return (
		<div className="flex flex-col gap-4">
			<PersonalizationSection
				layout={layout}
				loadoutIsPublic={loadout?.is_public ?? false}
				onLayoutChange={(value) =>
					layoutMutation.mutate({ layout: value })
				}
				onOpenBannerEditor={() => setIsBannerEditorOpen(true)}
				onOpenLoadoutEditor={() => setIsLoadoutEditorOpen(true)}
				onToggleLoadoutPublic={(checked) =>
					toggleLoadoutPublicMutation.mutate(checked)
				}
				onTogglePublicProfile={() =>
					updateMutation.mutate({
						public_profile: !settings?.public_profile,
					})
				}
				publicProfileChecked={user.settings?.public_profile}
			/>
			<AccountSection
				isPending={profileMutation.isPending}
				onSaveName={(name) => profileMutation.mutate({ name })}
				onSaveUsername={(username) =>
					profileMutation.mutate({ username })
				}
				user={user}
			/>
			{user.providers.exbo && (
				<RegionSection
					currentRegion={settings.region}
					isPending={regionMutation.isPending}
					onChange={(region) => regionMutation.mutate(region)}
				/>
			)}
			<LinkedAccountsSection
				onLink={(provider) => linkMutation.mutate(provider)}
				onUnlink={(provider) => unlinkMutation.mutate(provider)}
				providers={user.providers}
			/>
			<SessionsSection
				onDelete={(id) => deleteSessionMutation.mutate(id)}
				onDeleteAll={() => deleteAllSessionsMutation.mutate()}
				sessions={sessions}
			/>
			<DangerZoneSection
				onDeleteClick={() => setIsDeleteAccountOpen(true)}
			/>

			<BannerEditorModal
				banner={{
					mode: bannerMode,
					type: bannerType,
					color: bannerColor,
				}}
				isUploading={uploadBannerMutation.isPending}
				onColorChange={(color) =>
					bannerMutation.mutate({ bannerColor: color })
				}
				onModeChange={(mode) =>
					bannerMutation.mutate({ bannerMode: mode })
				}
				onOpenChange={setIsBannerEditorOpen}
				onTypeChange={(type) =>
					bannerMutation.mutate({ bannerType: type })
				}
				onUpload={(file) => uploadBannerMutation.mutate(file)}
				open={isBannerEditorOpen}
			/>
			<DeleteAccountModal
				onDelete={() => deleteAccountMutation.mutate()}
				onOpenChange={setIsDeleteAccountOpen}
				open={isDeleteAccountOpen}
				username={user.username}
			/>
			<LoadoutEditorModal
				armors={armors ?? []}
				builds={(builds?.data ?? []).filter(
					(b) => b.author.id === user.id
				)}
				isPending={saveLoadoutMutation.isPending}
				loadout={loadout}
				onOpenChange={setIsLoadoutEditorOpen}
				onSave={(data) => saveLoadoutMutation.mutate(data)}
				open={isLoadoutEditorOpen}
				weapons={weapons ?? []}
			/>
		</div>
	)
}
