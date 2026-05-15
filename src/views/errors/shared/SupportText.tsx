import Link from 'next/link'
import { Skeleton } from '@/components/ui/Skeleton'

type SupportTextProps = {
	identifierLabel: string
	identifierValue?: string | null
	identifierPrefix: string
}

const LINK_CLASSES =
	'relative text-neutral-900 duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-sky-400 after:transition-all hover:text-sky-600 hover:after:w-full dark:text-neutral-200 dark:hover:text-sky-400'

export default function SupportText({
	identifierLabel,
	identifierValue,
	identifierPrefix,
}: SupportTextProps) {
	return (
		<p className="text-center font-bold text-xs uppercase tracking-widest dark:text-neutral-400">
			{identifierLabel} <br />
			то обратитесь в{' '}
			<Link
				className={LINK_CLASSES}
				href="https://t.me/oarer_yml"
				rel="noopener noreferrer"
				target="_blank"
			>
				тех. поддержку
			</Link>
			<br /> При обращении укажите {identifierPrefix.toLowerCase()} <br />
			{identifierValue ? (
				<button
					className="cursor-pointer text-neutral-500 uppercase tracking-widest"
					onClick={() =>
						navigator.clipboard.writeText(identifierValue)
					}
				>
					{identifierPrefix}: {identifierValue}
				</button>
			) : (
				<span className="inline-flex w-full justify-center">
					<Skeleton className="h-4 w-34" />
				</span>
			)}
		</p>
	)
}
