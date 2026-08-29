'use client'

import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'
import Link from 'next/link'
import { createContext, useContext } from 'react'
import { cn } from '@/lib/cn'
import { Callout } from './callout'
import { CodeBlock } from './code-block'
import { Gallery } from './gallery'
import { QuestMap } from './quest-map'

const PreCodeContext = createContext(false)

function slugify(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\p{M}]/gu, '')
		.replace(/[^\p{L}\p{N}\s-]/gu, '')
		.replace(/\s+/g, '-')
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
				className="mb-6 scroll-m-20 font-bold text-4xl tracking-tight lg:text-5xl"
				{...props}
			>
				{children}
			</h1>
		),
		h2: ({ children, ...props }) => {
			const id =
				typeof children === 'string' ? slugify(children) : undefined
			return (
				<h2
					className="mt-10 mb-4 scroll-m-20 border-primary border-b pb-2 font-semibold text-3xl tracking-tight first:mt-0"
					id={id}
					{...props}
				>
					{children}
				</h2>
			)
		},
		h3: ({ children, ...props }) => {
			const id =
				typeof children === 'string' ? slugify(children) : undefined
			return (
				<h3
					className="mt-8 mb-4 scroll-m-20 font-semibold text-2xl tracking-tight"
					id={id}
					{...props}
				>
					{children}
				</h3>
			)
		},
		h4: ({ children, ...props }) => {
			const id =
				typeof children === 'string' ? slugify(children) : undefined
			return (
				<h4
					className="mt-6 mb-3 scroll-m-20 font-semibold text-xl tracking-tight"
					id={id}
					{...props}
				>
					{children}
				</h4>
			)
		},
		p: ({ children, ...props }) => (
			<p className="not-first:mt-4 font-semibold leading-7" {...props}>
				{children}
			</p>
		),
		a: ({ href, children, ...props }) => {
			return (
				<Link
					className="font-semibold underline underline-offset-4 transition-opacity hover:opacity-70"
					href={href || ''}
					{...props}
				>
					{children}
				</Link>
			)
		},
		ul: ({ children, ...props }) => (
			<ul
				className="my-4 ml-6 list-disc font-semibold [&>li]:mt-2"
				{...props}
			>
				{children}
			</ul>
		),
		ol: ({ children, ...props }) => (
			<ol
				className="my-4 ml-6 list-decimal font-semibold [&>li]:mt-2"
				{...props}
			>
				{children}
			</ol>
		),
		li: ({ children, ...props }) => (
			<li className="font-semibold leading-7" {...props}>
				{children}
			</li>
		),
		blockquote: ({ children, ...props }) => (
			<blockquote
				className="mt-6 border-l-2 pl-6 font-semibold italic"
				{...props}
			>
				{children}
			</blockquote>
		),
		code: MdxCode,
		pre: MdxPre,
		hr: () => <hr className="my-8 border-primary" />,
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
				className="whitespace-nowrap border-primary border-r p-2 align-middle font-semibold last:border-r-0"
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
					<figcaption className="mt-2 text-center text-neutral-400 text-sm">
						{alt}
					</figcaption>
				) : null}
			</figure>
		),
	}
}
