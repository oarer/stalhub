'use client'

import { Component, type ReactNode } from 'react'

export class ModelErrorBoundary extends Component<
	{ children: ReactNode; message?: string },
	{ hasError: boolean }
> {
	state = { hasError: false }

	static getDerivedStateFromError() {
		return { hasError: true }
	}

	componentDidCatch(error: unknown) {
		console.error('Model load failed:', error)
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex h-full items-center justify-center p-6 text-center text-muted-foreground text-sm">
					{this.props.message}
				</div>
			)
		}
		return this.props.children
	}
}
