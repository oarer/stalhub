'use client'

import { Icon } from '@iconify/react'
import { Handle, Position } from '@xyflow/react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { memo } from 'react'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import type { CustomNodeData } from '../types'

type Props = {
	id: string
	data: CustomNodeData
}

const CustomNode = memo(
	({ id, data }: Props) => {
		return (
			<motion.div
				animate={{ opacity: 1, scale: 1 }}
				className={cn(
					'flex w-80 flex-col gap-2 rounded-lg border-2 px-4 py-2 text-center shadow-lg',
					data.isRoot
						? 'border-border/80'
						: 'border-border-secondary',
					data.isRoot
						? 'bg-border/20 backdrop-blur-sm'
						: 'bg-background'
				)}
				initial={{ opacity: 0, scale: 0.95 }}
				transition={{ duration: 0.3, ease: 'easeOut' }}
			>
				<Handle
					className={cn(
						'translate-y-[-0.5px] border-transparent!',
						data.isRoot ? 'bg-transparent!' : 'bg-border-secondary!'
					)}
					position={Position.Top}
					type="target"
				/>

				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						{data.icon && (
							<Image
								alt={data.label}
								className="h-12 w-12 object-contain"
								height={52}
								loading="eager"
								src={data.icon}
								width={52}
							/>
						)}
						<div className="flex flex-col items-start">
							<h2 className="max-w-32 truncate font-semibold text-lg">
								{data.label}
							</h2>
							{data.perCraft && data.perCraft > 1 && (
								<span
									className={`${montserrat.className} font-semibold text-[10px] text-text-accent`}
								>
									×{data.perCraft}
								</span>
							)}
						</div>
					</div>

					{data.isRoot ? (
						<div className="flex items-center justify-center">
							<Input
								className="bg-background/50 text-sm"
								max={9999}
								min={0}
								onChange={(e) => {
									const newValue = Number(e.target.value)
									const diff = newValue - (data.quantity ?? 0)
									data.onQuantityChange?.(diff)
								}}
								step={data.perCraft ?? 1}
								type="number"
								value={data.quantity ?? 0}
							/>
						</div>
					) : data.quantity && data.quantity > 0 ? (
						<span
							className={`${montserrat.className} font-semibold text-sm text-text-accent`}
						>
							×{data.quantity}
						</span>
					) : null}
				</div>

				{data.isExpanded && (
					<Divider className={data.isRoot ? 'bg-border/40' : ''} />
				)}

				{data.isExpanded && data.ingredients && (
					<div className="flex flex-col gap-1">
						{data.ingredients.map((ing, i) => (
							<div
								className="flex items-center justify-between font-semibold text-sm"
								key={i}
							>
								<div className="flex items-center gap-1.5">
									{ing.icon && (
										<div className="relative h-10 w-10 shrink-0">
											<Image
												alt={ing.name}
												className="object-contain"
												fill
												sizes="40px"
												src={ing.icon}
											/>
										</div>
									)}

									<span className="truncate text-text-secondary">
										{ing.name}
									</span>
								</div>
								<span className={montserrat.className}>
									×{ing.total}
								</span>
							</div>
						))}
					</div>
				)}

				{data.isExpanded && (
					<Divider className={data.isRoot ? 'bg-border/40' : ''} />
				)}

				{data.isExpanded && data.energyPerCraft && (
					<div className="flex items-center justify-between font-semibold text-sm">
						<p>Энергия</p>
						<span className={montserrat.className}>
							{data.energyPerCraft *
								Math.ceil(
									(data.quantity ?? 0) / (data.perCraft ?? 1)
								)}
						</span>
					</div>
				)}

				{data.price != null && (
					<div className="flex items-center justify-between font-semibold text-sm">
						<p>Стоимость</p>
						<span className={montserrat.className}>
							{(
								data?.price * (data?.quantity ?? 0)
							).toLocaleString()}
							₽
						</span>
					</div>
				)}

				{data.hasRecipe && (
					<Button
						className="p-1 text-sm"
						onClick={data.onToggle}
						variant="secondary"
					>
						<Icon
							icon={
								data.isExpanded ? 'lucide:minus' : 'lucide:plus'
							}
						/>
					</Button>
				)}

				<Handle
					className={cn(
						'translate-y-0! border-transparent!',
						data.isRoot
							? 'translate-y-[2.5px] bg-border!'
							: 'bg-border-secondary!',
						!data.isExpanded && 'pointer-events-none opacity-0'
					)}
					position={Position.Bottom}
					type="source"
				/>
			</motion.div>
		)
	},
	(prev, next) => {
		if (prev.data === next.data) return true
		const a = prev.data
		const b = next.data
		return (
			a.label === b.label &&
			a.icon === b.icon &&
			a.quantity === b.quantity &&
			a.perCraft === b.perCraft &&
			a.isExpanded === b.isExpanded &&
			a.isRoot === b.isRoot &&
			a.hasRecipe === b.hasRecipe &&
			a.price === b.price &&
			a.energyPerCraft === b.energyPerCraft &&
			a.onToggle === b.onToggle &&
			a.onQuantityChange === b.onQuantityChange &&
			a.ingredients === b.ingredients
		)
	}
)

export const nodeTypes = { custom: CustomNode }
