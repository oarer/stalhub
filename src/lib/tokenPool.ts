export type TokenState = {
	token: string
	blockedUntil: number
	inUse: boolean
}

export class TokenPool {
	private tokens: string[]
	private used: Set<number> = new Set()
	private idx = 0

	constructor(tokens: string[]) {
		if (!tokens.length) throw new Error('No tokens provided')
		this.tokens = tokens
	}

	acquire(): number {
		const total = this.tokens.length

		if (this.used.size >= total) {
			this.used.clear()
		}

		const startIdx = this.idx
		do {
			const i = this.idx
			this.idx = (this.idx + 1) % total
			if (!this.used.has(i)) {
				this.used.add(i)
				return i
			}
		} while (this.idx !== startIdx)

		throw new Error('No available tokens')
	}

	block(idx: number, ms: number) {
		setTimeout(() => this.used.delete(idx), ms)
	}

	getToken(idx: number) {
		return this.tokens[idx]
	}

	status() {
		return this.tokens.map((t, i) => ({
			token: t,
			used: this.used.has(i),
		}))
	}
}
