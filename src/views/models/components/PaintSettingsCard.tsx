'use client'

import type { ChangeEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'

export function PaintSettingsCard({
	currentPaintName,
	onPickPaint,
	onScaleChange,
	paintEnabled,
	onPaintEnabledChange,
	t,
	uvScale,
}: {
	currentPaintName: string
	onPickPaint: () => void
	onScaleChange: (value: number) => void
	paintEnabled: boolean
	onPaintEnabledChange: (value: boolean) => void
	t: (key: string) => string
	uvScale: number
}) {
	return (
		<Card.Root>
			<Card.Header>
				<Card.Title>{t('paint')}</Card.Title>
			</Card.Header>
			<Card.Content className="space-y-3">
				<Switch
					checked={paintEnabled}
					label={t('paintEnabled')}
					onCheckedChange={onPaintEnabledChange}
				/>
				<Button
					className="w-full justify-start gap-2 truncate"
					disabled={!paintEnabled}
					onClick={onPickPaint}
					variant="secondary"
				>
					{currentPaintName || t('notSelected')}
				</Button>
				<span className="font-semibold text-muted-foreground text-sm">
					{t('scale')}
				</span>
				<Input
					disabled={!paintEnabled}
					min={0.1}
					onChange={(event: ChangeEvent<HTMLInputElement>) => {
						const next = Number(event.target.value)
						if (!Number.isNaN(next)) onScaleChange(next)
					}}
					step={0.1}
					type="number"
					value={String(uvScale)}
				/>
			</Card.Content>
		</Card.Root>
	)
}
