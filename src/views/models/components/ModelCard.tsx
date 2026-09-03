'use client'

import { Icon } from '@iconify/react'
import type { PaintMaskMode } from '@/app/calcs/builds/model/paint'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/Tooltip'
import ModelViewer from '../ModelViewer'
import type { ModelItem } from '../types'
import { ModelErrorBoundary } from './ModelErrorBoundary'

export function ModelCard({
	downloading,
	glb,
	mode,
	model,
	modelLoading,
	modelTextures,
	onDownload,
	onLoad,
	paint,
	paintEnabled,
	secondaryColor,
	secondaryEnabled,
	secondaryPaint,
	t,
	uvScale,
	weapon,
}: {
	downloading: boolean
	glb: string | undefined
	mode: PaintMaskMode
	model: ModelItem | undefined
	modelLoading: boolean
	modelTextures:
		| { diff?: string; emi?: string; nrm?: string; spek?: string }
		| undefined
	onDownload: () => void
	onLoad: () => void
	paint:
		| {
				texture?: string
				alpha?: string
				emission?: string
				normal?: string
				uvScale?: number
		  }
		| undefined
	paintEnabled: boolean
	secondaryColor: string | null
	secondaryEnabled: boolean
	secondaryPaint: { texture?: string; alpha?: string; emission?: string }
	t: (key: string) => string
	uvScale: number
	weapon: boolean
}) {
	return (
		<Card.Root className="min-h-[65vh] overflow-hidden">
			<Card.Content className="relative h-[65vh] p-0">
				{glb && model && modelTextures ? (
					<ModelErrorBoundary key={glb} message={t('modelLoadError')}>
						<ModelViewer
							alpha={
								paint && 'alpha' in paint
									? paint.alpha
									: undefined
							}
							emission={
								paint && 'emission' in paint
									? paint.emission
									: undefined
							}
							glb={glb}
							mode={mode}
							normal={paint?.normal}
							onLoad={onLoad}
							paintEnabled={paintEnabled}
							secondary={
								secondaryEnabled ? secondaryPaint : undefined
							}
							secondaryColor={secondaryColor ?? undefined}
							secondaryEnabled={secondaryEnabled}
							texture={paint?.texture ?? ''}
							textures={modelTextures}
							uvScale={
								paint && 'uvScale' in paint
									? paint.uvScale
									: uvScale
							}
							weapon={weapon}
						/>
						<div className="absolute top-2 right-0 z-10 flex items-center gap-4">
							<Tooltip.Root>
								<Tooltip.Trigger asChild>
									<Icon
										className="text-xl"
										icon="lucide:info"
									/>
								</Tooltip.Trigger>
								<Tooltip.Content>{t('info')}</Tooltip.Content>
							</Tooltip.Root>
							<Button
								className="gap-2"
								disabled={downloading}
								loading={downloading}
								onClick={onDownload}
								variant="primary"
							>
								<Icon
									className="text-lg"
									icon="lucide:download"
								/>
								{t('download')}
							</Button>
						</div>
						{modelLoading && (
							<div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
								<div className="flex flex-col items-center gap-3 text-muted-foreground">
									<Icon
										className="h-8 w-8 animate-spin"
										icon="lucide:loader-circle"
									/>
									<p className="text-sm">
										{t('loadingModel')}
									</p>
								</div>
							</div>
						)}
					</ModelErrorBoundary>
				) : (
					<div className="flex h-full items-center justify-center p-6 text-center text-muted-foreground">
						{t('selectModel')}
					</div>
				)}
			</Card.Content>
		</Card.Root>
	)
}
