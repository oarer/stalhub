'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import type { TweakcnTheme } from '@/themes/type'
import AddThemeModal from './AddThemeModal'

function ThemePreview({ theme }: { theme: TweakcnTheme }) {
	const light = theme.cssVars.light
	const dark = theme.cssVars.dark
	const bg = dark.background || light.background
	const fg = dark.foreground || light.foreground
	const primary = dark.primary || light.primary
	const accent = dark.accent || light.accent

	return (
		<div
			className="flex items-center gap-2"
			style={{ '--preview-bg': bg } as React.CSSProperties}
		>
			<div className="flex gap-0.5">
				<div
					className="size-3.5 rounded-full ring-1 ring-black/10"
					style={{ backgroundColor: primary }}
				/>
				<div
					className="size-3.5 rounded-full ring-1 ring-black/10"
					style={{ backgroundColor: bg }}
				/>
				<div
					className="size-3.5 rounded-full ring-1 ring-black/10"
					style={{ backgroundColor: fg }}
				/>
				<div
					className="size-3.5 rounded-full ring-1 ring-black/10"
					style={{ backgroundColor: accent }}
				/>
			</div>
		</div>
	)
}

interface ThemeGridProps {
	onThemeChanged?: () => void
}

export default function ThemeGrid({ onThemeChanged }: ThemeGridProps) {
	const t = useTranslations()
	const { store, setActiveTheme, removeTheme } = useCustomTheme()
	const themeList = Object.values(store.themes)

	const handleSelect = (name: string) => {
		setActiveTheme(name === store.active ? null : name)
		onThemeChanged?.()
	}

	const handleDelete = (e: React.MouseEvent, name: string) => {
		e.stopPropagation()
		removeTheme(name)
		onThemeChanged?.()
	}

	return (
		<div className="flex flex-col gap-2">
			<p className="font-semibold text-muted-foreground text-xs">
				{t('themes.colorThemes')}
			</p>
			<div className="grid grid-cols-2 gap-2">
				{themeList.map((theme) => (
					<div
						className={`group relative flex cursor-pointer flex-col gap-2 rounded-lg border-2 bg-card px-3 py-2 text-sm transition-colors hover:bg-accent/20 ${
							store.active === theme.name
								? 'border-primary/80'
								: 'border-accent/20'
						}`}
						key={theme.name}
						onClick={() => handleSelect(theme.name)}
					>
						<div className="flex gap-2">
							<ThemePreview theme={theme} />
							<Button
								className="p-1 text-muted-foreground opacity-0 ring-0 transition-opacity group-hover:opacity-100"
								onClick={(e) => handleDelete(e, theme.name)}
								variant={'danger'}
							>
								<Icon className="text-base" icon="lucide:x" />
							</Button>
						</div>
						<p className="max-w-20 truncate font-semibold text-sm">
							{theme.name}
						</p>
					</div>
				))}

				<AddThemeModal onAdded={onThemeChanged} />
			</div>
		</div>
	)
}
