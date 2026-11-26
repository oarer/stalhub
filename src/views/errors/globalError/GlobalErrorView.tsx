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
		<div className="dark">
			<div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-4 px-6">
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
						src="/public/images/errors/client.png"
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
			</div>
		</div>
	)
}
