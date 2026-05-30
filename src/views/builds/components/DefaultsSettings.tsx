'use client'

import { useTranslations } from 'next-intl'
import { Alert } from '@/components/ui/Alert'
import Input from '@/components/ui/Input'
import { useBuildStore } from '@/stores/useBuild.store'

export default function DefaultsSettings() {
	const { defaults, setDefaults } = useBuildStore()
	const t = useTranslations()

	return (
		<div className="flex flex-col gap-4">
			<Alert.Root variant={'success'}>
				<Alert.Title className="text-md">
					{t('modals.builds.settings.auto_save')}
				</Alert.Title>
			</Alert.Root>
			<Input
				label="modals.builds.settings.percent"
				max={190}
				min={85}
				onChange={(e) => {
					const value = Number(e.target.value)

					setDefaults({
						art: {
							...defaults.art,
							percent: value,
						},
					})
				}}
				type="number"
				value={defaults.art.percent}
			/>

			<Input
				label="modals.builds.settings.potential"
				max={15}
				min={0}
				onChange={(e) => {
					const value = Number(e.target.value)

					setDefaults({
						art: {
							...defaults.art,
							potential: value,
						},
					})
				}}
				type="number"
				value={defaults.art.potential}
			/>
		</div>
	)
}
