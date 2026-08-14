'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import { Regions } from '@/types/api.type'
import { Section } from '../Section'

const regionOptions = Object.values(Regions).map((region) => ({
	value: region,
	label: 'region.' + region,
}))

interface RegionSectionProps {
	currentRegion: string | null | undefined
	isPending: boolean
	onChange: (region: string) => void
}

export function RegionSection({
	currentRegion,
	isPending,
	onChange,
}: RegionSectionProps) {
	const [region, setRegion] = useState<string>(currentRegion ?? '')
	const t = useTranslations()

	useEffect(() => {
		setRegion(currentRegion ?? '')
	}, [currentRegion])

	return (
		<Section icon="lucide:globe" title={t('me.settings.region')}>
			<div className="flex flex-col gap-3">
				<Alert.Root>
					<Alert.Description>
						{t('me.settings.regionDesc')}
					</Alert.Description>
				</Alert.Root>

				<div className="flex items-center justify-between gap-3 rounded-lg bg-border-secondary/40 px-4 py-3">
					<div className="flex flex-col gap-1">
						<span className="font-semibold text-sm">
							{t('me.settings.regionLabel')}
						</span>
						<span className="font-semibold text-sm text-text-accent">
							{currentRegion ? t('region.' + currentRegion) : '—'}
						</span>
					</div>
					<Combobox
						className="w-fit"
						onValueChange={setRegion}
						options={regionOptions}
						value={region}
					/>
				</div>

				<Button
					className="gap-2 self-start"
					disabled={isPending || region === currentRegion}
					loading={isPending}
					onClick={() => onChange(region)}
					type="button"
				>
					<Icon className="text-base" icon="lucide:refresh-cw" />
					{t('me.settings.regionButton')}
				</Button>
			</div>
		</Section>
	)
}
