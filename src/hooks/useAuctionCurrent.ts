import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

import { type LotsResponse } from '@/types/item.type'
import { type AuctionParams } from '@/types/api.type'

export const useAuctionCurrent = ({ id }: AuctionParams) => {
    return useQuery<LotsResponse>({
        queryKey: ['auctionCurrent', id],
        queryFn: async () => {
            const { data } = await axios.get<LotsResponse>(
                `/api/auction/lots/${id}`
            )
            return data
        },
        enabled: !!id,
        staleTime: 1000 * 60,
    })
}
