'use client'

import { Icon } from '@iconify/react'
import type { useTranslations } from 'next-intl'
import { useState } from 'react'
import { unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { SavedBuild } from '@/stores/useBuild.store'
import BuildSelector from '../../components/BuildSelector'
import DefaultsSettings from '../../components/DefaultsSettings'

type BuildLiteHeaderProps = {
	currentBuild: SavedBuild | undefined
	currentBuildId: string | null
	onRename: (buildId: string, name: string) => void
	onExport: (name: string) => Promise<string | null>
	onReset: () => void
	t: ReturnType<typeof useTranslations>
}

export function BuildLiteHeader({
	currentBuild,
	currentBuildId,
	onRename,
	onExport,
	onReset,
	t,
}: BuildLiteHeaderProps) {
	const [showRenameModal, setShowRenameModal] = useState(false)
	const [buildName, setBuildName] = useState('')
	const [shareCopied, setShareCopied] = useState(false)

	const handleRename = () => {
		if (!buildName.trim() || !currentBuildId) return

		onRename(currentBuildId, buildName.trim())
		setBuildName('')
		setShowRenameModal(false)
	}

	const handleShare = async () => {
		const name = currentBuild?.name || t('build.new_build')
		const encoded = await onExport(name)
		if (!encoded) return

		const url = `${window.location.origin}/calcs/builds/lite?share=${encodeURIComponent(encoded)}`
		navigator.clipboard.writeText(url)
		setShareCopied(true)
		setTimeout(() => setShareCopied(false), 2000)
	}

	return (
		<div className="flex flex-col gap-2">
			<h1 className={`${unbounded.className} text-3xl text-red-500`}>
				| {currentBuild ? currentBuild.name : t('build.new_build')}
			</h1>
			<div className="flex flex-wrap items-center gap-2">
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

					<Button
						className="flex gap-2 rounded-lg p-2"
						onClick={handleShare}
						variant={shareCopied ? 'primary' : 'secondary'}
					>
						<Icon
							className="text-xl"
							icon={shareCopied ? 'lucide:check' : 'lucide:share'}
						/>
					</Button>
					<Modal.Root>
						<Modal.Trigger className="p-2" variant="secondary">
							<Icon className="text-xl" icon="lucide:settings" />
						</Modal.Trigger>
						<Modal.Content className="max-w-md" fullScreen={false}>
							<Modal.Header className="py-2 pt-6">
								<Modal.Title>Настройки</Modal.Title>
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
