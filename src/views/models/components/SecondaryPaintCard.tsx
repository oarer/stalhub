'use client'

import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'

export function SecondaryPaintCard({
	onColorChange,
	onEnabledChange,
	secondaryColor,
	secondaryEnabled,
	t,
}: {
	onColorChange: (color: string | null) => void
	onEnabledChange: (value: boolean) => void
	secondaryColor: string | null
	secondaryEnabled: boolean
	t: (key: string) => string
}) {
	return (
		<Card.Root>
			<Card.Header>
				<Card.Title>{t('secondaryPaint')}</Card.Title>
			</Card.Header>
			<Card.Content className="space-y-3">
				<Switch
					checked={secondaryEnabled}
					label={t('secondaryEnabled')}
					onCheckedChange={onEnabledChange}
				/>
				<div className="flex items-center justify-between gap-3">
					<span className="font-semibold text-muted-foreground text-sm">
						{t('secondaryColor')}
					</span>
					<div className="flex items-center gap-2">
						{secondaryColor && (
							<Button
								aria-label={t('colorDefault')}
								className="p-1.5"
								disabled={!secondaryEnabled}
								onClick={() => onColorChange(null)}
								size="sm"
								variant="ghost"
							>
								<Icon icon="lucide:undo-2" />
							</Button>
						)}
						<label className="relative h-8 w-8 cursor-pointer overflow-hidden rounded-lg border-2 border-muted transition-colors hover:border-primary">
							<input
								className="absolute inset-0 cursor-pointer opacity-0"
								disabled={!secondaryEnabled}
								onChange={(event) =>
									onColorChange(event.target.value)
								}
								type="color"
								value={secondaryColor ?? '#08141c'}
							/>
							<span
								className="absolute inset-0 block"
								style={{
									backgroundColor:
										secondaryColor ?? '#08141c',
								}}
							/>
						</label>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	)
}
