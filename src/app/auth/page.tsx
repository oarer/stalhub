import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { montserrat, unbounded } from '../fonts'

export default function Page() {
	return (
		<section className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-3">
			<Card.Root className="w-full">
				<Card.Header>
					<Card.Title>
						<Icon icon="lucide:log-in" />
						<h1
							className={`${unbounded.className} font-bold text-[16px] uppercase tracking-widest`}
						>
							Авторизация
						</h1>
					</Card.Title>
				</Card.Header>
				<Card.Content className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<Button className="gap-2" variant={'secondary'}>
						<Image
							alt="discord auth"
							height={20}
							src="/images/other/discord.png"
							width={20}
						/>
						<p className="font-semibold">Discord</p>
					</Button>
					<Button className="gap-2" variant={'secondary'}>
						<Image
							alt="telegram auth"
							height={20}
							src="/images/other/telegram.png"
							width={20}
						/>
						<p className="font-semibold">Telegram</p>
					</Button>
					<Button className="gap-2 bg-purple-600 ring-2 ring-purple-900 md:col-span-2 dark:bg-purple-700/40 dark:ring-purple-700">
						<Image
							alt="exbo auth"
							height={20}
							src="/images/other/exbo.png"
							width={20}
						/>
						<p className="font-semibold">EXBO</p>
					</Button>
				</Card.Content>
				<p
					className={`${montserrat.className} font-semibold text-sm text-text-accent`}
				>
					Регистрируясь на сайте, вы соглашаетесь с настоящими{' '}
					<Link
						className="underline underline-offset-2"
						href="/wiki/legal/tos"
					>
						условиями пользования
					</Link>
				</p>
			</Card.Root>
			<Alert.Root variant={'info'}>
				<Alert.Title>Рекомендация</Alert.Title>
				<Alert.Description>
					Используйте EXBO для получения большего функционала
				</Alert.Description>
			</Alert.Root>
		</section>
	)
}
