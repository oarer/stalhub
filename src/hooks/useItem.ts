import { useCallback, useState } from 'react'

import axios, { AxiosError } from 'axios'

import type { Item } from '@/types/item.type'

export function useFetchType(url?: string) {
    const [data, setData] = useState<Item | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<AxiosError | null>(null)

    const fetcher = useCallback(async (u?: string) => {
        if (!u) return
        setLoading(true)
        setError(null)

        try {
            const res = await axios.get<Item>(u)
            const raw = res.data

            if (
                raw &&
                typeof raw.status === 'object' &&
                raw.status !== null &&
                'state' in (raw.status as Record<string, unknown>)
            ) {
                const statusObj = raw.status as { state: Item['status'] }
                raw.status = statusObj.state
            }

            setData(raw)
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err)
            } else {
                setError(new AxiosError('Unknown error'))
            }
            setData(null)
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        data,
        loading,
        error,
        refetch: (u?: string) => fetcher(u ?? url),
    }
}
