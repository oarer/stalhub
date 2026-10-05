'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Tabs } from '@/components/ui/Tabs'
import type { DetectedStage } from '@/constants/stageSchedule'
import { cn } from '@/lib/cn'
import { STAGE_TYPES } from '@/views/clan/components/sessions/session.const'
import type { PersonalUploadMode } from './hooks/usePersonalUpload'

interface PersonalUploadModalProps {
	open: boolean
	mode: PersonalUploadMode
	mapName: string
	uploadType: string
	uploadStage: number
	uploadDate: string
	uploadFile: File | null
	uploading: boolean
	detected: DetectedStage | null
	onOpenChange: (open: boolean) => void
	onModeChange: (mode: PersonalUploadMode) => void
	onMapNameChange: (v: string) => void
	onTypeChange: (type: string) => void
	onStageChange: (stage: number) => void
	onDateChange: (date: string) => void
	onFileChange: (file: File | null) => void
	onUpload: () => void
}

export function PersonalUploadModal({
	open,
	mode,
	mapName,
	uploadType,
	uploadStage,
	uploadDate,
	uploadFile,
	uploading,
	detected,
	onOpenChange,
	onModeChange,
	onMapNameChange,
	onTypeChange,
	onStageChange,
	onDateChange,
	onFileChange,
	onUpload,
}: PersonalUploadModalProps) {
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
					<Modal.Title>{t('personal.uploadTitle')}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Tabs.Root onValueChange={(v) => onModeChange(v as PersonalUploadMode)} value={mode}>
						<Tabs.List className="grid grid-cols-2">
							<Tabs.Trigger value="stage">
								<Icon className="text-base" icon="lucide:swords" />
								{t('personal.uploadModeStage')}
							</Tabs.Trigger>
							<Tabs.Trigger value="quick">
								<Icon className="text-base" icon="lucide:zap" />
								{t('personal.uploadModeQuick')}
							</Tabs.Trigger>
						</Tabs.List>

						<Tabs.Content value="quick">
							<div className="flex flex-col gap-4">
								<div className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
									<Icon className="text-base" icon="lucide:sparkles" />
									<span className="font-semibold">
										{detected
											? t.rich('clan.sessions.detected', {
													label: t(`clan.stage.${detected.type}`),
													stage: detected.stage,
													strong: (chunks) => <strong>{chunks}</strong>,
												})
											: t('personal.noDetectedStage')}
									</span>
								</div>
								<FileDrop
									disabled={uploading}
									file={uploadFile}
									onFileChange={onFileChange}
								/>
								<p className="text-muted-foreground text-xs">
									{t('personal.quickHint')}
								</p>
							</div>
						</Tabs.Content>

						<Tabs.Content value="stage">
							<div className="flex flex-col gap-4">
								{detected && (
									<div className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
										<Icon className="text-base" icon="lucide:sparkles" />
										<span className="font-semibold">
											{t.rich('clan.sessions.detected', {
												label: t(`clan.stage.${detected.type}`),
												stage: detected.stage,
												strong: (chunks) => <strong>{chunks}</strong>,
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
											<Button
												className={cn(
													'gap-2 font-semibold',
													index === STAGE_TYPES.length - 1 && 'col-span-2',
													uploadType === stageType.value && 'bg-primary/60'
												)}
												key={stageType.value}
												onClick={() => onTypeChange(stageType.value)}
												variant={'secondary'}
											>
												<Icon icon={stageType.icon} />
												{t(stageType.label)}
											</Button>
										))}
									</div>
								</div>
								<div className="flex flex-col gap-2">
									<p className="font-semibold text-sm">
										{t('clan.sessions.stage')}
									</p>
									<div className="grid grid-cols-4 gap-2">
										{Array.from({ length: stageCount }, (_, i) => i + 1).map(
											(n) => (
												<Button
													className={`py-1 font-semibold text-lg ${
														uploadStage === n && 'bg-primary/60'
													}`}
													key={n}
													onClick={() => onStageChange(n)}
													variant={'secondary'}
												>
													{n}
												</Button>
											)
										)}
									</div>
								</div>
								<Input
									className="font-mono font-semibold text-[14px]"
									label="clan.sessions.stageDate"
									onChange={(e) => onDateChange(e.target.value)}
									type="date"
									value={uploadDate}
								/>
								<Input
									label="personal.sessionName"
									onChange={(e) => onMapNameChange(e.target.value)}
									placeholder={t('personal.sessionNamePh')}
									value={mapName}
								/>
								<FileDrop
									disabled={uploading}
									file={uploadFile}
									onFileChange={onFileChange}
								/>
							</div>
						</Tabs.Content>
					</Tabs.Root>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('clan.common.cancel')}</Modal.Close>
					<Modal.Action
						className="gap-2"
						closeOnClick
						disabled={!uploadFile || uploading}
						onClick={onUpload}
					>
						{uploading ? (
							<Icon className="animate-spin text-base" icon="lucide:loader-circle" />
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

function FileDrop({
	file,
	disabled,
	onFileChange,
}: {
	file: File | null
	disabled: boolean
	onFileChange: (f: File | null) => void
}) {
	const t = useTranslations()
	return (
		<div className="flex flex-col gap-2">
			<p className="font-semibold text-sm">{t('clan.sessions.screenshotLabel')}</p>
			<label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-primary/50 border-dashed px-3 py-3 font-semibold text-sm transition-colors hover:bg-accent/10">
				<Icon className="text-lg" icon="lucide:image-plus" />
				{file
					? t('clan.sessions.fileSelected', { name: file.name })
					: t('clan.sessions.selectFile')}
				<input
					accept="image/png,image/jpeg,image/webp"
					className="hidden"
					disabled={disabled}
					onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
					type="file"
				/>
			</label>
		</div>
	)
}
