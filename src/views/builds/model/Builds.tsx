'use client'

import { Icon } from '@iconify/react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import Scene from '@/app/calcs/builds/model/Scene'
import { unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { useBuildStore } from '@/stores/useBuild.store'
import StatsTabs from '@/views/builds/components/StatsTabs'
import BuildSelector from '../components/BuildSelector'
import DefaultsSettings from '../components/DefaultsSettings'

export default function BuildsView() {
	const {
		savedBuilds,
		currentBuildId,
		resetBuild,
		updateBuild,
		exportBuild,
		importBuild,
		build,
	} = useBuildStore()

	const [showRenameModal, setShowRenameModal] = useState(false)
	const [buildName, setBuildName] = useState('')
	const [shareCopied, setShareCopied] = useState(false)
	const [imported, setImported] = useState(false)
	const t = useTranslations()

	const currentBuild = savedBuilds.find((b) => b.id === currentBuildId)

	const armorsQuery = useSuspenseQuery(itemsQueries.get({ type: 'armor' }))
	const containersQuery = useSuspenseQuery(
		itemsQueries.get({ type: 'containers' })
	)

	const armors = armorsQuery.data ?? []
	const containers = containersQuery.data ?? []

	const armorItem = armors.find((a) => a.id === build.armor?.id)
	const containerItem = containers.find((c) => c.id === build.container?.id)

	const armorModelQuery = useQuery({
		queryKey: ['item-model', 'armor', build.armor?.id],
		queryFn: async () => {
			if (!build.armor?.id || !armorItem?.category) return null
			const res = await fetch(
				`https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/items/${armorItem.category}/${build.armor.id}.json`
			)
			if (!res.ok) return null
			return res.json()
		},
		enabled: !!armorItem?.category && !!build.armor?.id,
	})

	const containerModelQuery = useQuery({
		queryKey: ['item-model', 'container', build.container?.id],
		queryFn: async () => {
			if (!build.container?.id || !containerItem?.category) return null
			const res = await fetch(
				`https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/items/${containerItem.category}/${build.container.id}.json`
			)
			if (!res.ok) return null
			return res.json()
		},
		enabled: !!containerItem?.category && !!build.container?.id,
	})

	const armorModel = armorModelQuery.data?.model
	const containerModel = containerModelQuery.data?.model

	const sceneArmor = useMemo(
		() => ({
			glb: armorModel?.model
				? `https://cdn.stalhub.tech/${armorModel.model}`
				: 'https://cdn.stalhub.tech/models/armor/hound/hound.glb',
			textures: {
				diff: armorModel?.diff
					? `https://cdn.stalhub.tech/${armorModel.diff}`
					: 'https://cdn.stalhub.tech/models/armor/hound/hound_diff.dds',
				emi: armorModel?.emi
					? `https://cdn.stalhub.tech/${armorModel.emi}`
					: undefined,
				nrm: armorModel?.nrm
					? `https://cdn.stalhub.tech/${armorModel.nrm}`
					: 'https://cdn.stalhub.tech/models/armor/hound/hound_nrm.dds',
			},
		}),
		[armorModel]
	)

	const sceneCont = useMemo(
		() => ({
			glb: containerModel?.model
				? `https://cdn.stalhub.tech/${containerModel.model}`
				: 'https://cdn.stalhub.tech/models/backpacks/cont_bear/bear6.glb',
			textures: {
				diff: containerModel?.diff
					? `https://cdn.stalhub.tech/${containerModel.diff}`
					: 'https://cdn.stalhub.tech/models/backpacks/cont_bear/bear6_diff.dds',
				emi: containerModel?.emi
					? `https://cdn.stalhub.tech/${containerModel.emi}`
					: undefined,
				nrm: containerModel?.nrm
					? `https://cdn.stalhub.tech/${containerModel.nrm}`
					: undefined,
			},
		}),
		[containerModel]
	)

	useEffect(() => {
		if (imported) return
		const params = new URLSearchParams(window.location.search)
		const shareCode = params.get('share')
		if (shareCode) {
			setTimeout(() => {
				importBuild(shareCode).then((success) => {
					if (success) {
						setImported(true)
						window.history.replaceState({}, '', '/calcs/builds')
					}
				})
			}, 100)
		}
	}, [importBuild, imported])

	const handleRename = () => {
		if (!buildName.trim() || !currentBuildId) return
		updateBuild(currentBuildId, { name: buildName.trim() })
		setBuildName('')
		setShowRenameModal(false)
	}

	return (
		<main className="mx-auto max-w-360 space-y-6 px-4 pt-42 pb-12 sm:px-6 md:px-8">
			<div
				className="grid grid-cols-1 gap-8 lg:grid-cols-[28%_60%]"
				id="builds_card"
			>
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<h1
							className={`${unbounded.className} text-3xl text-red-500`}
						>
							|{' '}
							{currentBuild
								? currentBuild.name
								: t('build.new_build')}
						</h1>

						<div className="flex flex-wrap items-center justify-between gap-2">
							<BuildSelector />

							<div className="flex gap-2">
								{currentBuild && (
									<Modal.Root
										onOpenChange={(open) => {
											setShowRenameModal(open)
											if (open)
												setBuildName(currentBuild.name)
										}}
										open={showRenameModal}
									>
										<Modal.Trigger
											asChild
											className="flex gap-2"
										>
											<Button
												className="flex gap-2 rounded-lg p-2"
												variant={'secondary'}
											>
												<Icon
													className="text-xl"
													icon="lucide:pencil"
												/>
											</Button>
										</Modal.Trigger>
										<Modal.Content>
											<Modal.Header>
												<Modal.Title>
													{t('build.rename')}
												</Modal.Title>
											</Modal.Header>
											<Modal.Body>
												<Input
													label="build.build_name"
													onChange={(
														e: React.ChangeEvent<HTMLInputElement>
													) =>
														setBuildName(
															e.target.value
														)
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
									onClick={async () => {
										const name =
											currentBuild?.name ||
											t('build.new_build')
										const encoded = await exportBuild(name)
										if (encoded) {
											const url = `${window.location.origin}/calcs/builds?share=${encodeURIComponent(encoded)}`
											navigator.clipboard.writeText(url)
											setShareCopied(true)
											setTimeout(
												() => setShareCopied(false),
												2000
											)
										}
									}}
									variant={
										shareCopied ? 'primary' : 'secondary'
									}
								>
									<Icon
										className="text-xl"
										icon={
											shareCopied
												? 'lucide:check'
												: 'lucide:share'
										}
									/>
								</Button>
								<Modal.Root>
									<Modal.Trigger
										className="p-2"
										variant={'secondary'}
									>
										<Icon
											className="text-xl"
											icon="lucide:settings"
										/>
									</Modal.Trigger>
									<Modal.Content className="max-w-md">
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
									onClick={resetBuild}
									variant={'danger'}
								>
									<Icon
										className="text-xl"
										icon="lucide:rotate-ccw"
									/>
								</Button>
							</div>
						</div>
					</div>

					<StatsTabs />
				</div>
				<div className="flex min-h-180 w-full items-center justify-center">
					<Scene armor={sceneArmor} cont={sceneCont} />
				</div>
			</div>
		</main>
	)
}
