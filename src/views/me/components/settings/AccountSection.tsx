'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import type { User } from '@/types/user.type'
import { Section } from '../Section'
import { NameField } from './NameField'
import { UsernameField } from './UsernameField'

const CHANGE_COOLDOWN_DAYS = 30
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,32}$/

const getCooldownDaysLeft = (changedAt: string | null | undefined): number => {
	if (!changedAt) return 0

	const daysSince = Math.floor(
		(Date.now() - new Date(changedAt).getTime()) / (1000 * 60 * 60 * 24)
	)

	return Math.max(0, CHANGE_COOLDOWN_DAYS - daysSince)
}

export function AccountSection({
	user,
	isPending,
	onSaveName,
	onSaveUsername,
}: {
	user: User
	isPending: boolean
	onSaveName: (name: string) => void
	onSaveUsername: (username: string) => void
}) {
	const t = useTranslations()
	const [nameDraft, setNameDraft] = useState(user.name ?? '')
	const [usernameDraft, setUsernameDraft] = useState(user.username)

	useEffect(() => {
		setNameDraft(user.name ?? '')
		setUsernameDraft(user.username)
	}, [user.name, user.username])

	const nameCooldownLeft = getCooldownDaysLeft(user.name_changed_at)
	const usernameCooldownLeft = getCooldownDaysLeft(user.username_changed_at)
	const usernameDraftValid = USERNAME_PATTERN.test(usernameDraft)

	return (
		<Section icon="lucide:user" title={t('me.settings.account')}>
			<div className="flex flex-col gap-2">
				<NameField
					canSave={
						nameDraft.trim() === '' ||
						nameDraft === (user.name ?? '')
					}
					cooldownLeft={nameCooldownLeft}
					disabled={isPending || nameCooldownLeft > 0}
					isPending={isPending}
					onChange={setNameDraft}
					onSave={() => onSaveName(nameDraft.trim())}
					value={nameDraft}
				/>
				<UsernameField
					canSave={
						!usernameDraftValid || usernameDraft === user.username
					}
					cooldownLeft={usernameCooldownLeft}
					disabled={isPending || usernameCooldownLeft > 0}
					invalid={
						usernameCooldownLeft === 0 &&
						!usernameDraftValid &&
						usernameDraft !== user.username
					}
					isPending={isPending}
					onChange={setUsernameDraft}
					onSave={() => onSaveUsername(usernameDraft)}
					value={usernameDraft}
				/>
			</div>
		</Section>
	)
}
