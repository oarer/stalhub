'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { type CSSProperties, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { getLocale } from '@/lib/getLocale'
import type { WeaponSlot } from '@/stores/useTTK.store'
import { InfoColor, infoColorMap, type Item } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'
import { ItemPickerModal } from '@/views/calcs/builds/lite/components/ItemPickerModal'
import { CUSTOM_ROF_MAP } from '../constants/ttk'
import { getAmmoType, getCompatibleAmmo } from '../utils'
import { montserrat } from '@/app/fonts'
import { cn } from '@/lib/cn'

interface WeaponSlotCardProps {
	slot: WeaponSlot
	weapon: Item | null
	ammo: Item | null
	allAmmo: Item[]
	weaponOptions: Item[]
	color: string
	isFocused: boolean
	autoOpenWeaponModal?: boolean
	onFocus: () => void
	onWeaponSelect: (weaponId: string) => void
	onAmmoSelect: (ammoId: string) => void
	onVariantChange: (variantIndex: number) => void
	onBurstRofToggle: () => void
	onRemove: () => void
	showRemove: boolean
}

export function WeaponSlotCard({
	slot,
	weapon,
	ammo,
	allAmmo,
	weaponOptions,
	color,
	isFocused,
	autoOpenWeaponModal,
	onFocus,
	onWeaponSelect,
	onAmmoSelect,
	onVariantChange,
	onBurstRofToggle,
	onRemove,
	showRemove,
}: WeaponSlotCardProps) {
	const [showWeaponModal, setShowWeaponModal] = useState(false)
	const [weaponPreviewId, setWeaponPreviewId] = useState<string | null>(null)
	const [showAmmoModal, setShowAmmoModal] = useState(false)
	const [ammoPreviewId, setAmmoPreviewId] = useState<string | null>(null)

	const ammoTypeKey = useMemo(
		() => (weapon ? getAmmoType(weapon) : ''),
		[weapon]
	)
	const compatibleAmmo = useMemo(
		() => (weapon ? getCompatibleAmmo(allAmmo, ammoTypeKey) : []),
		[weapon, allAmmo, ammoTypeKey]
	)

	const locale = getLocale()
	const t = useTranslations()

	useEffect(() => {
		if (autoOpenWeaponModal) {
			setWeaponPreviewId(slot.weaponId || null)
			setShowWeaponModal(true)
		}
	}, [autoOpenWeaponModal, slot.weaponId])

	const weaponIconUrl = useMemo(
		() =>
			weapon
				? `https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons/${weapon.category}/${weapon.id}.png`
				: null,
		[weapon]
	)
	const ammoIconUrl = useMemo(
		() =>
			ammo
				? `https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons/bullet/${ammo.id}.png`
				: null,
		[ammo]
	)

	return (
		<>
			<Card.Root
				className="p-3 transition-all"
				onClick={onFocus}
				style={
					isFocused
						? ({
							'--tw-ring-color': color + '80',
						} as CSSProperties)
						: {}
				}
			>
				<Card.Content className="flex min-w-0 gap-3">
					{weapon && weaponIconUrl && (
						<div className="flex h-21.5 w-21.5 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background">
							<Image
								alt={messageToString(weapon.name, locale)}
								className="h-full w-full object-contain p-2"
								height={68}
								src={weaponIconUrl}
								width={68}
							/>
						</div>
					)}

					<div className="min-w-0 flex-1 space-y-2">
						<div className="flex min-w-0 gap-2">
							<Button
								className="min-w-0 flex-1 justify-between gap-2 rounded-lg px-2 py-1.5"
								onClick={() => {
									setWeaponPreviewId(slot.weaponId || null)
									setShowWeaponModal(true)
									if (slot.weaponId) onFocus()
								}}

								variant="outline"
							>
								<span
									className={`${montserrat.className} min-w-0 truncate font-semibold text-sm`}
									style={{
										color: infoColorMap[
											weapon?.color as InfoColor
										],
									}}
								>
									{weapon
										? messageToString(weapon.name, locale)
										: t('ttk.page.weapon_pick')}
								</span>

								<Icon
									className="shrink-0 text-text-accent text-xs"
									icon="lucide:chevron-down"
								/>
							</Button>

							{showRemove && (
								<Button
									className="p-2 ring-transparent"
									onClick={(e) => {
										e.stopPropagation()
										onRemove()
									}}
									variant="danger"
								>
									<Icon className="text-lg" icon="lucide:x" />
								</Button>
							)}
						</div>

						{weapon && CUSTOM_ROF_MAP[weapon.id] && (
							<div className="flex items-center gap-1 rounded-lg ring-2 ring-border-secondary p-1">
								<Button
									onClick={() => {
										if (slot.useBurstRof) onBurstRofToggle()
									}}
									className={cn(
										'font-semibold text-sm w-full',
										!slot.useBurstRof
											? 'bg-border/40 dark:text-neutral-200'
											: 'hover:text-neutral-200'
									)}
									variant="ghost"
								>
									{t('ttk.page.fire.auto')}
								</Button>

								<Button
									onClick={() => {
										if (!slot.useBurstRof) onBurstRofToggle()
									}}
									className={cn(
										'font-semibold text-sm w-full',
										slot.useBurstRof
											? 'bg-border/40 dark:text-neutral-200'
											: 'hover:text-neutral-200'
									)}
									variant="ghost"
								>
									{t('ttk.page.fire.burst')}
								</Button>
							</div>
						)}

						{weapon &&
							(compatibleAmmo.length === 1 ? (
								<div className="flex min-w-0 items-center gap-2 rounded-lg border-2 border-border/40 bg-background px-2 py-1.5 text-xs">
									<Icon
										className="shrink-0 text-text-accent"
										icon="lucide:zap"
									/>
									<span className="min-w-0 truncate font-semibold">
										{messageToString(
											compatibleAmmo[0].name,
											locale
										)}
									</span>
								</div>
							) : (
								<div className="flex min-w-0 gap-2">
									<Button
										className="min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5"
										onClick={() => {
											setAmmoPreviewId(
												slot.ammoId || null
											)
											setShowAmmoModal(true)
										}}
										variant="outline"
									>
										<div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md">
											{ammoIconUrl && ammo ? (
												<Image
													alt=""
													className="h-full w-full object-contain"
													height={24}
													src={ammoIconUrl}
													width={24}
												/>
											) : (
												<Icon
													className="text-text-accent"
													icon="lucide:zap"
												/>
											)}
										</div>

										<span
											className={`min-w-0 truncate text-sm font-semibold ${!ammo ? 'text-text-accent' : ''
												}`}
										>
											{ammo
												? messageToString(
													ammo.name,
													locale
												)
												: t('ttk.page.default_ammo')}
										</span>

										<Icon
											className="shrink-0 text-text-accent"
											icon="lucide:chevron-down"
										/>
									</Button>

									<Input
										className="w-20 shrink-0 rounded-lg border-border-secondary"
										label="ui.input_sharpening"
										max={15}
										min={0}
										onChange={(e) =>
											onVariantChange(
												Number(e.target.value)
											)
										}
										type="number"
										value={slot.variantIndex}
									/>
								</div>
							))}
					</div>
				</Card.Content>
			</Card.Root>

			<ItemPickerModal
				emptyTitle="ttk.page.weapon_pick"
				favoriteType="weapon"
				items={weaponOptions}
				locale={locale}
				onConfirm={(itemId) => {
					onWeaponSelect(itemId)
					onFocus()
					setShowWeaponModal(false)
					setWeaponPreviewId(null)
				}}
				previewId={weaponPreviewId}
				searchLabel="ui.input_label"
				setPreviewId={setWeaponPreviewId}
				setShowModal={setShowWeaponModal}
				showModal={showWeaponModal}
				title="ttk.page.weapon_pick"
			/>

			<ItemPickerModal
				emptyTitle="ttk.page.ammo_pick"
				favoriteType="ammo"
				items={compatibleAmmo}
				locale={locale}
				onConfirm={(itemId) => {
					onAmmoSelect(itemId)
					setShowAmmoModal(false)
					setAmmoPreviewId(null)
				}}
				previewId={ammoPreviewId}
				searchLabel="ui.input_label"
				setPreviewId={setAmmoPreviewId}
				setShowModal={setShowAmmoModal}
				showModal={showAmmoModal}
				title="ttk.page.ammo_pick"
			/>
		</>
	)
}
