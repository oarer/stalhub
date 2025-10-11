'use client'

import { useEffect, useState } from 'react'

import { useFetchType } from '@/hooks/useItem'
import { CustomToast } from '@/components/ui/Toast'
import { LOCALE, messageToString } from '@/utils/itemHelper'
import { TextBlock, DamageBlock, ListBlock } from './components/blocks'
import type { InfoBlock, TextInfoBlock } from '@/types/item.type'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card/Card'
import { unbounded } from '@/app/fonts'

export default function ItemFetch() {
    const [id] = useState('7lnj7.json')
    const url = `/${id}`
    const { data, loading, error, refetch } = useFetchType(url)

    useEffect(() => {
        if (error) {
            CustomToast('Произошла ошибка при загрузке предмета.', 'error')
        }
    }, [error])

    useEffect(() => {
        refetch(url)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!data) {
        return (
            <div className="mx-auto items-center pt-[200px]">
                Загрузка TODO skeleton
            </div>
        )
    }

    return (
        <div className="mx-auto grid max-w-[90rem] grid-cols-1 flex-col gap-12 px-4 pt-32 sm:px-6 md:px-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
                <Card>
                    <CardHeader>
                        <CardTitle className="mx-auto">
                            Тут будэт иконка
                        </CardTitle>
                        <h1
                            className={`${unbounded.className} text-semibold text-xl`}
                        >
                            {messageToString(data.name, LOCALE) || data.id}
                        </h1>
                        <p>{data.category}</p>
                    </CardHeader>
                    <CardDescription>
                        {data.infoBlocks
                            .filter(
                                (b: InfoBlock): b is TextInfoBlock =>
                                    b.type === 'text' &&
                                    (!!messageToString(b.title, LOCALE) ||
                                        !!messageToString(b.text, LOCALE))
                            )
                            .map((block, i) => (
                                <TextBlock
                                    block={block}
                                    key={i}
                                    locale={LOCALE}
                                />
                            ))}
                    </CardDescription>
                </Card>
                <div className="flex flex-col gap-4">
                    <div className="row-span-1 border p-4">
                        А тут типа аукцион
                    </div>
                    <div className="row-span-1 border p-4">
                        Тут типа урон на дисте
                    </div>
                </div>
            </div>

            <div className="lg:col-span-5">
                <div className="space-y-3">
                    {data.infoBlocks
                        .filter((b: InfoBlock) => {
                            if (b.type === 'damage') return true
                            if (b.type === 'text') {
                                return (
                                    !!messageToString(b.title, LOCALE) ||
                                    !!messageToString(b.text, LOCALE)
                                )
                            }
                            if (b.type === 'list') {
                                return (
                                    Array.isArray(b.elements) &&
                                    b.elements.length > 0
                                )
                            }
                            return false
                        })
                        .map((block: InfoBlock, idx: number) => {
                            if (block.type === 'damage')
                                return <DamageBlock block={block} key={idx} />
                            if (block.type === 'list')
                                return (
                                    <ListBlock
                                        block={block}
                                        key={idx}
                                        locale={LOCALE}
                                    />
                                )
                            return null
                        })}
                </div>
            </div>
        </div>
    )
}
