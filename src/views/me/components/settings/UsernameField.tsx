'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { numbersTxt } from '@/lib/time'

export function UsernameField({
	value,
	onChange,
	disabled,
	isPending,
	canSave,
	onSave,
	cooldownLeft,
	invalid,
}: {
	value: string
	onChange: (value: string) => void
	disabled: boolean
	isPending: boolean
	canSave: boolean
	onSave: () => void
	cooldownLeft: number
	invalid: boolean
}) {
	const t = useTranslations()

	return (
		<div className="flex flex-col gap-2 rounded-lg bg-accent/50 p-4">
			<span className="font-semibold text-sm">
				{t('me.settings.username')}
			</span>
			<div className="flex items-center gap-2">
				<Input
					className="max-w-64 flex-1 text-[15px]"
					disabled={disabled}
					onChange={(e) => onChange(e.target.value)}
					value={value}
				/>
				<Button
					disabled={canSave}
					loading={isPending}
					onClick={onSave}
					size="md"
					variant="secondary"
				>
					<Icon className="text-lg" icon="lucide:check" />
				</Button>
			</div>
			{cooldownLeft > 0 && (
				<p className="font-semibold text-text-accent text-xs">
					{t('me.settings.usernameCooldown')}{' '}
					{numbersTxt(cooldownLeft, [
						t('time.day.one'),
						t('time.day.few'),
						t('time.day.many'),
					])}
				</p>
			)}
			{invalid && (
				<p className="font-semibold text-destructive text-xs">
					{t('me.settings.usernameInvalid')}
				</p>
			)}
		</div>
	)
}
