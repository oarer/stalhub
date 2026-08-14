'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { numbersTxt } from '@/lib/time'

export function NameField({
	value,
	onChange,
	disabled,
	isPending,
	canSave,
	onSave,
	cooldownLeft,
}: {
	value: string
	onChange: (value: string) => void
	disabled: boolean
	isPending: boolean
	canSave: boolean
	onSave: () => void
	cooldownLeft: number
}) {
	const t = useTranslations()

	return (
		<div className="flex flex-col gap-2 rounded-lg bg-accent/50 p-4">
			<span className="font-semibold text-sm">
				{t('me.settings.name')}
			</span>
			<div className="flex items-center gap-2">
				<Input
					className={`${unbounded.className} max-w-55.5 flex-1 text-[15px]`}
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
					{t('me.settings.nameCooldown')}{' '}
					{numbersTxt(cooldownLeft, [
						t('time.day.one'),
						t('time.day.few'),
						t('time.day.many'),
					])}
				</p>
			)}
		</div>
	)
}
