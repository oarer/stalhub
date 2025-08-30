'use client'

import { motion } from 'motion/react'
import { Icon } from '@iconify/react'

import { floatingIcons } from '@/constants/landing.const'

export default function FloatingIcons() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {floatingIcons.map((iconData, index) => (
                <motion.div
                    animate={{
                        y: [0, index % 2 === 0 ? -20 : -15, 0],
                        rotate: [0, index % 2 === 0 ? 5 : -3, 0],
                    }}
                    className={iconData.className}
                    key={index}
                    transition={{
                        duration: index % 2 === 0 ? 6 : 8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'easeInOut',
                        delay: iconData.delay,
                    }}
                >
                    <Icon
                        className={`${iconData.size} ${iconData.color}`}
                        icon={iconData.icon}
                    />
                </motion.div>
            ))}
        </div>
    )
}
