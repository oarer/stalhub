'use client'

import { Icon } from '@iconify/react'
import { unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useTTKStore } from '@/stores/useTTK.store'
import { messageToString } from '@/utils/itemUtils'
import { MannequinControls } from './components/MannequinControls'
import { TTKChart } from './components/TTKChart'
import { TTKSummaryTable } from './components/TTKSummaryTable'
import { WeaponSlotCard } from './components/WeaponSlotCard'
import { WeaponStatsPanel } from './components/WeaponStatsPanel'
import { COLORS } from './constants/ttk'
import { HitZoneButtons } from './components/HitZoneButtons'
import { useTTKData } from './hooks/useTTKData'
import { useTTKComputations } from './hooks/useTTKComputations'
import { useTTKWeaponSlots } from './hooks/useTTKWeaponSlots'

export function TTKView() {
	const ttkData = useTTKData()
	const { locale, t, allAmmo } = ttkData
	const {
		weaponMap,
		ammoMap,
		ammoByType,
		weaponOptions,
		prime,
		focusedSlot,
		focusedWeapon,
		focusedAmmo,
		focusedItemColor,
		ttkSeries,
		summaryRows,
		maxDist,
	} = useTTKComputations(ttkData)

	const { setHitZone, hitZone } = useTTKStore()
	const {
		slots,
		pendingSlotId,
		updateSlot,
		handleWeaponSelect,
		addSlot,
		removeSlot,
		setFocusedSlotId,
	} = useTTKWeaponSlots(weaponMap, ammoByType)

	return (
		<section className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pt-32 pb-12 lg:pt-36">
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<MannequinControls prime={prime} />

				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-2">
						<Icon className="text-lg" icon="lucide:crosshair" />
						<p
							className={`${unbounded.className} font-semibold text-lg`}
						>
							{t('ttk.page.weapon')}
						</p>
					</div>
					<div className="flex flex-col gap-3">
						{slots.map((slot, i) => {
							const weapon = weaponMap.get(slot.weaponId) ?? null
							const ammo = ammoMap.get(slot.ammoId) ?? null
							const isFocused = focusedSlot?.id === slot.id

							return (
								<WeaponSlotCard
									allAmmo={allAmmo}
									ammo={ammo}
									autoOpenWeaponModal={
										pendingSlotId === slot.id
									}
									color={COLORS[i % COLORS.length]}
									isFocused={isFocused}
									key={slot.id}
									onAmmoSelect={(v) =>
										updateSlot(slot.id, { ammoId: v })
									}
									onBurstRofToggle={() =>
										updateSlot(slot.id, {
											useBurstRof: !slot.useBurstRof,
										})
									}
									onFocus={() =>
										slot.weaponId &&
										setFocusedSlotId(slot.id)
									}
									onRemove={() => removeSlot(slot.id)}
									onVariantChange={(v) =>
										updateSlot(slot.id, { variantIndex: v })
									}
									onWeaponSelect={(v) =>
										handleWeaponSelect(slot.id, v)
									}
									showRemove={slots.length > 1}
									slot={slot}
									weapon={weapon}
									weaponOptions={weaponOptions}
								/>
							)
						})}
						{slots.length < 8 && (
							<Button
								className="flex items-center gap-2 rounded-xl"
								onClick={addSlot}
								type="button"
								variant={'outline'}
							>
								<Icon
									className="text-neutral-400"
									icon="lucide:plus"
								/>
								<p className="font-semibold text-neutral-400">
									{t('ttk.page.weapon_add')}
								</p>
							</Button>
						)}
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-2">
						<Icon className="text-lg" icon="lucide:bar-chart-2" />
						<p
							className={`${unbounded.className} font-semibold text-lg`}
							style={{ color: focusedItemColor }}
						>
							{focusedWeapon
								? messageToString(focusedWeapon.name, locale)
								: t('ttk.page.weapon_pick')}
						</p>
					</div>
					<Card.Root>
						<Card.Content>
							{focusedWeapon && focusedSlot ? (
								<WeaponStatsPanel
									ammo={focusedAmmo}
									hitZone={hitZone}
									useBurstRof={focusedSlot.useBurstRof}
									variantIndex={focusedSlot.variantIndex}
									weapon={focusedWeapon}
								/>
							) : (
								<p className="py-4 text-center text-neutral-500 text-sm">
									{t('ttk.page.weapon_pick')}
								</p>
							)}
						</Card.Content>
					</Card.Root>
				</div>
			</div>

			{ttkSeries.length > 0 && (
				<TTKSummaryTable maxDist={maxDist} rows={summaryRows} />
			)}

			{ttkSeries.length > 0 && (
				<Card.Root>
					<HitZoneButtons hitZone={hitZone} onChange={setHitZone} />
					<Card.Content className="h-72 font-semibold">
						<TTKChart maxDist={maxDist} series={ttkSeries} />
					</Card.Content>
				</Card.Root>
			)}
		</section>
	)
}
