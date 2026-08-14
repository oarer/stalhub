'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import type { Layout } from '@/types/user.type'
import { Section } from '../Section'
import { findLabel, LAYOUT_TYPES } from './constants'
import { OptionDropdown } from './OptionDropdown'
import { SettingRow } from './SettingRow'

export function PersonalizationSection({
	publicProfileChecked,
	loadoutIsPublic,
	layout,
	onTogglePublicProfile,
	onToggleLoadoutPublic,
	onLayoutChange,
	onOpenLoadoutEditor,
	onOpenBannerEditor,
}: {
	publicProfileChecked: boolean | null | undefined
	loadoutIsPublic: boolean
	layout: Layout
	onTogglePublicProfile: () => void
	onToggleLoadoutPublic: (checked: boolean) => void
	onLayoutChange: (layout: Layout) => void
	onOpenLoadoutEditor: () => void
	onOpenBannerEditor: () => void
}) {
	const t = useTranslations()

	return (
		<Section
			icon="lucide:paintbrush"
			title={t('me.settings.personalization')}
		>
			<div className="flex flex-col gap-2">
				<SettingRow
					description={t('me.settings.publicProfileDesc')}
					title={t('me.settings.publicProfile')}
				>
					<Switch
						checked={Boolean(publicProfileChecked)}
						onCheckedChange={onTogglePublicProfile}
					/>
				</SettingRow>
				<SettingRow
					description={t('me.settings.showLoadoutDesc')}
					title={t('me.settings.showLoadout')}
				>
					<Switch
						checked={loadoutIsPublic}
						onCheckedChange={onToggleLoadoutPublic}
					/>
				</SettingRow>
				<SettingRow
					description={t('me.settings.editLoadoutDesc')}
					title={t('me.settings.editLoadout')}
				>
					<Button
						onClick={onOpenLoadoutEditor}
						size="sm"
						variant="ghost"
					>
						<Icon className="text-xl" icon="lucide:pencil" />
					</Button>
				</SettingRow>
				<SettingRow
					description={t('me.settings.profileLayoutDesc')}
					title={t('me.settings.profileLayout')}
				>
					<OptionDropdown
						onSelect={onLayoutChange}
						options={LAYOUT_TYPES}
						title={t(
							findLabel(
								LAYOUT_TYPES,
								layout,
								'me.settings.layoutClassic'
							)
						)}
						value={layout}
					/>
				</SettingRow>
				<SettingRow
					description={t('me.settings.bannerDesc')}
					title={t('me.settings.banner')}
				>
					<Button
						onClick={onOpenBannerEditor}
						size="sm"
						variant="ghost"
					>
						<Icon className="text-xl" icon="lucide:pencil" />
					</Button>
				</SettingRow>
			</div>
		</Section>
	)
}
