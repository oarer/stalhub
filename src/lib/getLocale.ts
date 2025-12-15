import { type Locale } from '@/types/item.type'

export const getLocale = (): Locale => {
    if (typeof document !== 'undefined') {
        const match = document.cookie.match(/(?:^|; )lang=([^;]*)/)?.[1]
        if (
            match === 'ru' ||
            match === 'en' ||
            match === 'es' ||
            match === 'fr'
        ) {
            return match
        }
    }
    return 'en'
}
