import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { QuestMapMarker } from '@/components/wiki/quest-map'
import { useMaps } from '@/hooks/useMaps'

interface QuestMapModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onInsert: (
		mapId: string,
		mapName: string,
		markers: QuestMapMarker[]
	) => void
}

export function QuestMapModal({
	open,
	onOpenChange,
	onInsert,
}: QuestMapModalProps) {
	const t = useTranslations('articles.quest')
	const { maps } = useMaps()
	const [mapId, setMapId] = useState('')
	const [markers, setMarkers] = useState<QuestMapMarker[]>([])
	const mapOptions = maps.map((map) => ({
		value: map.name,
		label: map.title.en ?? map.name,
	}))

	const patchMarker = (index: number, patch: Partial<QuestMapMarker>) => {
		setMarkers((current) =>
			current.map((marker, markerIndex) =>
				markerIndex === index ? { ...marker, ...patch } : marker
			)
		)
	}

	const handleInsert = () => {
		const map = maps.find((candidate) => candidate.name === mapId)
		if (!map) return
		onInsert(map.name, map.title.en ?? map.name, markers)
		setMapId('')
		setMarkers([])
		onOpenChange(false)
	}

	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Content className="max-w-2xl" fullScreen={false}>
				<Modal.Header>
					<Modal.Title>{t('markers')}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-1">
							<span className="font-semibold text-sm">
								{t('map')}
							</span>
							<Combobox
								onValueChange={setMapId}
								options={mapOptions}
								placeholder="articles.quest.selectMap"
								translateOptions={false}
								value={mapId}
							/>
						</div>

						{markers.map((marker, index) => (
							<div
								className="grid grid-cols-[1fr_1fr_2fr_auto] gap-2"
								key={index}
							>
								<Input
									aria-label="X"
									onChange={(event) =>
										patchMarker(index, {
											x: Number(event.target.value),
										})
									}
									type="number"
									value={marker.x}
								/>
								<Input
									aria-label="Y"
									onChange={(event) =>
										patchMarker(index, {
											y: Number(event.target.value),
										})
									}
									type="number"
									value={marker.y}
								/>
								<Input
									aria-label={t('markerLabel')}
									onChange={(event) =>
										patchMarker(index, {
											label: event.target.value,
										})
									}
									value={marker.label ?? ''}
								/>
								<Button
									onClick={() =>
										setMarkers((current) =>
											current.filter(
												(_, markerIndex) =>
													markerIndex !== index
											)
										)
									}
									variant="danger"
								>
									<Icon icon="lucide:trash-2" />
								</Button>
							</div>
						))}

						<div className="flex justify-between gap-2">
							<Button
								onClick={() =>
									setMarkers((current) => [
										...current,
										{ x: 0, y: 0 },
									])
								}
								variant="secondary"
							>
								{t('addMarker')}
							</Button>
							<Button disabled={!mapId} onClick={handleInsert}>
								{t('markers')}
							</Button>
						</div>
					</div>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}
