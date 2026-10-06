'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Fragment } from 'react/jsx-runtime'
import { Button } from '@/components/ui/Button'
import {
	ARSENAL_SHOP_10K,
	ARSENAL_SHOP_20K,
	ARSENAL_SHOP_30K,
} from '@/constants/arsenal-shop.const'

export function ArsenalShop({
	onPickReputation,
}: {
	onPickReputation: (rep: number) => void
}) {
	const t = useTranslations()

	const groups = [
		{ rep: 10_000, items: ARSENAL_SHOP_10K },
		{ rep: 20_000, items: ARSENAL_SHOP_20K },
	]

	return (
		<div className="flex flex-col gap-6">
			{groups.map((g) => (
				<div
					className="flex flex-col gap-3 rounded-xl border-2 border-primary/20 bg-card p-5"
					key={g.rep}
				>
					<div className="flex items-center justify-between gap-2">
						<h3 className="font-mono font-semibold text-lg text-primary">
							{g.rep.toLocaleString()}
						</h3>
						<Button
							onClick={() => onPickReputation(g.rep)}
							size="sm"
							variant="primary"
						>
							{t('arsenal.shop.pick')}
						</Button>
					</div>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
						{g.items.map((it) => (
							<div
								className="flex items-center gap-2 rounded-lg bg-accent/40 p-2"
								key={it.id}
							>
								<Image
									alt={it.ru}
									className="object-contain"
									height={36}
									src={it.icon}
									width={36}
								/>
								<span className="font-medium text-xs">
									{it.ru}
								</span>
							</div>
						))}
					</div>
				</div>
			))}

			<div className="flex flex-col gap-3 rounded-xl border-2 border-primary/20 bg-card p-5">
				<div className="flex items-center justify-between gap-2">
					<h3 className="font-mono font-semibold text-lg text-primary">
						{(30_000).toLocaleString()}
					</h3>
					<Button
						onClick={() => onPickReputation(30_000)}
						size="sm"
						variant="primary"
					>
						{t('arsenal.shop.pick')}
					</Button>
				</div>
				<div className="flex flex-col gap-2">
					{ARSENAL_SHOP_30K.map((ex, i) => (
						<div
							className="flex flex-wrap items-center gap-2 rounded-lg bg-accent/40 p-2"
							key={i}
						>
							<div className="flex flex-wrap items-center gap-1.5">
								{ex.give.map((g, index) => (
									<Fragment key={g.id}>
										{index > 0 && (
											<span className="font-bold text-muted-foreground">
												/
											</span>
										)}

										<span className="flex items-center gap-1.5 rounded-md bg-background px-2 py-1">
											<Image
												alt={g.ru}
												height={28}
												src={g.icon}
												width={28}
											/>
											<span className="text-xs">
												{g.ru}
											</span>
										</span>
									</Fragment>
								))}
							</div>
							<Icon
								className="text-primary"
								icon="lucide:arrow-right"
							/>
							<span className="flex items-center gap-1.5 rounded-md bg-background px-2 py-1 ring-1 ring-primary/40">
								<Image
									alt={ex.get.ru}
									height={28}
									src={ex.get.icon}
									width={28}
								/>
								<span className="font-semibold text-xs">
									{ex.get.ru}
								</span>
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
