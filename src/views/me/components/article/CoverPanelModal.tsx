import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import BlogCover from '@/components/blog/BlogCover'
import { CheckBox } from '@/components/ui/CheckBox'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import Slider from '@/components/ui/Slider'
import { COVER_ICON_NAMES } from '@/lib/blog-cover'
import { cn } from '@/lib/cn'
import { useIconifyBody } from '@/lib/use-iconify-body'
import type {
	ArticleCoverConfig,
	ArticleCoverPanelRow,
} from '@/types/article.type'

type PresetId = 'auto' | 'before-after' | 'metrics' | 'hidden'

interface RowDraft {
	label: string
	value: string
	fill: number
	accent: boolean
}

const EMPTY_ROW: RowDraft = { label: '', value: '', fill: 60, accent: false }

const PRESETS: Record<
	'before-after' | 'metrics',
	{ title: string; rows: [RowDraft, RowDraft] }
> = {
	'before-after': {
		title: '',
		rows: [
			{ label: 'до', value: '100', fill: 100, accent: false },
			{ label: 'после', value: '20', fill: 20, accent: true },
		],
	},
	metrics: {
		title: '',
		rows: [
			{ label: 'Время ответа', value: '2.2 мс', fill: 100, accent: true },
			{ label: 'Нагрузка', value: '-20%', fill: 20, accent: true },
		],
	},
}

const PRESET_BUTTONS: { id: PresetId; icon: string; labelKey: string }[] = [
	{ id: 'auto', icon: 'lucide:sparkles', labelKey: 'blog.cover.presetAuto' },
	{
		id: 'before-after',
		icon: 'lucide:repeat',
		labelKey: 'blog.cover.presetBeforeAfter',
	},
	{
		id: 'metrics',
		icon: 'lucide:activity',
		labelKey: 'blog.cover.presetMetrics',
	},
	{
		id: 'hidden',
		icon: 'lucide:eye-off',
		labelKey: 'blog.cover.presetHidden',
	},
]

interface Draft {
	preset: PresetId
	icon: string
	panelTitle: string
	rows: [RowDraft, RowDraft]
}

function toDraft(initial: ArticleCoverConfig | null): Draft {
	const rows = initial?.panel?.rows ?? []
	const mapRow = (r?: ArticleCoverPanelRow): RowDraft => ({
		label: r?.label ?? '',
		value: r?.value ?? '',
		fill: Math.round(Math.min(1, Math.max(0, r?.fill ?? 0.6)) * 100),
		accent: r?.accent === true,
	})
	if (initial?.mode === 'hidden') {
		return {
			preset: 'hidden',
			icon: initial.icon ?? '',
			panelTitle: '',
			rows: [mapRow(), mapRow()],
		}
	}
	if (initial?.mode === 'custom' || rows.length > 0) {
		const preset: PresetId =
			initial?.preset === 'metrics' ? 'metrics' : 'before-after'
		return {
			preset,
			icon: initial?.icon ?? '',
			panelTitle: initial?.panel?.title ?? '',
			rows: [
				mapRow(rows[0]),
				mapRow(rows[1] ?? { ...EMPTY_ROW, fill: 0.6, accent: true }),
			],
		}
	}
	if (initial?.icon) {
		return {
			preset: 'auto',
			icon: initial.icon,
			panelTitle: '',
			rows: [mapRow(), mapRow()],
		}
	}
	return {
		preset: 'auto',
		icon: '',
		panelTitle: '',
		rows: [mapRow(), mapRow()],
	}
}

function toConfig(draft: Draft): ArticleCoverConfig | null {
	const icon = draft.icon.trim().slice(0, 12) || undefined
	if (draft.preset === 'auto') return icon ? { icon } : null
	if (draft.preset === 'hidden')
		return { mode: 'hidden', ...(icon ? { icon } : {}) }
	const mapped = draft.rows
		.filter((r) => r.label.trim() || r.value.trim())
		.slice(0, 2)
		.map((r) => ({
			label: r.label.trim(),
			value: r.value.trim(),
			fill: Math.min(1, Math.max(0, r.fill / 100)),
			...(r.accent ? { accent: true as const } : {}),
		}))
	const title = draft.panelTitle.trim() || undefined
	if (!title && mapped.length === 0 && !icon) return null
	return {
		mode: 'custom',
		preset: draft.preset,
		...(icon ? { icon } : {}),
		...(title || mapped.length
			? {
					panel: {
						...(title ? { title } : {}),
						...(mapped.length ? { rows: mapped } : {}),
					},
				}
			: {}),
	}
}

interface CoverPanelModalProps {
	open: boolean
	onOpenChange: (v: boolean) => void
	initial: ArticleCoverConfig | null
	title: string
	tags: string[]
	content: string
	onSave: (config: ArticleCoverConfig | null) => void
}

export function CoverPanelModal({
	open,
	onOpenChange,
	initial,
	title,
	tags,
	content,
	onSave,
}: CoverPanelModalProps) {
	const t = useTranslations()
	const [draft, setDraft] = useState<Draft>(() => toDraft(initial))
	const { notFound: iconNotFound } = useIconifyBody(draft.icon)

	const handleOpenChange = (v: boolean) => {
		if (v) setDraft(toDraft(initial))
		onOpenChange(v)
	}

	const selectPreset = (preset: PresetId) => {
		setDraft((d) => {
			if (preset === 'before-after' || preset === 'metrics') {
				const p = PRESETS[preset]
				return {
					...d,
					preset,
					panelTitle: p.title,
					rows: [{ ...p.rows[0] }, { ...p.rows[1] }] as [
						RowDraft,
						RowDraft,
					],
				}
			}
			return { ...d, preset }
		})
	}

	const setRow = (index: number, patch: Partial<RowDraft>) => {
		setDraft((d) => {
			const rows = [...d.rows] as [RowDraft, RowDraft]
			rows[index] = { ...rows[index], ...patch }
			return { ...d, rows }
		})
	}

	const previewConfig = toConfig(draft)
	const showFields =
		draft.preset === 'before-after' || draft.preset === 'metrics'

	return (
		<Modal.Root onOpenChange={handleOpenChange} open={open}>
			<Modal.Content
				className="flex max-h-[90dvh] max-w-2xl flex-col overflow-hidden"
				fullScreen={false}
			>
				<Modal.Header>
					<Modal.Title>{t('blog.cover.title')}</Modal.Title>
				</Modal.Header>
				<Modal.Body className="min-h-0 flex-1 overflow-y-auto">
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-1.5">
							<span className="font-semibold text-sm">
								{t('blog.cover.icon')}
							</span>
							<div className="grid grid-cols-6 gap-1.5 sm:grid-cols-7">
								<button
									className={cn(
										'flex items-center justify-center rounded-lg border-2 px-2 py-2.5 font-medium text-xs transition-colors',
										!draft.icon.trim()
											? 'border-primary bg-primary/10 text-primary'
											: 'border-primary/20 text-text-accent hover:border-primary/50 hover:text-primary'
									)}
									onClick={() =>
										setDraft((d) => ({ ...d, icon: '' }))
									}
									title={t('blog.cover.iconNone')}
									type="button"
								>
									<Icon
										className="size-5"
										icon="lucide:ban"
									/>
								</button>
								{COVER_ICON_NAMES.map((name) => {
									const value = `lucide:${name}`
									const active = draft.icon.trim() === value
									return (
										<button
											className={cn(
												'flex items-center justify-center rounded-lg border-2 px-2 py-2.5 transition-colors',
												active
													? 'border-primary bg-primary/10 text-primary'
													: 'border-primary/20 text-text-accent hover:border-primary/50 hover:text-primary'
											)}
											key={name}
											onClick={() =>
												setDraft((d) => ({
													...d,
													icon: value,
												}))
											}
											title={value}
											type="button"
										>
											<Icon
												className="size-5"
												icon={value}
											/>
										</button>
									)
								})}
							</div>
							<Input
								label="blog.cover.iconCustom"
								onChange={(e) =>
									setDraft((d) => ({
										...d,
										icon: e.target.value,
									}))
								}
								value={draft.icon}
							/>
							{iconNotFound && (
								<span className="font-medium text-red-400 text-xs">
									{t('blog.cover.iconNotFound')}
								</span>
							)}
						</div>

						<div className="flex flex-col gap-1.5">
							<span className="font-semibold text-sm">
								{t('blog.cover.preset')}
							</span>
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
								{PRESET_BUTTONS.map((b) => {
									const active = draft.preset === b.id
									return (
										<button
											className={cn(
												'flex flex-col items-center gap-1.5 rounded-lg border-2 px-2 py-3 font-medium text-xs transition-colors',
												active
													? 'border-primary bg-primary/10 text-primary'
													: 'border-primary/20 text-text-accent hover:border-primary/50 hover:text-primary'
											)}
											key={b.id}
											onClick={() => selectPreset(b.id)}
											type="button"
										>
											<Icon
												className="size-5"
												icon={b.icon}
											/>
											{t(b.labelKey)}
										</button>
									)
								})}
							</div>
						</div>

						{showFields && (
							<div className="flex flex-col gap-3">
								<Input
									label="blog.cover.panelTitle"
									onChange={(e) =>
										setDraft((d) => ({
											...d,
											panelTitle: e.target.value,
										}))
									}
									value={draft.panelTitle}
								/>

								{draft.rows.map((row, i) => (
									<div
										className="flex flex-col gap-2 rounded-lg border border-primary/20 p-3"
										key={i}
									>
										<span className="font-semibold text-sm">
											{t('blog.cover.row', { n: i + 1 })}
										</span>
										<div className="grid grid-cols-2 gap-2">
											<Input
												label="blog.cover.rowLabel"
												onChange={(e) =>
													setRow(i, {
														label: e.target.value,
													})
												}
												value={row.label}
											/>
											<Input
												label="blog.cover.rowValue"
												onChange={(e) =>
													setRow(i, {
														value: e.target.value,
													})
												}
												value={row.value}
											/>
										</div>
										<div className="flex items-center gap-3">
											<span className="w-28 shrink-0 font-medium text-text-accent text-xs">
												{t('blog.cover.rowFill')}
											</span>
											<Slider
												onValueChange={(v) =>
													setRow(i, { fill: v })
												}
												value={row.fill}
											/>
											<span className="w-12 shrink-0 text-right font-mono text-xs">
												{row.fill}%
											</span>
										</div>
										<CheckBox
											checked={row.accent}
											label={t('blog.cover.rowAccent')}
											onCheckedChange={(v) =>
												setRow(i, { accent: v })
											}
										/>
									</div>
								))}
							</div>
						)}

						<div className="flex flex-col gap-1.5">
							<span className="font-semibold text-sm">
								{t('blog.cover.preview')}
							</span>
							<BlogCover
								content={content}
								icon={draft.icon.trim() || null}
								mode={previewConfig?.mode ?? null}
								panel={previewConfig?.panel ?? null}
								tags={tags}
								title={title || '…'}
							/>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Action
						onClick={() => {
							onSave(null)
							onOpenChange(false)
						}}
						variant="danger"
					>
						{t('blog.cover.reset')}
					</Modal.Action>
					<Modal.Close>{t('me.articleEditor.cancel')}</Modal.Close>
					<Modal.Action
						onClick={() => {
							onSave(previewConfig)
							onOpenChange(false)
						}}
					>
						{t('me.articleEditor.saveBtn')}
					</Modal.Action>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
