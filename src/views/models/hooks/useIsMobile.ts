import { useEffect, useState } from 'react'

export function useIsMobile() {
	const [mobile, setMobile] = useState(false)
	useEffect(() => {
		const mq = window.matchMedia('(max-width: 768px)')
		setMobile(mq.matches)
		const handler = (e: MediaQueryListEvent) => setMobile(e.matches)
		mq.addEventListener('change', handler)
		return () => mq.removeEventListener('change', handler)
	}, [])
	return mobile
}
