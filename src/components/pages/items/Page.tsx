'use client'

import { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'
import Image from 'next/image'

import { useItem } from '@/hooks/useItem'
import { CustomToast } from '@/components/ui/Toast'
import {
    getCategoryLabel,
    isNumericVariantsBlock,
    messageToString,
} from '@/utils/itemUtils'
import { TextBlock, ListBlock } from './components/blocks'
import {
    InfoColor,
    infoColorMap,
    type DamageDistanceInfoBlock,
    type ElementListBlock,
    type InfoBlock,
    type TextInfoBlock,
} from '@/types/item.type'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/Card'
import { unbounded } from '@/app/fonts'
import { getLocale } from '@/lib/getLocale'
import { useAuctionHistory } from '@/hooks/useAuctionHistory'
import { DamageChart } from '../ttk/components/DamageChart'
import { NumericVariantsCard } from './components/NumericVariantsCard'
import LoadingItem from './components/loading'
import { useAuctionCurrent } from '@/hooks/useAuctionCurrent'
import AuctionTabs from './components/Auction/AuctionTabs'

export default function ItemFetch() {
    const [numericVariants, setNumericVariants] = useState<number>(0)
    const params = useParams()
    const locale = getLocale()

    const slug = Array.isArray(params?.slug) ? params.slug : []
    const id = slug[slug.length - 1]

    const { data: auctionHistory } = useAuctionHistory({ id })
    const { data: auctionCurrent } = useAuctionCurrent({ id })

    const githubUrl = `${slug.join('/')}.json`
    const iconUrl = `https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons/${slug.join('/')}.png`

    const { data, error, loading, refetch } = useItem(githubUrl)
    const categoryLabel = getCategoryLabel(data, locale)

    useEffect(() => {
        if (error) {
            CustomToast('Ошибка при загрузке предмета.', 'error')
        }
    }, [error])

    useEffect(() => {
        if (id) refetch(githubUrl)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    if (loading || !data) {
        return <LoadingItem />
    }

    return (
        <div className="mx-auto grid max-w-360 grid-cols-1 flex-col gap-12 px-4 pt-32 pb-12 sm:px-6 md:px-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
                <Card>
                    <CardHeader className="space-y-4">
                        <CardTitle className="mx-auto">
                            <Image
                                alt={
                                    messageToString(data.name, locale) || 'item'
                                }
                                height={128}
                                src={iconUrl}
                                width={128}
                            />
                        </CardTitle>
                        <div className="space-y-2 text-center">
                            <h1
                                className={`${unbounded.className} text-xl font-semibold`}
                                style={{
                                    color:
                                        infoColorMap[data.color as InfoColor] ||
                                        InfoColor.DEFAULT,
                                }}
                            >
                                {messageToString(data.name, locale) || data.id}
                            </h1>
                            <p className="font-semibold">{categoryLabel}</p>
                        </div>
                    </CardHeader>

                    <CardDescription className="py-3">
                        {data.infoBlocks
                            .filter(
                                (b: InfoBlock): b is TextInfoBlock =>
                                    b.type === 'text' &&
                                    (!!messageToString(b.title, locale) ||
                                        !!messageToString(b.text, locale))
                            )
                            .map((block, i) => (
                                <TextBlock
                                    block={block}
                                    key={i}
                                    locale={locale}
                                />
                            ))}
                    </CardDescription>
                </Card>

                <div className="flex flex-col gap-4">
                    {!auctionHistory || !auctionCurrent ? (
                        <div className="flex h-80 w-full items-center justify-center rounded-2xl p-4 shadow-lg">
                            Загружаем данные
                        </div>
                    ) : (
                        <AuctionTabs
                            auctionCurrent={auctionCurrent.lots}
                            auctionHistory={auctionHistory.prices}
                        />
                    )}

                    {data.infoBlocks
                        .filter(
                            (block): block is DamageDistanceInfoBlock =>
                                block.type === 'damage'
                        )
                        .map((block, idx) => (
                            <DamageChart block={block} key={idx} />
                        ))}
                </div>
            </div>

            <div className="lg:col-span-5">
                <div className="space-y-3">
                    {data.infoBlocks
                        .filter(
                            (b): b is ElementListBlock =>
                                b.type === 'list' &&
                                Array.isArray(b.elements) &&
                                b.elements.length > 0
                        )
                        .map((block, idx) =>
                            block.elements.some(isNumericVariantsBlock) ? (
                                <NumericVariantsCard
                                    key={idx}
                                    numericVariants={numericVariants}
                                    onChange={setNumericVariants}
                                />
                            ) : null
                        )}

                    {data.infoBlocks
                        .filter(
                            (b): b is ElementListBlock =>
                                b.type === 'list' &&
                                Array.isArray(b.elements) &&
                                b.elements.length > 0
                        )
                        .map((block, idx) => (
                            <ListBlock
                                block={block}
                                key={idx}
                                locale={locale}
                                numericVariants={numericVariants}
                            />
                        ))}
                </div>
            </div>
        </div>
    )
}
