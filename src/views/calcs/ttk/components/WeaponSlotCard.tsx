'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { type CSSProperties, useEffect, useMemo, useState } from 'react'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import Slider from '@/components/ui/Slider'
import { cn } from '@/lib/cn'
import { getLocale } from '@/lib/getLocale'
import type { WeaponSlot } from '@/stores/useTTK.store'
import { type InfoColor, type Item, infoColorMap } from '@/types/item.type'
import { messageToString, roundNumber } from '@/utils/itemUtils'
import { ItemPickerModal } from '@/views/calcs/builds/lite/components/ItemPickerModal'
import {
	getModuleByKey,
	getModuleStatValue,
	getRarityByQuality,
	QUALITY_MAX,
	QUALITY_MIN,
	RARITY_COLORS,
	useModulesData,
} from '@/views/calcs/modules/utils/moduleCalc'
import { CUSTOM_ROF_MAP, HOLD_MAX_TIME, isHoldWeapon } from '../constants/ttk'
import { getAmmoType, getCompatibleAmmo } from '../utils'

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
	onHoldTimeChange: (holdTime: number) => void
	onBurstRofToggle: () => void
	onModuleSelect: (moduleKey: string) => void
	onModuleQuality: (quality: number) => void
	onModuleReset: () => void
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
	onHoldTimeChange,
	onBurstRofToggle,
	onModuleSelect,
	onModuleQuality,
	onModuleReset,
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
				? `https://cdn.stalhub.dev/db/icons/${weapon.category}/${weapon.id}.png`
				: null,
		[weapon]
	)
	const ammoIconUrl = useMemo(
		() =>
			ammo
				? `https://cdn.stalhub.dev/db/icons/bullet/${ammo.id}.png`
				: null,
		[ammo]
	)

	const modulesData = useModulesData()
	const conceptModules = useMemo(
		() => (modulesData.groups ?? []).find((g) => g.key === 'concept'),
		[modulesData]
	)
	const moduleOptions = useMemo(
		() =>
			(conceptModules?.modules ?? []).map((m) => ({
				value: m.key,
				label: m.lines.ru,
			})),
		[conceptModules]
	)
	const selectedModule = useMemo(
		() => getModuleByKey('concept', slot.moduleKey),
		[slot.moduleKey]
	)
	const moduleRarity = getRarityByQuality(slot.moduleQuality)

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
						<div className="flex h-21.5 w-21.5 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card">
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
							<div className="flex items-center gap-1 rounded-lg p-1 ring-2 ring-muted">
								<Button
									className={cn(
										'w-full font-semibold text-sm',
										!slot.useBurstRof
											? 'bg-border/40 dark:text-neutral-200'
											: 'hover:text-neutral-200'
									)}
									onClick={() => {
										if (slot.useBurstRof) onBurstRofToggle()
									}}
									variant="ghost"
								>
									{t('ttk.page.fire.auto')}
								</Button>

								<Button
									className={cn(
										'w-full font-semibold text-sm',
										slot.useBurstRof
											? 'bg-border/40 dark:text-neutral-200'
											: 'hover:text-neutral-200'
									)}
									onClick={() => {
										if (!slot.useBurstRof)
											onBurstRofToggle()
									}}
									variant="ghost"
								>
									{t('ttk.page.fire.burst')}
								</Button>
							</div>
						)}

						{weapon &&
							(compatibleAmmo.length === 1 ? (
								<div className="flex min-w-0 items-center gap-2 rounded-lg border-2 border-primary/40 bg-card px-2 py-1.5 text-xs">
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
											className={`min-w-0 truncate font-semibold text-sm ${
												!ammo ? 'text-text-accent' : ''
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
										className="w-20 shrink-0 rounded-lg border-primary/40"
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

						{weapon && (
							<div className="flex flex-col gap-1 rounded-lg p-2 ring-2 ring-muted">
								<div className="flex items-center justify-between gap-2">
									<span className="font-semibold text-neutral-400 text-xs">
										{t('ttk.page.module_concept')}
									</span>
									{slot.moduleKey && (
										<Button
											className="p-1 ring-transparent"
											onClick={(e) => {
												e.stopPropagation()
												onModuleReset()
											}}
											size="sm"
											title={t('ttk.page.module_reset')}
											variant="danger"
										>
											<Icon
												className="text-xs"
												icon="lucide:x"
											/>
										</Button>
									)}
								</div>
								<Combobox
									emptyText="ttk.page.module_empty"
									onValueChange={onModuleSelect}
									options={moduleOptions}
									placeholder="ttk.page.module_pick"
									searchPlaceholder="ttk.page.module_search"
									translateOptions={false}
									value={slot.moduleKey}
								/>
								{selectedModule && (
									<>
										<div className="flex items-center gap-2">
											<Input
												className="h-8"
												max={QUALITY_MAX}
												min={QUALITY_MIN}
												onChange={(e) => {
													const parsed = Number(
														e.target.value
													)
													if (!Number.isNaN(parsed)) {
														onModuleQuality(
															Math.max(
																QUALITY_MIN,
																Math.min(
																	QUALITY_MAX,
																	parsed
																)
															)
														)
													}
												}}
												step="0.01"
												type="number"
												value={slot.moduleQuality}
											/>
											<span
												className="rounded bg-accent/50 px-2 py-1.5 font-bold text-xs"
												style={{
													color: RARITY_COLORS[
														moduleRarity
													],
												}}
											>
												{t(
													`arts.ART_QUALITY_${moduleRarity.toUpperCase()}`
												)}
											</span>
										</div>
										<Slider
											max={QUALITY_MAX}
											min={QUALITY_MIN}
											onValueChange={onModuleQuality}
											step={0.01}
											value={slot.moduleQuality}
										/>
										<div className="flex flex-col gap-0.5 rounded-lg bg-neutral-800/30 p-2 text-xs">
											{selectedModule.stats.map(
												(stat) => {
													const value =
														getModuleStatValue(
															stat,
															slot.moduleQuality
														)
													return (
														<div
															className="flex items-center justify-between gap-2"
															key={stat.key}
														>
															<span className="font-semibold">
																{stat.lines.ru}
															</span>
															<span
																className={cn(
																	'font-semibold',
																	montserrat.className,
																	stat.type ===
																		'negative'
																		? 'text-red-400'
																		: stat.type ===
																				'special'
																			? 'text-blue-400'
																			: 'text-green-400'
																)}
															>
																{value > 0
																	? `+${value.toFixed(3)}%`
																	: `${value.toFixed(3)}%`}
															</span>
														</div>
													)
												}
											)}
										</div>
									</>
								)}
							</div>
						)}

						{weapon && isHoldWeapon(weapon.id) && (
							<div className="flex flex-col gap-1 rounded-lg p-2 ring-2 ring-muted">
								<div className="flex items-center justify-between">
									<span className="font-semibold text-neutral-400 text-xs">
										{t('ttk.page.hold_time')}
									</span>
									<span
										className={`${montserrat.className} font-semibold text-xs`}
									>
										{roundNumber(slot.holdTime)} с
									</span>
								</div>
								<Slider
									max={HOLD_MAX_TIME}
									min={0}
									onValueChange={onHoldTimeChange}
									step={0.01}
									value={slot.holdTime}
								/>
							</div>
						)}
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
