import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Consent = 'accepted' | 'declined' | null

interface ConsentState {
	consent: Consent
	decide: (choice: Exclude<Consent, null>) => void
}

const UMAMI_DISABLED_KEY = 'umami.disabled'

export const useConsentStore = create<ConsentState>()(
	persist(
		(set) => ({
			consent: null,
			decide: (choice) => {
				if (choice === 'declined') {
					localStorage.setItem(UMAMI_DISABLED_KEY, '1')
				} else {
					localStorage.removeItem(UMAMI_DISABLED_KEY)
				}

				set({ consent: choice })
			},
		}),
		{
			name: 'cookie-consent',
			partialize: (state) => ({ consent: state.consent }),
		}
	)
)