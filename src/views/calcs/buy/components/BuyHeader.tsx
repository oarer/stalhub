'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { mtsExtended } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'

type BuyHeaderProps = {
	discord: string
	onAddItem: () => void
	onClear: () => void
	onCopyText: () => void
	onDiscordChange: (discord: string) => void
	onSavePng: () => void
	onTitleChange: (title: string) => void
	savingPng: boolean
	title: string
}

export function BuyHeader({
	discord,
	onAddItem,
	onClear,
	onCopyText,
	onDiscordChange,
	onSavePng,
	onTitleChange,
	savingPng,
	title,
}: BuyHeaderProps) {
	const t = useTranslations()

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-2">
				<div className="w-1 shrink-0 self-stretch bg-primary" />
				<h1
					className={`${mtsExtended.className} font-semibold text-[28px] text-primary leading-none`}
				>
					{title || t('buy.title')}
				</h1>
			</div>

			<div className="flex flex-col gap-3">
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<Input
						label="buy.tableTitleLabel"
						maxLength={60}
						onChange={(e) => onTitleChange(e.target.value)}
						type="text"
						value={title}
					/>
					<Input
						label="buy.discord"
						onChange={(e) => onDiscordChange(e.target.value)}
						type="text"
						value={discord}
					/>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button
						className="flex gap-2 font-medium"
						onClick={onAddItem}
						variant="primary"
					>
						<Icon icon="lucide:plus" />
						{t('buy.addItem')}
					</Button>
					<Button
						className="flex gap-2 font-medium"
						loading={savingPng}
						onClick={onSavePng}
						variant="secondary"
					>
						<Icon icon="lucide:image-down" />
						{t('buy.savePng')}
					</Button>
					<Button
						className="flex gap-2 font-medium"
						onClick={onCopyText}
						variant="secondary"
					>
						<Icon icon="lucide:clipboard" />
						{t('buy.copyText')}
					</Button>
					<Button
						className="ml-auto flex gap-2 font-medium"
						onClick={onClear}
						variant="ghost"
					>
						<Icon icon="lucide:trash-2" />
						{t('buy.clear')}
					</Button>
				</div>
				{!discord.trim() && (
					<p className="font-medium text-muted-foreground text-xs">
						{t('buy.discordHint')}
					</p>
				)}
			</div>
		</div>
	)
}
