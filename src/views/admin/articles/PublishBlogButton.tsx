'use client'

import { Icon } from '@iconify/react'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CheckBox } from '@/components/ui/CheckBox'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/components/ui/Toast'
import { articleService } from '@/services/article/article.service'

export default function PublishBlogButton({
	articleId,
	variant = 'icon',
}: {
	articleId: string
	variant?: 'icon' | 'button'
}) {
	const t = useTranslations()
	const [open, setOpen] = useState(false)
	const [digest, setDigest] = useState('')
	const [wasFallback, setWasFallback] = useState(false)
	const [toTg, setToTg] = useState(true)
	const [toDs, setToDs] = useState(true)
	const [withCover, setWithCover] = useState(true)
	// Modal.Root тоже дергает onOpenChange из эффекта — шлём digest только раз.
	const requestedRef = useRef(false)

	const digestMutation = useMutation({
		mutationFn: () => articleService.getDigest(articleId),
		onSuccess: (data) => {
			setDigest(data.digest)
			setWasFallback(data.fallback)
		},
		onError: () => toast.error(t('blog.publish.digestError')),
	})

	const publishMutation = useMutation({
		mutationFn: () =>
			articleService.publishBlog(articleId, {
				digest: digest.trim(),
				targets: [
					...(toTg ? (['tg'] as const) : []),
					...(toDs ? (['ds'] as const) : []),
				],
				with_cover: withCover,
			}),
		onSuccess: (res) => {
			const tgOk = res.tg ? res.tg.ok : true
			const dsOk = res.ds ? res.ds.ok : true
			if (tgOk && dsOk) {
				toast.success(t('blog.publish.sentOk'))
				if (withCover && !res.withCover) {
					toast.info(
						`${t('blog.publish.sentWithoutCover')}${res.cover_error ? `: ${res.cover_error}` : ''}`
					)
				}
				setOpen(false)
			} else {
				toast.error(
					[
						res.tg && !res.tg.ok ? `TG: ${res.tg.error}` : null,
						res.ds && !res.ds.ok ? `DS: ${res.ds.error}` : null,
					]
						.filter(Boolean)
						.join(' · ') || t('blog.publish.sendError')
				)
			}
		},
		onError: () => toast.error(t('blog.publish.sendError')),
	})

	const handleOpenChange = (next: boolean) => {
		setOpen(next)
		if (!next) {
			requestedRef.current = false
			return
		}
		if (!requestedRef.current) {
			requestedRef.current = true
			digestMutation.mutate()
		}
	}

	const canSend =
		digest.trim().length > 0 && (toTg || toDs) && !publishMutation.isPending

	return (
		<Modal.Root onOpenChange={handleOpenChange} open={open}>
			{variant === 'icon' ? (
				<Button
					onClick={() => handleOpenChange(true)}
					title={t('blog.publish.button')}
					variant="ghost"
				>
					<Icon icon="lucide:send" />
				</Button>
			) : (
				<Button
					onClick={() => handleOpenChange(true)}
					size="sm"
					variant="outline"
				>
					<Icon icon="lucide:send" />
					{t('blog.publish.button')}
				</Button>
			)}
			<Modal.Content fullScreen={false}>
				<Modal.Header>
					<Modal.Title>{t('blog.publish.title')}</Modal.Title>
					<Modal.Description>
						{t('blog.publish.description')}
					</Modal.Description>
				</Modal.Header>
				<Modal.Body>
					<div className="flex flex-col gap-3">
						{digestMutation.isPending ? (
							<div className="flex items-center gap-2 py-6 text-foreground text-sm">
								<Icon
									className="size-4 animate-spin"
									icon="lucide:loader-circle"
								/>
								{t('blog.publish.generating')}
							</div>
						) : (
							<>
								<label
									className="font-medium text-sm"
									htmlFor={`digest-${articleId}`}
								>
									{t('blog.publish.digestLabel')}
								</label>
								<Textarea
									className="min-h-28 w-full border border-primary/30 p-3 font-normal leading-6"
									id={`digest-${articleId}`}
									maxLength={1500}
									onChange={(e) => setDigest(e.target.value)}
									placeholder={t(
										'blog.publish.digestPlaceholder'
									)}
									value={digest}
								/>
								<div className="flex items-center justify-between">
									<span className="font-mono text-foreground text-xs">
										{digest.length}/1500
									</span>
									<Button
										disabled={digestMutation.isPending}
										onClick={() => digestMutation.mutate()}
										size="sm"
										variant="ghost"
									>
										<Icon icon="lucide:refresh-cw" />
										{t('blog.publish.regenerate')}
									</Button>
								</div>
								{wasFallback && digest && (
									<p className="text-xs text-yellow-400">
										{t('blog.publish.fallbackHint')}
									</p>
								)}
							</>
						)}

						<div className="flex flex-wrap gap-4">
							<CheckBox
								checked={toTg}
								label={t('blog.publish.telegram')}
								onCheckedChange={setToTg}
							/>
							<CheckBox
								checked={toDs}
								label={t('blog.publish.discord')}
								onCheckedChange={setToDs}
							/>
							<CheckBox
								checked={withCover}
								label={t('blog.publish.withCover')}
								onCheckedChange={setWithCover}
							/>
						</div>

						<p className="text-foreground text-xs">
							{t('blog.publish.republishWarn')}
						</p>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Modal.Close>{t('blog.publish.cancel')}</Modal.Close>
					<Button
						disabled={!canSend || digestMutation.isPending}
						loading={publishMutation.isPending}
						onClick={() => publishMutation.mutate()}
						size="sm"
						variant="primary"
					>
						<Icon className="size-4" icon="lucide:send" />
						{t('blog.publish.send')}
					</Button>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	)
}
