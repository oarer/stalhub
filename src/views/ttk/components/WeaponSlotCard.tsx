'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState, type CSSProperties } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { getLocale } from '@/lib/getLocale'
import type { WeaponSlot } from '@/stores/useTTK.store'
import type { Item } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'
import { ItemPickerModal } from '@/views/builds/lite/components/ItemPickerModal'
import { getAmmoType, getCompatibleAmmo } from '../utils/weaponStats'

interface WeaponSlotCardProps {
	slot: WeaponSlot
	weapon: Item | null
	ammo: Item | null
	allAmmo: Item[]
	weaponOptions: Item[]
	color: string
	isFocused: boolean
	onFocus: () => void
	onWeaponSelect: (weaponId: string) => void
	onAmmoSelect: (ammoId: string) => void
	onVariantChange: (variantIndex: number) => void
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
	onFocus,
	onWeaponSelect,
	onAmmoSelect,
	onVariantChange,
	onRemove,
	showRemove,
}: WeaponSlotCardProps) {
	const [showWeaponModal, setShowWeaponModal] = useState(false)
	const [weaponPreviewId, setWeaponPreviewId] = useState<string | null>(null)
	const [showAmmoModal, setShowAmmoModal] = useState(false)
	const [ammoPreviewId, setAmmoPreviewId] = useState<string | null>(null)

	const ammoTypeKey = weapon ? getAmmoType(weapon) : ''
	const compatibleAmmo = weapon ? getCompatibleAmmo(allAmmo, ammoTypeKey) : []

	const locale = getLocale()
	const t = useTranslations()

	const weaponIconUrl = weapon
		? `https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons/${weapon.category}/${weapon.id}.png`
		: null
	const ammoIconUrl = ammo
		? `https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons/bullet/${ammo.id}.png`
		: null

	return (
		<>
			<Card.Root
				className={`flex flex-col gap-4 rounded-xl p-3 transition-all`}
				onClick={onFocus}
				style={
					isFocused
						? ({
								'--tw-ring-color': color + '80',
							} as CSSProperties)
						: {}
				}
			>
				<Card.Header className="flex flex-row items-center gap-2">
					<Button
						className="flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5"
						onClick={() => {
							setWeaponPreviewId(slot.weaponId || null)
							setShowWeaponModal(true)
							if (slot.weaponId) onFocus()
						}}
						type="button"
						variant={'outline'}
					>
						{weapon && weaponIconUrl ? (
							<Image
								alt=""
								className="shrink-0 object-contain"
								height={24}
								onError={(e) => {
									;(
										e.target as HTMLImageElement
									).style.display = 'none'
								}}
								src={weaponIconUrl}
								width={24}
							/>
						) : (
							<Icon
								className="shrink-0 text-neutral-500 text-sm"
								icon="lucide:crosshair"
							/>
						)}
						<p className="truncate font-semibold text-sm">
							{weapon
								? messageToString(weapon.name, locale)
								: t('ttk.page.weapon_pick')}
						</p>
						<Icon
							className="ml-auto shrink-0 text-neutral-500 text-xs"
							icon="lucide:chevron-down"
						/>
					</Button>

					{showRemove && (
						<Button
							className="p-1 ring-transparent"
							onClick={onRemove}
							type="button"
							variant={'danger'}
						>
							<Icon className="text-lg" icon="lucide:x" />
						</Button>
					)}
				</Card.Header>

				{weapon && (
					<Card.Content className="flex flex-col gap-2">
						{compatibleAmmo.length === 1 ? (
							<div className="flex items-center gap-2 rounded-lg border-2 border-border/40 bg-background px-2 py-1.5 text-xs">
								<Icon
									className="shrink-0 text-neutral-500"
									icon="lucide:zap"
								/>
								<span className="truncate font-medium">
									{messageToString(
										compatibleAmmo[0].name,
										locale
									)}
								</span>
							</div>
						) : (
							<div className="flex gap-2">
								<Button
									className="flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5"
									onClick={() => {
										setAmmoPreviewId(slot.ammoId || null)
										setShowAmmoModal(true)
									}}
									type="button"
									variant={'outline'}
								>
									{ammoIconUrl && ammo ? (
										<Image
											alt=""
											className="shrink-0 object-contain"
											height={24}
											onError={(e) => {
												;(
													e.target as HTMLImageElement
												).style.display = 'none'
											}}
											src={ammoIconUrl}
											width={24}
										/>
									) : (
										<Icon
											className="shrink-0 text-neutral-500"
											icon="lucide:zap"
										/>
									)}
									<span
										className={`truncate text-sm ${!ammo && 'text-neutral-500'}`}
									>
										{ammo
											? messageToString(ammo.name, locale)
											: t('ttk.page.default_ammo')}
									</span>
									<Icon
										className="ml-auto shrink-0 text-neutral-500"
										icon="lucide:chevron-down"
									/>
								</Button>
								<Input
									className="min-w-20 rounded-lg border-border-secondary px-2 py-2"
									label="ui.input_sharpening"
									max={15}
									min={0}
									onChange={(e) =>
										onVariantChange(Number(e.target.value))
									}
									type="number"
									value={slot.variantIndex}
								/>
							</div>
						)}
					</Card.Content>
				)}
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
