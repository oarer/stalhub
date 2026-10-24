'use client'

import { Icon } from '@iconify/react'
import { useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { useTranslations } from 'next-intl'
import { type FormEvent, useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Combobox } from '@/components/ui/Combobox'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { playerQueries } from '@/queries/player/player.queries'
import { Regions } from '@/types/api.type'
import {
	isSamePlayer,
	type PlayerRef,
	playerKey,
} from './playerComparisonUtils'

type PlayerPickerDialogProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	region: Regions
	exclude: readonly PlayerRef[] | null
	onPick: (ref: PlayerRef) => void
}

const regionOptions = Object.values(Regions).map((region) => ({
	value: region,
	label: `region.${region}`,
}))

export function PlayerPickerDialog({
	open,
	onOpenChange,
	region,
	exclude,
	onPick,
}: PlayerPickerDialogProps) {
	const t = useTranslations()
	const queryClient = useQueryClient()
	const [selectedRegion, setSelectedRegion] = useState<Regions>(region)
	const [character, setCharacter] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!open) return
		setSelectedRegion(region)
		setCharacter('')
		setIsLoading(false)
		setError(null)
	}, [open, region])

	const submit = async () => {
		const name = character.trim()
		if (!name || isLoading) return

		const ref: PlayerRef = { region: selectedRegion, character: name }

		const added = (exclude ?? []).some((player) =>
			isSamePlayer(player, ref)
		)
		if (added) {
			setError(t('player.comparison.alreadyAdded'))
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			await queryClient.fetchQuery({
				...playerQueries.get(ref),
				retry: false,
			})
			onPick(ref)
		} catch (e) {
			const status = (e as AxiosError).response?.status
			setError(
				status === 404
					? t('player.comparison.notFound')
					: t('player.comparison.loadError')
			)
		} finally {
			setIsLoading(false)
		}
	}

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		void submit()
	}

	const excludedKeys = new Set((exclude ?? []).map(playerKey))
	const hintKey = `${selectedRegion}:${character.trim().toLocaleLowerCase()}`
	const alreadyAdded = character.trim() !== '' && excludedKeys.has(hintKey)

	return (
		<Modal.Root onOpenChange={onOpenChange} open={open}>
			<Modal.Content className="flex flex-col sm:max-h-[90dvh] sm:w-full sm:max-w-xl">
				<Modal.Header className="pr-12">
					<Modal.Title>
						{t('player.comparison.pickTitle')}
					</Modal.Title>
				</Modal.Header>

				<form className="space-y-4 pb-3" onSubmit={handleSubmit}>
					<p className="text-muted-foreground text-xs">
						{t('player.comparison.pickHint')}
					</p>

					<div className="grid grid-cols-[88px_1fr] gap-2">
						<Combobox
							onValueChange={(value) =>
								setSelectedRegion(value as Regions)
							}
							options={regionOptions}
							placeholder={selectedRegion}
							value={selectedRegion}
						/>
						<div
							onKeyDownCapture={(event) => {
								if (event.key === 'Enter') {
									event.preventDefault()
									void submit()
								}
							}}
						>
							<Input
								className="h-full"
								label="player.comparison.pickSearch"
								onChange={(event) => {
									setCharacter(event.target.value)
									setError(null)
								}}
								value={character}
							/>
						</div>
					</div>

					{error && (
						<p
							className="flex items-center gap-2 text-destructive text-sm"
							role="alert"
						>
							<Icon icon="lucide:triangle-alert" />
							{error}
						</p>
					)}

					{alreadyAdded && !error && (
						<p className="flex items-center gap-2 text-muted-foreground text-sm">
							<Icon icon="lucide:info" />
							{t('player.comparison.alreadyAdded')}
						</p>
					)}

					<Button
						className="w-full"
						disabled={!character.trim() || isLoading}
						loading={isLoading}
						type="submit"
					>
						<Icon className="mr-2" icon="lucide:user-round-plus" />
						{t('player.comparison.pickAction')}
					</Button>
				</form>
			</Modal.Content>
		</Modal.Root>
	)
}
