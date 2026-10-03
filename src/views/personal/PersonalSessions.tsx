'use client'

import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from '@/components/ui/Toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { personalQueries } from '@/queries/personal/personal.queries'
import { personalService } from '@/services/personal/personal.service'

export function PersonalSessions({ region }: { region: string }) {
	const t = useTranslations('personal')
	const qc = useQueryClient()
	const { data: sessions } = useSuspenseQuery(personalQueries.getSessions())
	const [mapName, setMapName] = useState('')
	const [busy, setBusy] = useState(false)

	const reload = () => qc.invalidateQueries({ queryKey: ['personal'] })

	const create = async () => {
		if (!mapName.trim()) return
		setBusy(true)
		try {
			await personalService.createSession({
				region,
				map_name: mapName.trim(),
				type: 'TOURNAMENT',
			})
			setMapName('')
			toast.success(t('sessionCreated'))
			reload()
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Error')
		} finally {
			setBusy(false)
		}
	}

	const remove = async (id: number) => {
		if (!confirm(t('sessionDeleteConfirm'))) return
		await personalService.deleteSession(id)
		reload()
	}

	const upload = async (id: number, file: File) => {
		try {
			await personalService.uploadScreenshot(id, file)
			toast.success(t('screenshotUploaded'))
			reload()
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Error')
		}
	}

	return (
		<Card.Root className="flex flex-col gap-3 p-5">
			<h3 className="font-semibold">{t('sessionsTitle')}</h3>
			<div className="flex gap-2">
				<Input
					onChange={(e) => setMapName(e.target.value)}
					placeholder={t('sessionPlaceholder')}
					value={mapName}
				/>
				<Button disabled={busy || !mapName.trim()} onClick={create}>
					{t('sessionCreate')}
				</Button>
			</div>
			<div className="flex flex-col gap-2">
				{(sessions ?? []).map((s) => (
					<div
						className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-accent px-3 py-2 text-sm"
						key={s.id}
					>
						<div>
							<p className="font-medium">{s.map_name}</p>
							<p className="text-muted-foreground text-xs">
								{s.type} · {new Date(s.started_at).toLocaleString()}
								{s.victory === true ? ' · ✓' : s.victory === false ? ' · ✗' : ''}
							</p>
						</div>
						<div className="flex items-center gap-2">
							<label className="cursor-pointer rounded-md bg-primary px-2 py-1 text-primary-foreground text-xs">
								{t('upload')}
								<input
									accept="image/png,image/jpeg,image/webp"
									className="hidden"
									onChange={(e) => {
										const f = e.target.files?.[0]
										if (f) upload(s.id, f)
									}}
									type="file"
								/>
							</label>
							<Button onClick={() => remove(s.id)} size="sm" variant="ghost">
								{t('delete')}
							</Button>
						</div>
					</div>
				))}
				{(sessions ?? []).length === 0 && (
					<p className="text-muted-foreground text-sm">{t('noSessions')}</p>
				)}
			</div>
		</Card.Root>
	)
}
