import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

import { type LotsHistoryResponse } from '@/types/item.type'
import { type AuctionParams } from '@/types/api.type'

export const useAuctionHistory = ({
    id,
    limit = 50,
    additional = true,
}: AuctionParams) => {
    return useQuery<LotsHistoryResponse>({
        queryKey: ['auctionHistory', id, limit, additional],
        queryFn: async () => {
            const { data } = await axios.get<LotsHistoryResponse>(
                `/api/auction/history/${id}`,
                {
                    params: { limit, additional },
                }
            )
            return data
        },
        enabled: !!id,
        staleTime: 1000 * 60,
    })
}
