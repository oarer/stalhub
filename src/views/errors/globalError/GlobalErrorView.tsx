import Image from 'next/image'
import ErrorContent from '../shared/ErrorContent'
import SupportText from '../shared/SupportText'

type GlobalErrorProps = {
	errorId: string | null
	reset: () => void
}

export default function GlobalErrorView({ errorId, reset }: GlobalErrorProps) {
	return (
		<html>
			<body className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 pt-12">
				<div className="grid items-center gap-16 md:flex">
					<ErrorContent
						buttonIcon="lucide:rotate-ccw"
						buttonLabel="Попробовать снова"
						description="Произошла клиентская ошибка"
						onButtonClick={reset}
					/>
					<Image
						alt="client error"
						className="rounded-lg bg-neutral-200 p-3 dark:bg-transparent"
						height={400}
						src="/images/errors/client.png"
						width={400}
					/>
				</div>
				<div className="flex flex-col items-center gap-2">
					<SupportText
						identifierLabel="Если проблема остаётся, обратитесь в"
						identifierPrefix="Error id"
						identifierValue={errorId}
					/>
				</div>
			</body>
		</html>
	)
}
