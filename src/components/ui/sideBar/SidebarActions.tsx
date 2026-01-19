'use client'

import { useTranslation } from 'react-i18next'

import { motion } from 'motion/react'
import { Icon } from '@iconify/react'

import { Button } from '../Button'

interface SidebarActionsProps {
	onExport?: () => void
}

export default function SidebarActions({ onExport }: SidebarActionsProps) {
	const { t } = useTranslation()

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="border-border/30 flex items-center justify-between gap-2 border-t-2 pt-3"
			initial={{ opacity: 0, y: 10 }}
			transition={{ delay: 0.2 }}
		>
			{onExport && (
				<Button
					className="flex items-center gap-3"
					onClick={onExport}
					variant={'secondary'}
				>
					<Icon icon="lucide:download" />
					{t('map.sideBar.export')}
				</Button>
			)}

			<Button
				className="flex items-center gap-3"
				onClick={scrollToTop}
				variant={'secondary'}
			>
				<Icon icon="lucide:arrow-up" />
				{t('map.sideBar.top')}
			</Button>
		</motion.div>
	)
}
