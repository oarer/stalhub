import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { GridBackgroundWithBeams } from '@/shared/Background'
import ErrorContent from '../shared/ErrorContent'
import SupportText from '../shared/SupportText'

type GlobalErrorProps = {
	errorId: string | null
	reset: () => void
}

export default function GlobalErrorView({ errorId, reset }: GlobalErrorProps) {
	const t = useTranslations()

	return (
		<html className="dark">
			<body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-foreground">
				<GridBackgroundWithBeams
					cellSize={20}
					cols={100}
					glowIntensity={1.5}
					lineWidth={2}
					maxBeams={4}
					rows={100}
				/>
				<div className="grid items-center gap-16 md:flex">
					<ErrorContent
						buttonIcon="lucide:rotate-ccw"
						buttonLabel={t('errors.globalError.buttonLabel')}
						description={t('errors.globalError.description')}
						onButtonClick={reset}
					/>
					<Image
						alt="client error"
						className="rounded-lg bg-neutral-400 p-3 dark:bg-transparent"
						height={400}
						src="/images/errors/client.png"
						width={400}
					/>
				</div>
				<div className="flex flex-col items-center gap-2">
					<SupportText
						identifierLabel={t(
							'errors.globalError.ifProblemPersists'
						)}
						identifierPrefix="Error id"
						identifierValue={errorId}
					/>
				</div>
			</body>
		</html>
	)
}
