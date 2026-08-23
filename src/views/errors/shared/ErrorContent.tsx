import { Icon, type IconifyIcon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { montserrat, unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'

type ErrorContentProps = {
	title?: string
	description: string
	buttonIcon: IconifyIcon | string
	buttonLabel: string
	onButtonClick?: () => void
}

export default function ErrorContent({
	title,
	description,
	buttonIcon,
	buttonLabel,
	onButtonClick,
}: ErrorContentProps) {
	const t = useTranslations()
	const router = useRouter()

	return (
		<div className="flex max-w-md flex-col gap-2">
			<h1
				className={`${unbounded.className} font-semibold text-3xl uppercase tracking-widest`}
			>
				{title ?? t('errors.oops')}
			</h1>
			<p
				className={`${unbounded.className} font-semibold text-xl dark:text-foreground/90`}
			>
				{description}
			</p>
			<Button
				className="gap-2"
				onClick={onButtonClick ?? (() => router.push('/'))}
				variant="outline"
			>
				<Icon icon={buttonIcon} />
				<span className={`${montserrat.className} font-semibold`}>
					{buttonLabel}
				</span>
			</Button>
		</div>
	)
}
