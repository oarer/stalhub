'use client'

import { useTranslations } from 'next-intl'
import { Alert } from '@/components/ui/Alert'
import Input from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { useBuildStore } from '@/stores/useBuild.store'

export default function Settings() {
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

			<Input
				label="modals.builds.settings.armor_level"
				max={15}
				min={0}
				onChange={(e) => {
					const value = Number(e.target.value)

					setDefaults({
						armor: {
							level: value,
						},
					})
				}}
				type="number"
				value={defaults.armor.level}
			/>

			<Switch
				checked={(defaults.sicknessDisplay ?? 'new') === 'old'}
				label={t('modals.builds.settings.sickness_legacy')}
				onCheckedChange={(checked) =>
					setDefaults({
						sicknessDisplay: checked ? 'old' : 'new',
					})
				}
			/>
		</div>
	)
}
