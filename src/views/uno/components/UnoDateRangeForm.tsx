'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import type { UnoDateRangeParams } from '@/types/uno/uno.type'
import { UNO_MODE_KEYS } from '../utils/uno.const'

const MODE_OPTIONS: ComboboxOption[] = [
	{ value: '', label: 'uno.filters.allModes' },
	{ value: 'brawl', label: 'uno.' + UNO_MODE_KEYS.brawl },
	{ value: 'tournament', label: 'uno.' + UNO_MODE_KEYS.tournament },
	{ value: 'base_capture', label: 'uno.' + UNO_MODE_KEYS.base_capture },
]

export function UnoDateRangeForm({
	action,
	params,
}: {
	action: string
	params: UnoDateRangeParams
}) {
	const t = useTranslations('uno')
	const [mode, setMode] = useState(params.mode ?? '')

	return (
		<form action={action} method="get">
			<input name="mode" type="hidden" value={mode} />
			<Card.Root className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
				<Input
					className="h-10 pt-3"
					containerClass="min-w-0"
					label="uno.filters.from"
					name="from"
					type="date"
					value={params.from ?? ''}
				/>
				<Input
					className="h-10 pt-3"
					containerClass="min-w-0"
					label="uno.filters.to"
					name="to"
					type="date"
					value={params.to ?? ''}
				/>
				<Input
					className="h-10 pt-3"
					containerClass="min-w-0"
					label="uno.filters.date"
					name="date"
					type="date"
					value={params.date ?? ''}
				/>
				<Combobox
					onValueChange={setMode}
					options={MODE_OPTIONS}
					placeholder="uno.filters.allModes"
					value={mode}
				/>
				<Input
					className="h-10 pt-3"
					containerClass="min-w-0"
					label="uno.filters.season"
					name="season"
					value={params.season ?? ''}
				/>
				<Button className="self-end" type="submit">
					{t('filters.apply')}
				</Button>
			</Card.Root>
		</form>
	)
}
