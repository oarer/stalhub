'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { unbounded } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { CLink } from '@/components/ui/Link'
import { Modal } from '@/components/ui/Modal'

const linkClass =
	'href= relative text-primary duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:text-primary hover:after:w-full dark:hover:text-primary'

export default function RelocationModal() {
	const [modalOpen, setOpenModal] = useState(false)
	const t = useTranslations()

	return (
		<>
			<Button
				className="fixed right-5 bottom-5 z-50 p-3"
				onClick={() => setOpenModal(true)}
				variant={'danger'}
			>
				<Icon icon="lucide:circle-alert" />
			</Button>
			<Modal.Root onOpenChange={(v) => setOpenModal(v)} open={modalOpen}>
				<Modal.Content className="max-w-md" fullScreen={false}>
					<Modal.Header>
						<Modal.Title className="flex items-center gap-2">
							<Icon className="text-2xl" icon="lucide:cloud" />
							<p className={`${unbounded.className} `}>
								{t('test.title')}
							</p>
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<p className="font-semibold">
							{t.rich('test.message', {
								unavailable: (chunks) => (
									<span className="text-destructive">
										{chunks}
									</span>
								),
								domain: (chunks) => (
									<Link
										className={linkClass}
										href="https://stalhub.dev"
									>
										{chunks}
									</Link>
								),
								channel: (chunks) => (
									<Link
										className={linkClass}
										href="https://t.me/st4lhub"
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
							<CLink href="https://stalhub.dev">
								{t('test.go')}
							</CLink>
						</Modal.Action>
					</div>
				</Modal.Content>
			</Modal.Root>
		</>
	)
}
