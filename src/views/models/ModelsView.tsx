'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PaintMaskMode } from '@/app/calcs/builds/model/paint'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Locale } from '@/i18n/settings'
import { Choice } from './components/Choice'
import { ModelCard } from './components/ModelCard'
import { PaintSettingsCard } from './components/PaintSettingsCard'
import { SecondaryPaintCard } from './components/SecondaryPaintCard'
import VirtualPickerModal, {
	type PickerOption,
} from './components/VirtualPickerModal'
import { useIsMobile } from './hooks/useIsMobile'
import type { AssetMap, ModelItem, PaintItem } from './types'
import { MAP_URL } from './types'
import { downloadAssets, modelUrl, paintAssets, textureUrl } from './utils'

export default function ModelsView() {
	const t = useTranslations('models')
	const locale = useLocale() as Locale
	const isMobile = useIsMobile()

	const [catalog, setCatalog] = useState<ModelItem[]>([])
	const [paints, setPaints] = useState<PaintItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(false)

	const [modelId, setModelId] = useState('')
	const [paintId, setPaintId] = useState<string>('')
	const [secondaryPaintId, setSecondaryPaintId] = useState('')
	const [paintEnabled, setPaintEnabled] = useState(true)
	const [uvScale, setUvScale] = useState(1)
	const [mode, setMode] = useState<PaintMaskMode>(
		'dmap_alpha_as_dual_skin_mask'
	)
	const [secondaryEnabled, setSecondaryEnabled] = useState(false)
	const [secondaryColor, setSecondaryColor] = useState<string | null>(null)
	const [picker, setPicker] = useState<
		null | 'model' | 'paint' | 'secondary'
	>(null)

	useEffect(() => {
		const controller = new AbortController()
		fetch(MAP_URL, { signal: controller.signal })
			.then((response) => {
				if (!response.ok) throw new Error(String(response.status))
				return response.json() as Promise<AssetMap>
			})
			.then((data) => {
				setCatalog(data.items.filter((item) => item.models.length > 0))
				setPaints(data.paints ?? [])
			})
			.catch((reason: unknown) => {
				if ((reason as { name?: string }).name !== 'AbortError')
					setError(true)
			})
			.finally(() => setLoading(false))
		return () => controller.abort()
	}, [])

	const model = catalog.find((item) => item.id === modelId) ?? catalog[0]
	const glb = model ? modelUrl(model) : undefined

	const [modelLoading, setModelLoading] = useState(false)
	const [downloading, setDownloading] = useState(false)
	const prevGlb = useRef(glb)
	const onModelLoaded = useCallback(() => setModelLoading(false), [])

	useEffect(() => {
		if (glb && glb !== prevGlb.current) {
			setModelLoading(true)
			prevGlb.current = glb
		}
	}, [glb])
	const weapon =
		model?.models[0]?.url?.includes('/weapons/') ??
		model?.models[0]?.path?.includes('weapons/') ??
		false

	const selectedPaint = paints.find((item) => String(item.id) === paintId)
	const selectedSecondaryPaint = paints.find(
		(item) => String(item.id) === secondaryPaintId
	)

	const paint = paintEnabled
		? { ...paintAssets(selectedPaint), uvScale }
		: undefined
	const secondaryPaint = paintAssets(selectedSecondaryPaint)

	const modelTextures = model
		? {
				diff: textureUrl(model.textures.diffuse[0]),
				emi: textureUrl(model.textures.emission[0]),
				nrm: textureUrl(model.textures.normal[0]),
				spek: textureUrl(model.textures.specular[0]),
			}
		: undefined

	const modelOptions: PickerOption[] = useMemo(
		() =>
			[...catalog]
				.sort((a, b) =>
					(a.names[locale] ?? a.names.en ?? a.id).localeCompare(
						b.names[locale] ?? b.names.en ?? b.id,
						locale
					)
				)
				.map((item) => ({
					id: item.id,
					name: item.names[locale] ?? item.names.en ?? item.id,
				})),
		[catalog, locale]
	)
	const paintOptions: PickerOption[] = paints.map((item) => ({
		id: String(item.id),
		name: item.names[locale] ?? item.unlocalized_name,
	}))

	const currentPaintName = selectedPaint
		? (selectedPaint.names[locale] ?? selectedPaint.unlocalized_name)
		: t('notSelected')

	if (isMobile) {
		return (
			<section className="mx-auto max-w-360 space-y-6 px-4 pt-32 pb-12 sm:px-6 md:px-8">
				<h1 className="font-bold text-3xl">{t('title')}</h1>
				<Alert.Root variant={'destructive'}>
					<Alert.Description>
						{t('mobileNotSupported')}
					</Alert.Description>
				</Alert.Root>
			</section>
		)
	}

	return (
		<section className="mx-auto max-w-360 space-y-6 px-4 pt-32 pb-12 sm:px-6 md:px-8">
			<h1 className="font-bold text-3xl">{t('title')}</h1>

			<Alert.Root variant={'destructive'}>
				<Alert.Description>{t('textureWarning')}</Alert.Description>
			</Alert.Root>
			<Alert.Root variant={'warning'}>
				<Alert.Description>
					{t('untranslatedWarning')}
				</Alert.Description>
			</Alert.Root>

			<div className="space-y-4">
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<Card.Root className="overflow-hidden">
						<Card.Header className="space-y-3">
							<Card.Title>{t('model')}</Card.Title>
							<div className="flex items-center justify-between gap-3">
								<p className="min-w-0 flex-1 truncate font-semibold text-sm">
									{model
										? (model.names[locale] ??
											model.names.en ??
											model.id)
										: t('selectModel')}
								</p>
							</div>
						</Card.Header>
						<Card.Content className="space-y-1">
							<Button
								className="w-full"
								disabled={!model}
								onClick={() => setPicker('model')}
								variant="primary"
							>
								{t('chooseModel')}
							</Button>
							{loading && (
								<p className="text-muted-foreground text-sm">
									{t('loading')}
								</p>
							)}
							{error && (
								<p className="text-destructive text-sm">
									{t('loadError')}
								</p>
							)}
						</Card.Content>
					</Card.Root>
					{model && (
						<>
							<PaintSettingsCard
								currentPaintName={currentPaintName}
								onPaintEnabledChange={setPaintEnabled}
								onPickPaint={() => setPicker('paint')}
								onScaleChange={setUvScale}
								paintEnabled={paintEnabled}
								t={t}
								uvScale={uvScale}
							/>
							<Choice
								onChange={(value) =>
									setMode(value as PaintMaskMode)
								}
								options={[
									[
										'dmap_alpha_as_dual_skin_mask',
										t('masks.diffuseAlphaDual'),
									],
									[
										'dmap_alpha_as_skin_mask',
										t('masks.diffuseAlpha'),
									],
									[
										'nmap_blue_as_dual_skin_mask',
										t('masks.normalBlueDual'),
									],
									[
										'nmap_blue_as_skin_mask',
										t('masks.normalBlue'),
									],
								]}
								title={t('mask')}
								value={mode}
							/>
							<SecondaryPaintCard
								onColorChange={setSecondaryColor}
								onEnabledChange={setSecondaryEnabled}
								secondaryColor={secondaryColor}
								secondaryEnabled={secondaryEnabled}
								t={t}
							/>
						</>
					)}
				</div>

				<ModelCard
					downloading={downloading}
					glb={glb}
					mode={mode}
					model={model}
					modelLoading={modelLoading}
					modelTextures={modelTextures}
					onDownload={() => {
						setDownloading(true)
						downloadAssets({
							model,
							glb,
							modelTextures,
							paintEnabled,
							paintTexture: paint?.texture,
							paintEmission:
								paint && 'emission' in paint
									? paint.emission
									: undefined,
							paintNormal: paint?.normal,
							secondaryEnabled,
							secondaryTexture: secondaryPaint.texture,
							secondaryEmission: secondaryPaint.emission,
							secondaryNormal: secondaryPaint.normal,
						}).finally(() => setDownloading(false))
					}}
					onLoad={onModelLoaded}
					paint={paint}
					paintEnabled={paintEnabled}
					secondaryColor={secondaryColor}
					secondaryEnabled={secondaryEnabled}
					secondaryPaint={secondaryPaint}
					t={t}
					uvScale={uvScale}
					weapon={weapon}
				/>
			</div>

			<VirtualPickerModal
				emptyText={t('empty')}
				onOpenChange={(open) => setPicker(open ? 'model' : null)}
				onSelect={setModelId}
				open={picker === 'model'}
				options={modelOptions}
				searchPlaceholder={t('search')}
				selectedId={model?.id}
				title={t('selectModel')}
			/>
			<VirtualPickerModal
				emptyText={t('paintEmpty')}
				onOpenChange={(open) => setPicker(open ? 'paint' : null)}
				onSelect={setPaintId}
				open={picker === 'paint'}
				options={paintOptions}
				searchPlaceholder={t('searchPaints')}
				selectedId={paintId}
				title={t('paint')}
			/>
			<VirtualPickerModal
				emptyText={t('paintEmpty')}
				onOpenChange={(open) => setPicker(open ? 'secondary' : null)}
				onSelect={setSecondaryPaintId}
				open={picker === 'secondary'}
				options={paintOptions}
				searchPlaceholder={t('searchPaints')}
				selectedId={secondaryPaintId}
				title={t('secondaryPaint')}
			/>
		</section>
	)
}
