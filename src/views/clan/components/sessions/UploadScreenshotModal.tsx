'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { DetectedStage } from '@/constants/stageSchedule'
import { cn } from '@/lib/cn'
import { STAGE_TYPES } from './session.const'

interface UploadScreenshotModalProps {
	open: boolean
	uploadType: string
	uploadStage: number
	uploadDate: string
	uploadFiles: File | null
	uploading: boolean
	detected: DetectedStage | null
	onOpenChange: (open: boolean) => void
	onTypeChange: (type: string) => void
	onStageChange: (stage: number) => void
	onDateChange: (date: string) => void
	onFilesChange: (file: File | null) => void
	onUpload: () => void
}

export function UploadScreenshotModal({
	open,
	uploadType,
	uploadStage,
	uploadDate,
	uploadFiles,
	uploading,
	detected,
	onOpenChange,
	onTypeChange,
	onStageChange,
	onDateChange,
	onFilesChange,
	onUpload,
}: UploadScreenshotModalProps) {
	const t = useTranslations()
	const stageCount = uploadType === 'BASE_CAPTURE' ? 4 : 3

	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Trigger className="gap-2" variant="primary">
				<Icon className="text-lg" icon="lucide:upload" />
				{t('clan.sessions.upload')}
			</Modal.Trigger>
			<Modal.Content fullScreen={false}>
				<Modal.Header>
					<Modal.Title>{t('clan.sessions.uploadTitle')}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="flex flex-col gap-4">
						{detected && (
							<div className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
								<Icon
									className="text-base"
									icon="lucide:sparkles"
								/>
								<span>
									{t.rich('clan.sessions.detected', {
										label: t(`clan.stage.${detected.type}`),
										stage: detected.stage,
										strong: (chunks) => (
											<strong>{chunks}</strong>
										),
									})}
								</span>
							</div>
						)}
						<div className="flex flex-col gap-2">
							<p className="font-semibold text-sm">
								{t('clan.sessions.stageType')}
							</p>
							<div className="grid grid-cols-2 gap-2">
								{STAGE_TYPES.map((stageType, index) => (
									<button
										className={cn(
											'flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 font-semibold text-sm transition-colors',
											index === STAGE_TYPES.length - 1 &&
												'col-span-2',
											uploadType === stageType.value
												? 'border-accent bg-accent'
												: 'border-border-secondary hover:bg-accent/10'
										)}
										key={stageType.value}
										onClick={() =>
											onTypeChange(stageType.value)
										}
										type="button"
									>
										<Icon icon={stageType.icon} />
										{t(stageType.label)}
									</button>
								))}
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<p className="font-semibold text-sm">
								{t('clan.sessions.stage')}
							</p>
							<div className="grid grid-cols-4 gap-2">
								{Array.from(
									{ length: stageCount },
									(_, i) => i + 1
								).map((n) => (
									<button
										className={`flex cursor-pointer items-center justify-center rounded-lg border-2 px-3 py-2 font-semibold text-sm transition-colors ${
											uploadStage === n
												? 'border-accent bg-accent'
												: 'border-border-secondary hover:bg-accent/10'
										}`}
										key={n}
										onClick={() => onStageChange(n)}
										type="button"
									>
										{n}
									</button>
								))}
							</div>
						</div>
						<Input
							className={`${montserrat.className} font-semibold text-[14px]`}
							label="clan.sessions.stageDate"
							onChange={(e) => onDateChange(e.target.value)}
							type="date"
							value={uploadDate}
						/>
						<div className="flex flex-col gap-2">
							<p className="font-semibold text-sm">
								{t('clan.sessions.screenshotLabel')}
							</p>
							<label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-border-secondary border-dashed px-3 py-3 font-semibold text-sm transition-colors hover:bg-accent/10">
								<Icon
									className="text-lg"
									icon="lucide:image-plus"
								/>
								{uploadFiles
									? t('clan.sessions.fileSelected', {
											name: uploadFiles.name,
										})
									: t('clan.sessions.selectFile')}
								<input
									accept="image/png,image/jpeg,image/webp"
									className="hidden"
									disabled={uploading}
									onChange={(e) =>
										onFilesChange(
											e.target.files?.[0] ?? null
										)
									}
									type="file"
								/>
							</label>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('clan.common.cancel')}</Modal.Close>
					<Modal.Action
						className="gap-2"
						closeOnClick
						disabled={!uploadFiles || uploading}
						onClick={onUpload}
					>
						{uploading ? (
							<Icon
								className="animate-spin text-base"
								icon="lucide:loader-circle"
							/>
						) : (
							<Icon className="text-base" icon="lucide:upload" />
						)}
						{t('clan.sessions.upload')}
					</Modal.Action>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
