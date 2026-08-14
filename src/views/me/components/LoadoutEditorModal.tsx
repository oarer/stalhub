'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import { Modal } from '@/components/ui/Modal'
import { getLocale } from '@/lib/getLocale'
import type { BuildApi } from '@/types/build-api.type'
import {
	type InfoColor,
	type Item,
	infoColorMap,
	type Locale,
} from '@/types/item.type'
import {
	EMPTY_LOADOUT,
	type LoadoutData,
	type UserLoadout,
} from '@/types/loadout/loadout.type'
import { messageToString } from '@/utils/itemUtils'
import { ItemPickerModal } from '@/views/calcs/builds/lite/components/ItemPickerModal'

export const MAIN_WEAPON_CATEGORIES = [
	'weapon/assault_rifle',
	'weapon/sniper_rifle',
	'weapon/shotgun_rifle',
	'weapon/machine_gun',
	'weapon/submachine_gun',
	'weapon/heavy',
]

const ARMOR_CATEGORIES = ['armor/combat', 'armor/combined']
const BIO_ARMOR_CATEGORIES = ['armor/combined']

export function filterMainWeapons(weapons: Item[]) {
	return weapons.filter((w) => MAIN_WEAPON_CATEGORIES.includes(w.category))
}

export function filterPistols(weapons: Item[]) {
	return weapons.filter((w) => w.category === 'weapon/pistol')
}

export function filterArmor(armors: Item[]) {
	return armors.filter((a) => ARMOR_CATEGORIES.includes(a.category))
}

export function filterBioArmor(armors: Item[]) {
	return armors.filter((a) => BIO_ARMOR_CATEGORIES.includes(a.category))
}

type ItemField =
	| 'weapon_primary'
	| 'weapon_secondary'
	| 'weapon_pistol'
	| 'armor'
	| 'bio_armor'

function PickRow({
	label,
	value,
	items,
	locale,
	favoriteType,
	title,
	onChange,
	onClear,
}: {
	label: string
	value: string | null
	items: Item[]
	locale: Locale
	favoriteType: 'weapon' | 'armor'
	title: string
	onChange: (value: string) => void
	onClear: () => void
}) {
	const [open, setOpen] = useState(false)
	const [preview, setPreview] = useState<string | null>(value)
	const item = items.find((i) => i.id === value) ?? null
	const t = useTranslations()

	return (
		<div className="flex min-w-0 items-center gap-2">
			<span className="w-42 shrink-0 font-semibold text-sm text-text-accent">
				{label}
			</span>
			<Button
				className="min-w-0 flex-1 justify-between gap-2 px-2 py-1.5"
				onClick={() => {
					setPreview(value)
					setOpen(true)
				}}
				variant="outline"
			>
				<span
					className={`min-w-0 truncate font-semibold text-sm ${!item ? 'text-text-accent' : ''}`}
					style={
						item
							? { color: infoColorMap[item.color as InfoColor] }
							: undefined
					}
				>
					{item ? messageToString(item.name, locale) : '—'}
				</span>
				<Icon
					className="shrink-0 text-text-accent text-xs"
					icon="lucide:chevron-down"
				/>
			</Button>
			{value && (
				<Button
					className="px-2 ring-transparent"
					onClick={onClear}
					variant="ghost"
				>
					<Icon className="text-lg" icon="lucide:x" />
				</Button>
			)}
			<ItemPickerModal
				emptyTitle={title}
				favoriteType={favoriteType}
				items={items}
				locale={locale}
				onConfirm={(itemId) => {
					onChange(itemId)
					setOpen(false)
				}}
				previewId={preview}
				searchLabel={t('clan.squads.search')}
				setPreviewId={setPreview}
				setShowModal={setOpen}
				showModal={open}
				title={title}
			/>
		</div>
	)
}

function BuildPickRow({
	label,
	value,
	builds,
	onChange,
}: {
	label: string
	value: number | null
	builds: BuildApi[]
	onChange: (value: number | null) => void
}) {
	const t = useTranslations()
	const options: ComboboxOption[] = builds.map((b) => ({
		value: String(b.id),
		label: b.title,
	}))

	return (
		<div className="flex min-w-0 items-center gap-2">
			<span className="w-42 shrink-0 font-semibold text-sm text-text-accent">
				{label}
			</span>
			<div className="min-w-0 flex-1">
				<Combobox
					disabled={options.length === 0}
					emptyText={t('clan.squads.noBuilds')}
					onValueChange={(v) => onChange(v ? Number(v) : null)}
					options={options}
					placeholder="—"
					value={value != null ? String(value) : ''}
					zIndex={9999}
				/>
			</div>
			{value != null && (
				<Button
					className="px-2 ring-transparent"
					onClick={() => onChange(null)}
					variant="ghost"
				>
					<Icon className="text-lg" icon="lucide:x" />
				</Button>
			)}
		</div>
	)
}

interface LoadoutEditorModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	loadout: UserLoadout | null
	weapons: Item[]
	armors: Item[]
	builds: BuildApi[]
	isPending: boolean
	onSave: (data: LoadoutData) => void
}

export function LoadoutEditorModal({
	open,
	onOpenChange,
	loadout,
	weapons,
	armors,
	builds,
	isPending,
	onSave,
}: LoadoutEditorModalProps) {
	const [draft, setDraft] = useState<LoadoutData>(EMPTY_LOADOUT)
	const locale = getLocale()
	const t = useTranslations()

	const mainWeapons = filterMainWeapons(weapons)
	const pistols = filterPistols(weapons)
	const armorItems = filterArmor(armors)
	const bioArmorItems = filterBioArmor(armors)

	const setItem = (field: ItemField, value: string) =>
		setDraft((d) => ({ ...d, [field]: value }))
	const clearItem = (field: ItemField) =>
		setDraft((d) => ({ ...d, [field]: null }))

	return (
		<Modal.Root
			onOpenChange={(next) => {
				if (next) {
					setDraft(loadout?.data ?? EMPTY_LOADOUT)
				}
				onOpenChange(next)
			}}
			open={open}
		>
			<Modal.Content fullScreen={false}>
				<Modal.Header>
					<Modal.Title>{t('clan.squads.myLoadout')}</Modal.Title>
				</Modal.Header>
				<Modal.Body className="flex flex-col gap-3">
					<PickRow
						favoriteType="weapon"
						items={mainWeapons}
						label={t('clan.squads.loadoutFields.primaryWeapon')}
						locale={locale}
						onChange={(v) => setItem('weapon_primary', v)}
						onClear={() => clearItem('weapon_primary')}
						title={t('clan.squads.loadoutFields.primaryWeapon')}
						value={draft.weapon_primary}
					/>
					<PickRow
						favoriteType="weapon"
						items={mainWeapons}
						label={t('clan.squads.loadoutFields.secondaryWeapon')}
						locale={locale}
						onChange={(v) => setItem('weapon_secondary', v)}
						onClear={() => clearItem('weapon_secondary')}
						title={t('clan.squads.loadoutFields.secondaryWeapon')}
						value={draft.weapon_secondary}
					/>
					<PickRow
						favoriteType="weapon"
						items={pistols}
						label={t('clan.squads.loadoutFields.pistol')}
						locale={locale}
						onChange={(v) => setItem('weapon_pistol', v)}
						onClear={() => clearItem('weapon_pistol')}
						title={t('clan.squads.loadoutFields.pistol')}
						value={draft.weapon_pistol}
					/>
					<PickRow
						favoriteType="armor"
						items={armorItems}
						label={t('clan.squads.loadoutFields.armor')}
						locale={locale}
						onChange={(v) => setItem('armor', v)}
						onClear={() => clearItem('armor')}
						title={t('clan.squads.loadoutFields.armor')}
						value={draft.armor}
					/>
					<PickRow
						favoriteType="armor"
						items={bioArmorItems}
						label={t('clan.squads.loadoutFields.bioArmor')}
						locale={locale}
						onChange={(v) => setItem('bio_armor', v)}
						onClear={() => clearItem('bio_armor')}
						title={t('clan.squads.loadoutFields.bioArmor')}
						value={draft.bio_armor}
					/>
					<BuildPickRow
						builds={builds}
						label={t('clan.squads.loadoutFields.fatBuild')}
						onChange={(v) =>
							setDraft((d) => ({ ...d, build_fat: v }))
						}
						value={draft.build_fat}
					/>
					<BuildPickRow
						builds={builds}
						label={t('clan.squads.loadoutFields.speedBuild')}
						onChange={(v) =>
							setDraft((d) => ({ ...d, build_speed: v }))
						}
						value={draft.build_speed}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('clan.common.cancel')}</Modal.Close>
					<Modal.Action
						closeOnClick
						disabled={isPending}
						onClick={() => onSave(draft)}
					>
						{t('clan.common.save')}
					</Modal.Action>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
