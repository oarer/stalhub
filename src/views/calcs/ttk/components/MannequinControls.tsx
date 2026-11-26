'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { mtsWide } from '@/app/fonts'
import { Card } from '@/components/ui/Card'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { getLocale } from '@/lib/getLocale'
import { useVisibleItems } from '@/lib/unoItems'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { useBuildStore } from '@/stores/useBuild.store'
import { useTTKStore } from '@/stores/useTTK.store'
import { messageToString } from '@/utils/itemUtils'

export function MannequinControls({ prime }: { prime: number }) {
	const locale = getLocale()
	const t = useTranslations()

	const platesQuery = useQuery(itemsQueries.get({ type: 'plates' }))
	const plates = useVisibleItems(platesQuery.data) ?? []
	const { savedBuilds } = useBuildStore()
	const {
		bulletRes,
		setBulletRes,
		vitality,
		setVitality,
		plateId,
		setPlateId,
		buildId,
		setBuildId,
	} = useTTKStore()

	const plateOptions = plates.map((p) => ({
		value: p.id,
		label: messageToString(p.name, locale),
	}))
	const buildOptions = savedBuilds.map((b) => ({
		value: b.id,
		label: b.name,
	}))

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-2">
				<Icon className="text-lg" icon="lucide:person-standing" />
				<p className={`${mtsWide.className} text-md font-semibold`}>
					{t('ttk.page.mannequin')}
				</p>
			</div>
			<Card.Root>
				<Card.Content className="flex flex-col gap-4">
					<div className="flex flex-col gap-1.5">
						<span className="text-xs text-neutral-500">
							{t('ttk.page.bullet_resistance')}
						</span>
						<Input
							className="h-10 w-full"
							disabled={!!buildId}
							min={0}
							onChange={(e) =>
								setBulletRes(
									Math.max(0, Number(e.target.value))
								)
							}
							type="number"
							value={bulletRes}
						/>
					</div>
					<div className="flex flex-col gap-1.5">
						<span className="text-xs text-neutral-500">
							{t('ttk.page.vitality')}
						</span>
						<Input
							className="h-10 w-full"
							disabled={!!buildId}
							min={0}
							onChange={(e) =>
								setVitality(Math.max(0, Number(e.target.value)))
							}
							type="number"
							value={vitality}
						/>
					</div>
					<div className="flex flex-col gap-1.5">
						<span className="text-xs text-neutral-500">
							{t('ttk.page.build')}
						</span>
						<Combobox
							onValueChange={(v) => setBuildId(v || null)}
							options={buildOptions}
							placeholder="ttk.page.combobox.build.placeholder"
							searchPlaceholder="ttk.page.combobox.build.search_placeholder"
							value={buildId ?? ''}
						/>
					</div>
					<div className="flex flex-col gap-1.5">
						<span className="text-xs text-neutral-500">
							{t('ttk.page.plate')}
						</span>
						<Combobox
							onValueChange={(v) => setPlateId(v)}
							options={plateOptions}
							placeholder="ttk.page.combobox.plate.search_placeholder"
							searchPlaceholder="ttk.page.combobox.plate.search_placeholder"
							value={plateId}
						/>
					</div>
					<div className="bg-muted flex items-center justify-between rounded-lg px-3 py-2">
						<span className="text-sm text-neutral-400">
							{t('build.stats.prime')}
						</span>
						<span className="text-primary font-mono text-sm font-semibold">
							{prime.toFixed(1)}
						</span>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	)
}
