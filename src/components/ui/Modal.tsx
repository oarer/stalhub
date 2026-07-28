'use client'

import { Icon } from '@iconify/react'
import { Slot } from '@radix-ui/react-slot'
import type { VariantProps } from 'class-variance-authority'
import { AnimatePresence, motion } from 'motion/react'
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/cn'
import { Button, type buttonVariants } from './Button'

const backdropVariants = {
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	exit: { opacity: 0 },
}

const modalVariants = {
	initial: { opacity: 0, scale: 0.95, y: 10 },
	animate: { opacity: 1, scale: 1, y: 0 },
	exit: { opacity: 0, scale: 0.95, y: 10, pointerEvents: 'none' },
}

interface ModalContextType {
	isOpen: boolean
	open: () => void
	close: () => void
}

const ModalContext = createContext<ModalContextType | null>(null)

function useModal() {
	const ctx = useContext(ModalContext)
	if (!ctx)
		throw new Error('Modal components must be used inside <Modal.Root>')
	return ctx
}

interface RootProps {
	children: ReactNode
	defaultOpen?: boolean
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export function ModalRoot({
	children,
	defaultOpen = false,
	open: controlledOpen,
	onOpenChange,
}: RootProps) {
	const [isOpen, setIsOpen] = useState<boolean>(
		typeof controlledOpen === 'boolean' ? controlledOpen : !!defaultOpen
	)

	useEffect(() => {
		if (typeof controlledOpen === 'boolean') {
			setIsOpen(controlledOpen)
		}
	}, [controlledOpen])

	// biome-ignore lint: useExhaustiveDependencies
	useEffect(() => {
		onOpenChange?.(isOpen)
	}, [isOpen])

	const open = useCallback(() => setIsOpen(true), [])
	const close = useCallback(() => setIsOpen(false), [])

	return (
		<ModalContext.Provider value={{ isOpen, open, close }}>
			{children}
		</ModalContext.Provider>
	)
}
interface Props {
	children: ReactNode
	className?: string
	variant?: VariantProps<typeof buttonVariants>['variant']
	fullScreen?: boolean
	background?: string
}

export function ModalTrigger({
	children,
	className,
	variant = 'outline',
	asChild = false,
}: Props & { asChild?: boolean }) {
	const { open } = useModal()
	const Comp = asChild ? Slot : Button

	return (
		<Comp
			className={cn('font-semibold', className)}
			onClick={open}
			variant={variant}
		>
			{children}
		</Comp>
	)
}

export function ModalContent({
	children,
	className = '',
	fullScreen = true,
	background = '',
}: Props) {
	const { isOpen, close } = useModal()

	useEffect(() => {
		if (!isOpen) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') close()
		}
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [isOpen, close])

	useEffect(() => {
		if (!isOpen) return
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = prev
		}
	}, [isOpen])

	if (typeof document === 'undefined') return null

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<div
					aria-hidden={!isOpen}
					className="fixed inset-0 z-9999999 flex items-center justify-center px-2"
				>
					<motion.div
						animate="animate"
						className={cn(
							'absolute inset-0 bg-background/20 backdrop-blur-sm',
							background
						)}
						exit="exit"
						initial="initial"
						onClick={close}
						transition={{ duration: 0.18 }}
						variants={backdropVariants}
					/>

					<motion.div
						animate="animate"
						aria-modal="true"
						className={cn(
							'relative z-10 border-border-secondary bg-neutral-900/95 pb-4 sm:h-auto sm:rounded-xl sm:border-2 sm:px-6 sm:shadow-2xl',
							fullScreen
								? 'h-dvh w-screen max-w-none rounded-none border-transparent px-4 shadow-none sm:border-border-secondary'
								: 'w-full max-w-lg rounded-xl border-2 px-6 shadow-2xl',
							className
						)}
						exit="exit"
						initial="initial"
						role="dialog"
						transition={{
							type: 'spring',
							damping: 25,
							stiffness: 350,
						}}
						variants={modalVariants}
					>
						{children}
						<Button
							aria-label="Close modal"
							className="absolute top-4.5 right-4 flex cursor-pointer items-center justify-center rounded-full p-2.5"
							onClick={close}
							variant={'ghost'}
						>
							<Icon className="text-lg" icon="lucide:x" />
						</Button>
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body
	)
}

export function ModalHeader({ children, className = '' }: Props) {
	return (
		<div
			className={cn('flex items-center justify-between py-4', className)}
		>
			<div className="flex-1">{children}</div>
		</div>
	)
}

export function ModalTitle({ children, className = '' }: Props) {
	return (
		<h1 className={cn('font-semibold text-xl', className)}>{children}</h1>
	)
}

export function ModalDescription({ children, className = '' }: Props) {
	return <p className={cn('mt-1 text-sm', className)}>{children}</p>
}

export function ModalBody({ children, className = '' }: Props) {
	return <div className={cn('pb-4', className)}>{children}</div>
}

export function ModalFooter({ children, className = '' }: Props) {
	return (
		<div
			className={cn(
				'flex items-center justify-end gap-3 py-3 pt-0',
				className
			)}
		>
			{children}
		</div>
	)
}

export function ModalAction({
	children,
	className,
	variant = 'primary',
	onClick,
	disabled = false,
	closeOnClick,
	asChild = false,
}: Props & {
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
	closeOnClick?: boolean
	disabled?: boolean
	asChild?: boolean
}) {
	const { close } = useModal()
	const [loading, setLoading] = useState(false)
	const Comp = asChild ? Slot : Button

	const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
		if (!onClick) return

		setLoading(true)
		try {
			await onClick(e)
			if (closeOnClick) close()
		} finally {
			setLoading(false)
		}
	}
	return (
		<Comp
			className={cn('px-4 py-2', className)}
			disabled={disabled}
			loading={loading}
			onClick={handleClick}
			variant={variant}
		>
			{children}
		</Comp>
	)
}

export function ModalClose({ children, className = '' }: Props) {
	const { close } = useModal()
	return (
		<Button
			className={cn('px-4 py-2', className)}
			onClick={close}
			variant={'ghost'}
		>
			{children}
		</Button>
	)
}

export const Modal = {
	Root: ModalRoot,
	Trigger: ModalTrigger,
	Content: ModalContent,
	Header: ModalHeader,
	Title: ModalTitle,
	Description: ModalDescription,
	Body: ModalBody,
	Footer: ModalFooter,
	Close: ModalClose,
	Action: ModalAction,
}
