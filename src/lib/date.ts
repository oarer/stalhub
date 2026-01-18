export const DATE_FORMATS = {
    time: {
        hour: '2-digit',
        minute: '2-digit',
    },
    date: {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    },
    datetime: {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    },
} as const

export const formatDate = (
    date: Date | string | number,
    format: keyof typeof DATE_FORMATS = 'datetime',
    locale = 'ru-RU'
) => new Date(date).toLocaleString(locale, DATE_FORMATS[format])
