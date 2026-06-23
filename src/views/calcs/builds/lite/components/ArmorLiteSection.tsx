'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Armor } from '@/types/build.type'
import {
	InfoColor,
	type Item,
	infoColorMap,
	type Locale,
} from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'

type ArmorLiteSectionProps = {
	armor: Armor | null
	armorItems: Item[]
	locale: Locale
	onSetArmor: (id: string, level?: number) => void
	onRemoveArmor: () => void
	onOpenPicker: (previewId: string | null) => void
}

export function ArmorLiteSection({
	armor,
	armorItems,
	locale,
	onSetArmor,
	onRemoveArmor,
	onOpenPicker,
}: ArmorLiteSectionProps) {
	const t = useTranslations()

	const armorItem = armor
		? (armorItems.find((item) => item.id === armor.id) ?? null)
		: null

	if (!armor?.id || !armorItem) {
		return (
			<div className="flex gap-4">
				<div className="relative h-32 w-32">
					<Image
						alt="armor placeholder"
						className="object-contain"
						fill
						priority
						fetchPriority="high"
						src="/images/other/armor_placeholder.png"
					/>
				</div>
				<div className="flex flex-col justify-center gap-10">
					<h2 className="text-text-accent">{t('build.no_armor')}</h2>
					<Button
						onClick={() => onOpenPicker(null)}
						variant="secondary"
					>
						{t('build.pick_armor')}
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="flex gap-4">
			<div className="relative h-32 w-32">
				<Image
					alt="Armor"
					className="object-contain"
					fill
					src={`https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons/${armorItem.category}/${armor.id}.png`}
				/>
			</div>
			<div className="flex flex-col gap-3">
				<h2
					className={`${montserrat.className} text-sm`}
					style={{
						color:
							infoColorMap[armorItem.color as InfoColor] ||
							InfoColor.DEFAULT,
					}}
				>
					{messageToString(armorItem.name, locale)}
				</h2>
				<div className="flex items-center gap-2">
					<Button
						className={`${montserrat.className} size-8 text-sm`}
						onClick={() => onSetArmor(armor.id, 0)}
						size="sm"
						variant="secondary"
					>
						0
					</Button>
					<Button
						className={`${montserrat.className} size-8 text-sm`}
						onClick={() => onSetArmor(armor.id, 15)}
						size="sm"
						variant="secondary"
					>
						15
					</Button>
					<Button
						className="size-8 p-2"
						onClick={() => onOpenPicker(armor.id)}
						size="sm"
						variant="ghost"
					>
						<Icon icon="lucide:repeat" />
					</Button>
					<Button
						className="size-8 p-2 ring-transparent"
						onClick={onRemoveArmor}
						size="sm"
						variant="danger"
					>
						<Icon icon="lucide:trash-2" />
					</Button>
				</div>
				<Input
					className="text-[15px]"
					label="ui.input_sharpening"
					max={15}
					min={0}
					onChange={(e) =>
						onSetArmor(armor.id, Number(e.target.value))
					}
					type="number"
					value={armor.level}
				/>
			</div>
		</div>
	)
}
