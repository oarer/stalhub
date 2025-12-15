'use client'

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from 'react'

import { createPortal } from 'react-dom'

import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '@iconify/react'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Button, type buttonVariants } from './Button'

const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
}

const modalVariants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 10 },
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
}

export function ModalRoot({ children, defaultOpen = false }: RootProps) {
    const [isOpen, setIsOpen] = useState(!!defaultOpen)
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
}

export function ModalTrigger({
    children,
    className,
    variant = 'outline',
}: Props) {
    const { open } = useModal()
    return (
        <Button
            className={cn('cursor-pointer', className)}
            onClick={open}
            variant={variant}
        >
            {children}
        </Button>
    )
}

export function ModalContent({ children, className = '' }: Props) {
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
                    className="fixed inset-0 z-50 flex items-center justify-center"
                >
                    <motion.div
                        animate="animate"
                        className="bg-background/20 absolute inset-0 backdrop-blur-sm"
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
                            'bg-background/95 border-border-secondary relative z-10 mx-4 w-full max-w-lg rounded-xl border-2 px-6 shadow-2xl',
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
                            className="absolute top-2.5 right-4 flex cursor-pointer items-center justify-center rounded-full p-2.5"
                            onClick={close}
                            variant={'outline'}
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
        <h1 className={cn('text-xl font-semibold', className)}>{children}</h1>
    )
}

export function ModalDescription({ children, className = '' }: Props) {
    return <p className={cn('mt-1 text-sm', className)}>{children}</p>
}

export function ModalBody({ children, className = '' }: Props) {
    return <div className={cn('py-4', className)}>{children}</div>
}

export function ModalFooter({ children, className = '' }: Props) {
    return (
        <div
            className={cn(
                'flex items-center justify-end gap-3 p-6 pt-0',
                className
            )}
        >
            {children}
        </div>
    )
}

export function ModalAction({
    children,
    className = '',
    variant = 'primary',
    onClick,
    disabled = false,
    closeOnClick,
}: Props & {
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
    closeOnClick?: boolean
    disabled?: boolean
}) {
    const { close } = useModal()
    const [loading, setLoading] = useState(false)

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
        <Button
            className={cn('px-4 py-2', className)}
            disabled={disabled}
            loading={loading}
            onClick={handleClick}
            variant={variant}
        >
            {children}
        </Button>
    )
}

export function ModalClose({ children, className = '' }: Props) {
    const { close } = useModal()
    return (
        <Button
            className={cn('px-4 py-2', className)}
            onClick={close}
            variant={'outline'}
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
