import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@/components/ui/Skeleton'

type SupportTextProps = {
	identifierLabel: string
	identifierValue?: string | null
	identifierPrefix: string
	identifierValuePrefix?: string
}

const LINK_CLASSES =
	'relative text-foreground duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:text-primary hover:after:w-full dark:text-muted-foreground dark:hover:text-primary'

export default function SupportText({
	identifierLabel,
	identifierValue,
	identifierValuePrefix,
	identifierPrefix,
}: SupportTextProps) {
	const t = useTranslations()

	return (
		<p className="text-center font-bold text-xs uppercase tracking-widest dark:text-muted-foreground">
			{identifierLabel} <br />
			{t('errors.support.thenContact')}{' '}
			<Link
				className={LINK_CLASSES}
				href="https://t.me/oarer_yml"
				rel="noopener noreferrer"
				target="_blank"
			>
				{t('errors.support.techSupport')}
			</Link>
			<br /> {t('errors.support.whenContacting')}{' '}
			{identifierPrefix.toLowerCase()} <br />
			{identifierValue ? (
				<button
					className="cursor-pointer text-muted-foreground uppercase tracking-widest"
					onClick={() =>
						navigator.clipboard.writeText(identifierValue)
					}
				>
					{identifierValuePrefix || identifierPrefix}:{' '}
					{identifierValue}
				</button>
			) : (
				<span className="inline-flex w-full justify-center">
					<Skeleton className="h-4 w-34" />
				</span>
			)}
		</p>
	)
}
