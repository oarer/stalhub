import { create } from 'zustand'

type BanState = {
	isBanned: boolean
	reason: string | null
	expireIn: number | null
	setBanned: (
		isBanned: boolean,
		reason?: string | null,
		expireIn?: number | null
	) => void
}

export const useBanStore = create<BanState>((set) => ({
	isBanned: false,
	reason: null,
	expireIn: null,
	setBanned: (isBanned, reason = null, expireIn = null) =>
		set({ isBanned, reason, expireIn }),
}))
