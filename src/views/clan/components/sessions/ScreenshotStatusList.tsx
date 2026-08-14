'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { LightBox } from '@/components/ui/LightBox'
import type { StageScreenshot } from '@/types/clan/clan.type'
import { SCREENSHOT_STATUS } from './session.const'

interface ScreenshotStatusListProps {
	screenshots: StageScreenshot[]
	isRetryPending: boolean
	onRetry: (screenshotId: number) => void
}

export function ScreenshotStatusList({
	screenshots,
	isRetryPending,
	onRetry,
}: ScreenshotStatusListProps) {
	const t = useTranslations()
	return (
		<>
			{screenshots.map((shot) => {
				const status =
					SCREENSHOT_STATUS[shot.aiStatus] ??
					SCREENSHOT_STATUS.pending
				return (
					<div
						className="flex items-center justify-between rounded-lg bg-accent/50 px-3 py-2"
						key={shot.id}
					>
						<div className="flex items-center gap-2">
							<Icon
								className={`text-md ${status.spin ? 'animate-spin' : ''} ${status.color}`}
								icon={status.icon}
							/>
							<div className="flex flex-col">
								<LightBox.Root>
									<LightBox.Trigger asChild>
										<p className="relative text-border text-sm duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-sky-400 after:transition-all hover:text-sky-600 hover:after:w-full dark:hover:text-sky-400">
											{t('clan.sessions.screenshotId', {
												id: shot.id,
											})}
										</p>
									</LightBox.Trigger>
									<LightBox.Content
										alt="screenshot"
										src={`${process.env.NEXT_PUBLIC_API}/${shot.filePath}`}
									/>
								</LightBox.Root>
							</div>
						</div>
						{shot.aiStatus === 'error' && shot.aiError ? (
							<div className="flex items-center gap-2">
								<p className="font-bold text-red-500 text-xs">
									{shot.aiError}
								</p>
								<Button
									className="p-2"
									disabled={isRetryPending}
									onClick={() => onRetry(shot.id)}
									variant={'primary'}
								>
									<Icon
										className={
											isRetryPending
												? 'animate-spin text-sm'
												: 'text-sm'
										}
										icon="lucide:refresh-cw"
									/>
								</Button>
							</div>
						) : (
							<span
								className={`font-semibold text-xs ${status.color}`}
							>
								{t(status.label)}
							</span>
						)}
					</div>
				)
			})}
		</>
	)
}
