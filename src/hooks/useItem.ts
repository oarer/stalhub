import { useCallback, useState } from 'react'

import axios, { AxiosError } from 'axios'

import type { Item } from '@/types/item.type'

const GITHUB_BASE =
    'https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/items/'

export function useItem(path?: string) {
    const [data, setData] = useState<Item | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<AxiosError | null>(null)

    const fetcher = useCallback(async (p?: string) => {
        if (!p) return
        setLoading(true)
        setError(null)

        const fullUrl = `${GITHUB_BASE}${p}`

        try {
            const res = await axios.get<Item>(fullUrl)
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
        refetch: (p?: string) => fetcher(p ?? path),
    }
}
