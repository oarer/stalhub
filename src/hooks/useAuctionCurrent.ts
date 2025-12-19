import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

import { type LotsResponse } from '@/types/item.type'
import { type AuctionParams } from '@/types/api.type'

export const useAuctionCurrent = ({
    id,
    limit = 50,
    additional = true,
}: AuctionParams) => {
    return useQuery<LotsResponse>({
        queryKey: ['auctionCurrent', id, limit, additional],
        queryFn: async () => {
            const { data } = await axios.get<LotsResponse>(
                `/api/auction/lots/${id}`,
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
