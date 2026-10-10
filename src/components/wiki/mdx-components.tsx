'use client'

import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'
import Link from 'next/link'
import { createContext, type ReactNode, useContext } from 'react'
import { cn } from '@/lib/cn'
import { slugify } from '@/lib/toc'
import { Callout } from './callout'
import { CodeBlock } from './code-block'
import { Gallery } from './gallery'
import { QuestMap } from './quest-map'

const PreCodeContext = createContext(false)

function getHeadingText(children: ReactNode): string {
	if (children == null || typeof children === 'boolean') return ''
	if (typeof children === 'string' || typeof children === 'number') {
		return String(children)
	}
	if (Array.isArray(children)) {
		return children.map(getHeadingText).join('')
	}
	if (typeof children === 'object' && 'props' in children) {
		return getHeadingText(
			(children as { props?: { children?: ReactNode } }).props?.children
		)
	}
	return ''
}

function getHeadingId(children: ReactNode): string | undefined {
	const text = getHeadingText(children).trim()
	return text ? slugify(text) : undefined
}

function MdxCode({
	children,
	className,
	...props
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
	const inPre = useContext(PreCodeContext)
	const isInline = !className && !inPre

	if (isInline) {
		return (
			<code
				className={cn(
					'relative rounded bg-neutral-600/50 px-[0.3rem] py-[0.2rem] font-mono text-sm',
					className
				)}
				{...props}
			>
				{children}
			</code>
		)
	}

	return <CodeBlock className={className}>{children}</CodeBlock>
}

function MdxPre({ children }: React.HTMLAttributes<HTMLPreElement>) {
	return <PreCodeContext value>{children}</PreCodeContext>
}

export function useMDXComponents(): MDXComponents {
	return {
		Callout,
		Gallery,
		QuestMap,
		h1: ({ children, ...props }) => (
			<h1
				className="mb-6 scroll-m-24 text-balance font-bold text-4xl tracking-tight lg:text-5xl"
				{...props}
			>
				{children}
			</h1>
		),
		h2: ({ children, ...props }) => {
			const id = getHeadingId(children)
			return (
				<h2
					className="mt-12 mb-5 scroll-m-24 text-balance border-primary/25 border-b pb-3 font-bold text-2xl tracking-tight first:mt-0 md:text-3xl"
					id={id}
					{...props}
				>
					{children}
				</h2>
			)
		},
		h3: ({ children, ...props }) => {
			const id = getHeadingId(children)
			return (
				<h3
					className="mt-10 mb-4 scroll-m-24 text-balance font-bold text-xl tracking-tight md:text-2xl"
					id={id}
					{...props}
				>
					{children}
				</h3>
			)
		},
		h4: ({ children, ...props }) => {
			const id = getHeadingId(children)
			return (
				<h4
					className="mt-8 mb-3 scroll-m-24 font-semibold text-lg text-text-accent tracking-tight"
					id={id}
					{...props}
				>
					{children}
				</h4>
			)
		},
		p: ({ children, ...props }) => (
			<p
				className="not-first:mt-5 max-w-[78ch] text-pretty font-normal text-base text-foreground/85 leading-8"
				{...props}
			>
				{children}
			</p>
		),
		strong: ({ children, ...props }) => (
			<strong className="font-bold text-foreground" {...props}>
				{children}
			</strong>
		),
		a: ({ href, children, ...props }) => {
			return (
				<Link
					className="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
					href={href || ''}
					{...props}
				>
					{children}
				</Link>
			)
		},
		ul: ({ children, ...props }) => (
			<ul
				className="my-5 ml-6 max-w-[78ch] list-disc space-y-2 marker:text-primary"
				{...props}
			>
				{children}
			</ul>
		),
		ol: ({ children, ...props }) => (
			<ol
				className="my-5 ml-6 max-w-[78ch] list-decimal space-y-2 marker:font-semibold marker:text-primary"
				{...props}
			>
				{children}
			</ol>
		),
		li: ({ children, ...props }) => (
			<li
				className="text-pretty font-normal text-base text-foreground/85 leading-8"
				{...props}
			>
				{children}
			</li>
		),
		blockquote: ({ children, ...props }) => (
			<blockquote
				className="mt-6 max-w-[78ch] rounded-r-xl border-primary/60 border-l-2 bg-card/60 px-6 py-4 text-muted-foreground italic"
				{...props}
			>
				{children}
			</blockquote>
		),
		code: MdxCode,
		pre: MdxPre,
		hr: () => <hr className="my-10 border-primary/25" />,
		table: ({ children, ...props }) => (
			<div
				className="relative w-full overflow-x-auto rounded-lg border-2 border-primary/50 bg-card/50 px-2 backdrop-blur-sm"
				data-slot="table-container"
				{...props}
			>
				<table className="w-full caption-bottom text-sm">
					{children}
				</table>
			</div>
		),
		thead: ({ children, ...props }) => (
			<thead
				className="[&_tr]:border-b"
				data-slot="table-header"
				{...props}
			>
				{children}
			</thead>
		),
		tbody: ({ children, ...props }) => (
			<tbody
				className="[&_tr:last-child]:border-0"
				data-slot="table-body"
				{...props}
			>
				{children}
			</tbody>
		),
		tr: ({ children, ...props }) => (
			<tr
				className="border-primary border-b transition-colors hover:bg-card/50 data-[state=selected]:bg-card"
				data-slot="table-row"
				{...props}
			>
				{children}
			</tr>
		),
		th: ({ children, ...props }) => (
			<th
				className="h-10 whitespace-nowrap border-primary border-r px-2 text-left align-middle font-semibold last:border-r-0"
				data-slot="table-head"
				{...props}
			>
				{children}
			</th>
		),
		td: ({ children, ...props }) => (
			<td
				className="border-primary border-r p-2 align-middle font-normal last:border-r-0"
				data-slot="table-cell"
				{...props}
			>
				{children}
			</td>
		),
		img: ({ children, src, alt, ...props }) => (
			<figure className="my-6 flex flex-col items-center">
				<Image
					alt={alt || ''}
					className="relative m-0 h-auto w-full"
					height={900}
					onLoad={(e) => {
						e.currentTarget.style.opacity = '1'
					}}
					src={src || ''}
					style={{ opacity: 0 }}
					width={1600}
					{...props}
				>
					{children}
				</Image>
				{alt ? (
					<figcaption className="mt-2 text-center text-muted-foreground text-sm">
						{alt}
					</figcaption>
				) : null}
			</figure>
		),
	}
}
