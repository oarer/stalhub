'use client'

import { useState } from 'react'

import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '@iconify/react'

import type { MarkerClusterFull as MarkerClusterType } from '@/types/map.type'
import { CheckBox } from '../CheckBox'
import type { Locale } from '@/types/item.type'
import { getLocale } from '@/lib/getLocale'

type TranslatedText = Partial<Record<Locale, string>>

interface ClusterItemProps {
	cluster: MarkerClusterType
	isVisible: boolean
	visibleGroupKeys: Set<string>
	toggleCluster: (clusterId: number) => void
	toggleGroup: (clusterId: number, groupId: number) => void
}

export default function ClusterItem({
	cluster,
	isVisible,
	visibleGroupKeys,
	toggleCluster,
	toggleGroup,
}: ClusterItemProps) {
	const [isExpanded, setIsExpanded] = useState(true)
	const lang = getLocale() as Locale

	const clusterName = String(
		(cluster.name as TranslatedText)?.[lang] ||
			(cluster.name as TranslatedText)?.ru ||
			`cluster ${cluster.id}`
	)

	return (
		<motion.div
			animate={{ opacity: 1, x: 0 }}
			className="flex flex-col gap-1"
			exit={{ opacity: 0, x: -20 }}
			initial={{ opacity: 0, x: -20 }}
		>
			<div className="flex items-center gap-1">
				<motion.button
					className="hover:bg-muted/50 rounded p-1 transition-colors"
					onClick={() => setIsExpanded(!isExpanded)}
					whileHover={{ x: 2 }}
					whileTap={{ scale: 0.95 }}
				>
					<Icon
						className="text-xs transition-transform duration-200"
						icon={
							isExpanded
								? 'lucide:chevron-down'
								: 'lucide:chevron-right'
						}
					/>
				</motion.button>

				<motion.label
					className="group flex flex-1 cursor-pointer items-center gap-2"
					whileHover={{ x: 2 }}
				>
					<CheckBox
						checked={isVisible}
						onCheckedChange={() => toggleCluster(cluster.id)}
					/>

					<Icon
						className="h-4 w-4 transition-colors"
						icon={
							isVisible ? 'lucide:folder-open' : 'lucide:folder'
						}
					/>

					<span className="text-sm font-medium transition-colors">
						{clusterName}
					</span>
				</motion.label>
			</div>

			<AnimatePresence>
				{isVisible &&
					isExpanded &&
					cluster.markers &&
					cluster.markers.length > 0 && (
						<motion.div
							animate={{ opacity: 1, height: 'auto' }}
							className="ml-7 flex flex-col gap-1"
							exit={{ opacity: 0, height: 0 }}
							initial={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.2 }}
						>
							{cluster.markers.map((marker) => {
								const groupKey = `${cluster.id}_${marker.id}`
								const isGroupVisible =
									visibleGroupKeys.has(groupKey)

								const markerName =
									(marker.name as TranslatedText)?.[lang] ||
									marker.slug

								return (
									<motion.label
										className="group flex cursor-pointer items-center gap-2"
										key={groupKey}
										whileHover={{ x: 2 }}
									>
										<CheckBox
											checked={isGroupVisible}
											onCheckedChange={() =>
												toggleGroup(
													cluster.id,
													marker.id
												)
											}
											showCheckmark={false}
											size="xs"
										/>

										<Icon
											className="text-sm"
											icon="lucide:map-pin"
										/>

										<span className="text-xs">
											{markerName}
										</span>
									</motion.label>
								)
							})}
						</motion.div>
					)}
			</AnimatePresence>
		</motion.div>
	)
}
