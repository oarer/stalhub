'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { cn } from '@/lib/cn'

interface AddThemeModalProps {
	onAdded?: () => void
}

export default function AddThemeModal({ onAdded }: AddThemeModalProps) {
	const t = useTranslations()
	const { addTheme, fetchThemeFromUrl, parseThemeFromJson } = useCustomTheme()
	const [mode, setMode] = useState<'url' | 'json'>('url')
	const [urlInput, setUrlInput] = useState('')
	const [jsonInput, setJsonInput] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const handleUrlSubmit = async () => {
		if (!urlInput.trim()) return
		setError(null)
		setLoading(true)
		try {
			const theme = await fetchThemeFromUrl(urlInput.trim())
			addTheme(theme)
			setUrlInput('')
			onAdded?.()
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to load theme')
		} finally {
			setLoading(false)
		}
	}

	const handleJsonSubmit = () => {
		if (!jsonInput.trim()) return
		setError(null)
		try {
			const theme = parseThemeFromJson(jsonInput.trim())
			addTheme(theme)
			setJsonInput('')
			onAdded?.()
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Invalid JSON')
		}
	}

	return (
		<Modal.Root>
			<Modal.Trigger
				className="flex items-center gap-1 text-sm"
				variant="ghost"
			>
				<Icon className="text-lg" icon="lucide:plus" />
				<span>{t('themes.add')}</span>
			</Modal.Trigger>

			<Modal.Content fullScreen={false}>
				<Modal.Header>
					<Modal.Title>{t('themes.addCustom')}</Modal.Title>
				</Modal.Header>

				<Modal.Body className="flex flex-col gap-2">
					<div className="flex gap-1 rounded-lg bg-muted/50 p-1">
						<Button
							className={cn(
								'w-full',
								mode === 'url' &&
									'bg-primary/40 text-foreground hover:bg-primary/40'
							)}
							onClick={() => setMode('url')}
							variant={'ghost'}
						>
							URL
						</Button>
						<Button
							className={cn(
								'w-full',
								mode === 'json' &&
									'bg-primary/40 text-foreground hover:bg-primary/40'
							)}
							onClick={() => setMode('json')}
							variant={'ghost'}
						>
							JSON
						</Button>
					</div>

					{mode === 'url' ? (
						<div className="flex flex-col gap-3">
							<Input
								onChange={(e) => setUrlInput(e.target.value)}
								placeholder="https://tweakcn.com/r/themes/catppuccin.json"
								type="url"
								value={urlInput}
							/>
							<Button
								className="w-full"
								disabled={loading || !urlInput.trim()}
								onClick={handleUrlSubmit}
							>
								{loading ? '...' : t('themes.load')}
							</Button>
						</div>
					) : (
						<div className="flex flex-col gap-3">
							<textarea
								className="min-h-40 w-full resize-none rounded-lg border-2 border-primary bg-card px-3 py-2 font-mono text-foreground text-sm outline-none transition-colors focus:border-primary"
								onChange={(e) => setJsonInput(e.target.value)}
								placeholder='{"name":"my-theme","cssVars":{"light":{...},"dark":{...}}}'
								value={jsonInput}
							/>
							<Button
								className="w-full"
								disabled={!jsonInput.trim()}
								onClick={handleJsonSubmit}
							>
								{t('themes.import')}
							</Button>
						</div>
					)}

					{error && (
						<p className="mt-2 text-destructive text-sm">{error}</p>
					)}

					<Alert.Root>
						<Alert.Description>
							{t.rich('themes.hint', {
								domain: (chunks) => (
									<Link
										className="text-primary"
href="https://tweakcn.com"
  target="_blank"
  rel="noopener noreferrer"
									>
										{chunks}
									</Link>
								),
							})}
						</Alert.Description>
					</Alert.Root>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}
