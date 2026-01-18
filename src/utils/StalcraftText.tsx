import React from 'react'

interface StalcraftTextProps {
    text: string
    defaultColor?: string
}

const MC_COLORS: Record<string, string> = {
    '0': '#000000',
    '1': '#0000AA',
    '2': '#00AA00',
    '3': '#00AAAA',
    '4': '#AA0000',
    '5': '#AA00AA',
    '6': '#FFAA00',
    '7': '#AAAAAA',
    '8': '#555555',
    '9': '#5555FF',
    a: '#55FF55',
    b: '#55FFFF',
    c: '#FF5555',
    d: '#FF55FF',
    e: '#FFFF55',
    f: '#FFFFFF',
}

export const StalcraftText: React.FC<StalcraftTextProps> = ({
    text,
    defaultColor = '#FFFFFF',
}) => {
    const regex = /§(#([0-9A-Fa-f]{6})|[0-9A-Fa-fr])/g

    const trimmedText = text.replace(/^\n+/, '')
    const lines = trimmedText.split('\n').map((line) => {
        const spans: { color: string; text: string }[] = []

        let lastIndex = 0
        let currentColor = defaultColor
        let match: RegExpExecArray | null
        let buffer = ''

        while ((match = regex.exec(line)) !== null) {
            const between = line.slice(lastIndex, match.index)
            if (between) buffer += between

            if (buffer) {
                spans.push({ color: currentColor, text: buffer })
                buffer = ''
            }

            const code = match[1]

            if (code === 'r') {
                currentColor = defaultColor
            } else if (code.startsWith('#')) {
                currentColor = code
            } else {
                currentColor = MC_COLORS[code.toLowerCase()] ?? currentColor
            }

            lastIndex = match.index + match[0].length
        }

        const rest = line.slice(lastIndex)
        if (rest) buffer += rest
        if (buffer) spans.push({ color: currentColor, text: buffer })

        return spans
    })

    return (
        <pre className="text-md font-semibold">
            {lines.map((spans, i) => (
                <React.Fragment key={i}>
                    {spans.map((s, j) => (
                        <span
                            className="font-sans"
                            key={j}
                            style={{ color: s.color }}
                        >
                            {s.text}
                        </span>
                    ))}
                    {i < lines.length - 1 && <br />}
                </React.Fragment>
            ))}
        </pre>
    )
}
