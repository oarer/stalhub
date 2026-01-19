'use client'

import { Icon } from '@iconify/react'

import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { Button } from '../Button'

interface SidebarHeaderProps {
	hasClusters: boolean
	showAll: () => void
	hideAll: () => void
}

export default function SidebarHeader({
	hasClusters,
	showAll,
	hideAll,
}: SidebarHeaderProps) {
	const { t } = useTranslation()

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="border-border/30 flex items-center justify-between gap-2 border-b-2 pb-3"
			initial={{ opacity: 0, y: -10 }}
		>
			<Button
				className="flex items-center gap-3"
				disabled={!hasClusters}
				onClick={showAll}
				size={'sm'}
				variant={'secondary'}
			>
				<Icon className="text-md" icon="lucide:eye" />
				{t('map.sideBar.showAll')}
			</Button>

			<Button
				className="flex items-center gap-3"
				disabled={!hasClusters}
				onClick={hideAll}
				size={'sm'}
				variant={'secondary'}
			>
				<Icon className="text-md" icon="lucide:eye-off" />
				{t('map.sideBar.hideAll')}
			</Button>
		</motion.div>
	)
}
