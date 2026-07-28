'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeBlockProps {
	children: React.ReactNode
	className?: string
}

export function CodeBlock({ children, className }: CodeBlockProps) {
	const language = className?.replace(/language-/, '') || ''
	return (
		<SyntaxHighlighter
			customStyle={{
				borderRadius: '0.5rem',
				padding: '1rem',
				fontSize: '0.875rem',
				overflowX: 'auto',
				background: 'var(--background-code)',
				borderColor: 'var(--border-code)',
				borderWidth: '2px',
				backdropFilter: 'blur(var(--blur-xs))',
			}}
			language={language}
			style={atomDark}
			wrapLines
		>
			{String(children)}
		</SyntaxHighlighter>
	)
}
