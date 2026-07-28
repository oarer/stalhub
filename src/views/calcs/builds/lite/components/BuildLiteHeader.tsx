'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { useTranslations } from 'next-intl'
import { useState } from 'react'
import { unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { buildApiService } from '@/services/build-api/build-api.service'
import type { SavedBuild } from '@/stores/useBuild.store'
import BuildSelector from '../../components/BuildSelector'
import DefaultsSettings from '../../components/DefaultsSettings'

type BuildLiteHeaderProps = {
	currentBuild: SavedBuild | undefined
	currentBuildId: string | null
	onRename: (buildId: string, name: string) => void
	onExport: (name: string) => Promise<string | null>
	onSavePng: () => void
	onReset: () => void
	onUpdateBuild: (
		id: string,
		data: Partial<Pick<SavedBuild, 'name' | 'apiBuildId'>>
	) => void
	savingPng: boolean
	t: ReturnType<typeof useTranslations>
}

export function BuildLiteHeader({
	currentBuild,
	currentBuildId,
	onRename,
	onExport,
	onSavePng,
	onReset,
	onUpdateBuild,
	savingPng,
	t,
}: BuildLiteHeaderProps) {
	const [showRenameModal, setShowRenameModal] = useState(false)
	const [buildName, setBuildName] = useState('')
	const queryClient = useQueryClient()

	const isPublished = Boolean(currentBuild?.apiBuildId)

	const publishMutation = useMutation({
		mutationFn: () => {
			const name = currentBuild?.name || 'Build'
			return buildApiService.create({
				title: name,
				data: currentBuild!.build,
			})
		},
		onSuccess: (result) => {
			if (currentBuildId && result.id) {
				onUpdateBuild(currentBuildId, { apiBuildId: result.id })
			}
			toast.success('Сборка опубликована')
			queryClient.invalidateQueries({ queryKey: ['builds'] })
		},
		onError: () => toast.error('Ошибка публикации'),
	})

	const updateMutation = useMutation({
		mutationFn: () => {
			if (!currentBuild?.apiBuildId) return Promise.reject()
			return buildApiService.update(currentBuild.apiBuildId, {
				title: currentBuild.name,
				data: currentBuild.build,
			})
		},
		onSuccess: () => {
			toast.success('Сборка обновлена')
			queryClient.invalidateQueries({ queryKey: ['builds'] })
		},
		onError: () => toast.error('Ошибка обновления'),
	})

	const handleRename = () => {
		if (!buildName.trim() || !currentBuildId) return

		onRename(currentBuildId, buildName.trim())
		setBuildName('')
		setShowRenameModal(false)
	}

	const handleCopyLink = () => {
		if (!currentBuild?.apiBuildId) return
		const url = `${window.location.origin}/calcs/builds/lite?build=${currentBuild.apiBuildId}`
		navigator.clipboard.writeText(url)
		toast.success('Ссылка скопирована')
	}

	const handleCopyShare = async () => {
		const name = currentBuild?.name || t('build.new_build')
		const encoded = await onExport(name)
		if (!encoded) return

		const url = `${window.location.origin}/calcs/builds/lite?share=${encodeURIComponent(encoded)}`
		navigator.clipboard.writeText(url)
		toast.success('Ссылка скопирована')
	}

	return (
		<div className="flex flex-col gap-2">
			<h1 className={`${unbounded.className} text-3xl text-red-500`}>
				| {currentBuild ? currentBuild.name : t('build.new_build')}
			</h1>
			<div
				className="flex flex-wrap items-center gap-2"
				data-png-exclude="true"
			>
				<BuildSelector />
				<div className="flex gap-2">
					{currentBuild && (
						<Modal.Root
							onOpenChange={(open) => {
								setShowRenameModal(open)
								if (open) setBuildName(currentBuild.name)
							}}
							open={showRenameModal}
						>
							<Modal.Trigger asChild className="flex gap-2">
								<Button
									className="flex gap-2 rounded-lg p-2"
									variant="secondary"
								>
									<Icon
										className="text-xl"
										icon="lucide:pencil"
									/>
								</Button>
							</Modal.Trigger>
							<Modal.Content fullScreen={false}>
								<Modal.Header>
									<Modal.Title>
										{t('build.rename')}
									</Modal.Title>
								</Modal.Header>
								<Modal.Body>
									<Input
										label="build.build_name"
										onChange={(e) =>
											setBuildName(e.target.value)
										}
										value={buildName}
									/>
								</Modal.Body>
								<Modal.Footer>
									<Modal.Close>
										{t('build.cancel')}
									</Modal.Close>
									<Modal.Action
										disabled={!buildName.trim()}
										onClick={handleRename}
									>
										{t('build.save')}
									</Modal.Action>
								</Modal.Footer>
							</Modal.Content>
						</Modal.Root>
					)}

					{currentBuild && (
						<Modal.Root>
							<Modal.Trigger asChild>
								<Button
									className="flex gap-2 rounded-lg p-2"
									variant="secondary"
								>
									<Icon
										className="text-xl"
										icon="lucide:share"
									/>
								</Button>
							</Modal.Trigger>
							<Modal.Content fullScreen={false}>
								<Modal.Header>
									<Modal.Title className="flex items-center gap-2">
										<Icon icon="lucide:link" />
										Поделиться сборкой
									</Modal.Title>
								</Modal.Header>
								<Modal.Body>
									<div className="flex flex-col gap-2">
										{isPublished && (
											<Button
												className="flex w-full items-center gap-2 font-semibold"
												onClick={handleCopyLink}
												variant="secondary"
											>
												<Icon icon="lucide:link" />
												Копировать публичную ссылку
											</Button>
										)}
										<Button
											className="flex w-full items-center gap-2 font-semibold"
											onClick={handleCopyShare}
											variant="secondary"
										>
											<Icon icon="lucide:copy" />
											Копировать код сборки
										</Button>
										{isPublished ? (
											<Button
												className="flex w-full items-center gap-2 font-bold"
												loading={
													updateMutation.isPending
												}
												onClick={() =>
													updateMutation.mutate()
												}
												variant="primary"
											>
												<Icon icon="lucide:refresh-cw" />
												Обновить на сервере
											</Button>
										) : (
											<Button
												className="flex w-full items-center gap-2"
												loading={
													publishMutation.isPending
												}
												onClick={() =>
													publishMutation.mutate()
												}
												variant="primary"
											>
												<Icon icon="lucide:upload" />
												Опубликовать
											</Button>
										)}
									</div>
								</Modal.Body>
							</Modal.Content>
						</Modal.Root>
					)}
					<Button
						className="flex gap-2 rounded-lg p-2"
						loading={savingPng}
						onClick={onSavePng}
						variant="secondary"
					>
						<Icon className="text-xl" icon="lucide:image-down" />
					</Button>
					<Modal.Root>
						<Modal.Trigger className="p-2" variant="secondary">
							<Icon className="text-xl" icon="lucide:settings" />
						</Modal.Trigger>
						<Modal.Content className="max-w-md" fullScreen={false}>
							<Modal.Header className="py-2 pt-6">
								<Modal.Title className="flex items-center gap-2">
									<Icon icon="lucide:settings" />
									Настройки
								</Modal.Title>
							</Modal.Header>

							<Modal.Body className="py-2 pb-6">
								<DefaultsSettings />
							</Modal.Body>
						</Modal.Content>
					</Modal.Root>
					<Button
						className="flex gap-2 rounded-lg p-2 ring-transparent"
						onClick={onReset}
						variant="danger"
					>
						<Icon className="text-xl" icon="lucide:rotate-ccw" />
					</Button>
				</div>
			</div>
		</div>
	)
}
