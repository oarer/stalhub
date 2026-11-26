'use client'

import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import { createContext, type ReactNode, useContext } from 'react'
import { cn } from '@/lib/cn'
import { resolveImageUrl } from '@/lib/imageUrl'
import { slugify } from '@/lib/toc'
import { Callout } from './callout'
import { CodeBlock } from './code-block'
import { Gallery } from './gallery'
import { MermaidDiagram } from './mermaid-diagram'
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
		Mermaid: MermaidDiagram,
		QuestMap,
		h1: ({ children, ...props }) => (
			<h1
				className="mb-6 scroll-m-24 text-4xl font-bold tracking-tight text-balance lg:text-5xl"
				{...props}
			>
				{children}
			</h1>
		),
		h2: ({ children, ...props }) => {
			const id = getHeadingId(children)
			return (
				<h2
					className="border-primary/25 mt-12 mb-5 scroll-m-24 border-b pb-3 text-2xl font-bold tracking-tight text-balance first:mt-0 md:text-3xl"
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
					className="mt-10 mb-4 scroll-m-24 text-xl font-bold tracking-tight text-balance md:text-2xl"
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
					className="text-text-accent mt-8 mb-3 scroll-m-24 text-lg font-semibold tracking-tight"
					id={id}
					{...props}
				>
					{children}
				</h4>
			)
		},
		p: ({ children, ...props }) => (
			<p
				className="text-foreground max-w-[78ch] text-base leading-8 font-normal text-pretty not-first:mt-5"
				{...props}
			>
				{children}
			</p>
		),
		strong: ({ children, ...props }) => (
			<strong className="text-foreground font-bold" {...props}>
				{children}
			</strong>
		),
		a: ({ href, children, ...props }) => {
			return (
				<Link
					className="text-primary decoration-primary/40 hover:decoration-primary font-medium underline underline-offset-4 transition-colors"
					href={href || ''}
					{...props}
				>
					{children}
				</Link>
			)
		},
		ul: ({ children, ...props }) => (
			<ul
				className="marker:text-primary my-5 ml-6 max-w-[78ch] list-disc space-y-2"
				{...props}
			>
				{children}
			</ul>
		),
		ol: ({ children, ...props }) => (
			<ol
				className="marker:text-primary my-5 ml-6 max-w-[78ch] list-decimal space-y-2 marker:font-semibold"
				{...props}
			>
				{children}
			</ol>
		),
		li: ({ children, ...props }) => (
			<li
				className="text-foreground/85 text-base leading-8 font-normal text-pretty"
				{...props}
			>
				{children}
			</li>
		),
		blockquote: ({ children, ...props }) => (
			<blockquote
				className="border-primary/60 bg-card/60 text-muted-foreground mt-6 max-w-[78ch] rounded-r-xl border-l-2 px-6 py-4 italic"
				{...props}
			>
				{children}
			</blockquote>
		),
		code: MdxCode,
		pre: MdxPre,
		hr: () => <hr className="border-primary/25 my-10" />,
		table: ({ children, ...props }) => (
			<div
				className="border-primary/50 bg-card/50 relative w-full overflow-x-auto rounded-lg border-2 px-2 backdrop-blur-sm"
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
				className="border-primary hover:bg-card/50 data-[state=selected]:bg-card border-b transition-colors"
				data-slot="table-row"
				{...props}
			>
				{children}
			</tr>
		),
		th: ({ children, ...props }) => (
			<th
				className="border-primary h-10 border-r px-2 text-left align-middle font-semibold whitespace-nowrap last:border-r-0"
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
		img: ({ children, src, alt, className, ...props }) => {
			const isCustomEmoji =
				typeof src === 'string' &&
				src.startsWith('/uploads/feed/emojis/')
			if (isCustomEmoji) {
				return (
					<img
						alt={alt || ''}
						className={cn(
							'm-0 inline-block h-[1.2em] w-[1.2em] align-[-0.2em]',
							className
						)}
						src={resolveImageUrl(src) ?? src}
						{...props}
					/>
				)
			}
			return (
				<figure className="my-6 flex flex-col items-center">
					<img
						alt={alt || ''}
						className={cn('relative m-0 h-auto w-full', className)}
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
					</img>
					{alt ? (
						<figcaption className="text-muted-foreground mt-2 text-center text-sm">
							{alt}
						</figcaption>
					) : null}
				</figure>
			)
		},
	}
}
