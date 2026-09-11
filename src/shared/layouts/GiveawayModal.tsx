'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { CLink } from '@/components/ui/Link'
import { Modal } from '@/components/ui/Modal'

const linkClass =
	'href= relative text-primary duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:text-primary hover:after:w-full dark:hover:text-primary'

export default function GiveawayModal() {
	const [modalOpen, setOpenModal] = useState(false)
	const t = useTranslations()

	return (
		<>
			<Button
				className="fixed right-5 bottom-5 z-50 p-2"
				onClick={() => setOpenModal(true)}
				variant={'primary'}
			>
				<Icon className="text-2xl" icon="lucide:badge-russian-ruble" />
			</Button>
			<Modal.Root onOpenChange={(v) => setOpenModal(v)} open={modalOpen}>
				<Modal.Content className="max-w-140" fullScreen={false}>
					<Modal.Header>
						<Modal.Title className="flex items-center gap-2">
							<Icon className="text-2xl" icon="lucide:sparkles" />
							<p className={`${unbounded.className} `}>
								{t('test.title')}
							</p>
						</Modal.Title>
					</Modal.Header>
					<Modal.Body className="space-y-2">
						<div className="relative min-h-72 w-full">
							<Image
								alt="dsadas"
								className="rounded-lg border-2 border-accent/50 object-contain"
								fill
								src="/images/other/give.jpg"
							/>
						</div>
						<p className="font-semibold">
							{t.rich('test.message', {
								primary: (chunks) => (
									<span className="text-primary">
										{chunks}
									</span>
								),
								channel: (chunks) => (
									<Link
										className={linkClass}
										href="https://t.me/st4lhub/1155"
									>
										{chunks}
									</Link>
								),
							})}
						</p>
					</Modal.Body>
					<div className="flex justify-end gap-2">
						<Modal.Close variant={'ghost'}>
							{t('test.cancel')}
						</Modal.Close>
						<Modal.Action asChild>
							<CLink href="https://t.me/st4lhub/1155">
								{t('test.go')}
							</CLink>
						</Modal.Action>
					</div>
				</Modal.Content>
			</Modal.Root>
		</>
	)
}
