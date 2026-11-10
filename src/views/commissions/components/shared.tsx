'use client'

import { isAxiosError } from 'axios'
import type { VariantProps } from 'class-variance-authority'
import { useTranslations } from 'next-intl'
import { useId, useRef, useState } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Badge, type badgeVariants } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Textarea } from '@/components/ui/Textarea'
import { commissionService as api } from '@/services/commission/commission.service'
import { useAuthStore } from '@/stores/useAuth.store'
import type { CommissionFile } from '@/types/commission.type'

export function usePrivateScope() {
	return useAuthStore((s) => s.user?.id)
}
export function useCommissionError() {
	const t = useTranslations('commissions')
	return (error: unknown) => {
		const code = isAxiosError(error) ? error.response?.data?.error : ''
		return typeof code === 'string' && t.has(`errors.${code}`)
			? t(`errors.${code}`)
			: t('error')
	}
}
export function Feedback({ error }: { error: unknown }) {
	const message = useCommissionError()
	return error ? (
		<Alert.Root role="alert" variant="destructive">
			{message(error)}
		</Alert.Root>
	) : null
}
export function Field({
	label,
	value,
	onChange,
	type = 'text',
	min,
	max,
	required = false,
}: {
	label: string
	value: string | number
	onChange: (v: string) => void
	type?: string
	min?: number
	max?: number
	required?: boolean
}) {
	const id = useId()
	return (
		<div className="flex flex-col gap-1.5">
			<label className="text-sm" htmlFor={id}>
				{label}
			</label>
			<Input
				id={id}
				max={max}
				min={min}
				onChange={(e) => onChange(e.target.value)}
				required={required}
				type={type as 'text'}
				value={value}
			/>
		</div>
	)
}
export function Area({
	label,
	value,
	onChange,
	minLength,
	maxLength = 10000,
}: {
	label: string
	value: string
	onChange: (v: string) => void
	minLength?: number
	maxLength?: number
}) {
	const id = useId()
	return (
		<div className="flex flex-col gap-1.5">
			<label className="text-sm" htmlFor={id}>
				{label}
			</label>
			<Textarea
				id={id}
				maxLength={maxLength}
				minLength={minLength}
				onChange={(e) => onChange(e.target.value)}
				rows={4}
				value={value}
			/>
		</div>
	)
}
export function Pages({
	page,
	total,
	size,
	onChange,
}: {
	page: number
	total: number
	size: number
	onChange: (page: number) => void
}) {
	return (
		<Pagination
			onPageChange={onChange}
			page={page}
			totalPages={Math.ceil(total / size)}
		/>
	)
}

type StatusVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

const STATUS_VARIANTS: Record<string, StatusVariant> = {
	PENDING: 'exbo',
	EXPECTED: 'exbo',
	OPEN: 'exbo',
	ACCEPTED: 'stalhub',
	SENT: 'stalhub',
	IN_PROGRESS: 'media',
	REVIEW: 'stalhub',
	CONTESTED: 'media',
	COMPLETED: 'success',
	RECEIVED: 'success',
	DECIDED: 'success',
	CANCELLED: 'secondary',
	CLOSED: 'secondary',
	DECLINED: 'danger',
	REJECTED: 'danger',
}

export function Status({
	value,
	className,
}: {
	value: string
	className?: string
}) {
	const t = useTranslations('commissions')
	return (
		<Badge
			className={className}
			variant={STATUS_VARIANTS[value] ?? 'secondary'}
		>
			{t.has(`statuses.${value}`) ? t(`statuses.${value}`) : value}
		</Badge>
	)
}
export function FileLinks({
	files,
	download = (file) => api.download(file),
}: {
	files: CommissionFile[]
	download?: (file: CommissionFile) => Promise<void>
}) {
	const [error, setError] = useState<unknown>()
	const t = useTranslations('commissions')
	if (!files.length) return null
	return (
		<div className="flex flex-col gap-1">
			<Feedback error={error} />
			{files.map((file) => (
				<Button
					className="w-fit justify-start p-0 text-left font-normal text-sm underline underline-offset-4"
					key={file.id}
					onClick={() => {
						void download(file).catch(setError)
					}}
					type="button"
					variant="none"
				>
					{t('download')}: {file.name} ({Math.ceil(file.size / 1024)}{' '}
					KB)
				</Button>
			))}
		</div>
	)
}
export const commissionFileAccept =
	'image/png,image/jpeg,image/webp,application/pdf'

export function useCommissionFiles({
	files,
	onChange,
	onBusy,
}: {
	files: CommissionFile[]
	onChange: (files: CommissionFile[]) => void
	onBusy: (busy: boolean) => void
}) {
	const [progress, setProgress] = useState<number | null>(null)
	const [error, setError] = useState<unknown>()
	const inputRef = useRef<HTMLInputElement | null>(null)

	const pick = () => inputRef.current?.click()

	const upload = async (selected: FileList | null) => {
		const list = Array.from(selected ?? [])
		if (inputRef.current) inputRef.current.value = ''
		if (
			list.length + files.length > 10 ||
			list.some((file) => file.size > 20 * 1024 * 1024)
		) {
			setError(new Error('file limit'))
			return
		}
		onBusy(true)
		setProgress(0)
		setError(undefined)
		const next = [...files]
		try {
			for (const file of list) {
				next.push(await api.upload(file, setProgress))
				onChange([...next])
			}
		} catch (uploadError) {
			setError(uploadError)
		} finally {
			onBusy(false)
			setProgress(null)
		}
	}

	const remove = async (id: string) => {
		try {
			await api.removeFile(id)
			onChange(files.filter((file) => file.id !== id))
		} catch (removeError) {
			setError(removeError)
		}
	}

	return { error, inputRef, pick, progress, remove, upload }
}

export function FilePicker({
	files,
	onChange,
	onBusy,
}: {
	files: CommissionFile[]
	onChange: (files: CommissionFile[]) => void
	onBusy: (busy: boolean) => void
}) {
	const t = useTranslations('commissions')
	const uploads = useCommissionFiles({ files, onChange, onBusy })
	return (
		<div className="flex flex-col gap-2">
			<p className="text-muted-foreground text-xs">{t('filesHint')}</p>
			<label className="flex w-fit cursor-pointer flex-col gap-2 text-primary text-sm">
				{t('addFiles')}
				<input
					accept={commissionFileAccept}
					disabled={uploads.progress !== null || files.length >= 10}
					multiple
					onChange={(e) => void uploads.upload(e.target.files)}
					ref={uploads.inputRef}
					type="file"
				/>
			</label>
			{uploads.progress !== null && (
				<progress
					aria-label={t('addFiles')}
					className="h-2 w-full accent-primary"
					max={100}
					value={uploads.progress}
				/>
			)}
			<Feedback error={uploads.error} />
			{files.map((file) => (
				<div
					className="flex items-center justify-between gap-2"
					key={file.id}
				>
					<span className="break-all text-sm">{file.name}</span>
					<Button
						disabled={uploads.progress !== null}
						onClick={() => void uploads.remove(file.id)}
						size="sm"
						type="button"
						variant="secondary"
					>
						{t('remove')}
					</Button>
				</div>
			))}
		</div>
	)
}
