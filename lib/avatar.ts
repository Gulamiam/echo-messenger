import {Avatar} from "@/lib/types/types";

// Цвета аватаров из globals.css и подобранные к ним цвета инициалов и имени в ленте.
// Имя пишется на светлом фоне, поэтому у светлых аватаров (оранжевый, розовый, лаймовый, серый) оно темнее самого аватара
const AVATAR_PALETTE = [
    {color: 'var(--avatar-1)', textColor: 'var(--color-on-ink)', nameColor: 'var(--avatar-1)'},
    {color: 'var(--avatar-2)', textColor: 'var(--color-text)', nameColor: 'var(--color-accent-text)'},
    {color: 'var(--avatar-3)', textColor: 'var(--color-text)', nameColor: 'var(--color-accent-text)'},
    {color: 'var(--avatar-4)', textColor: 'var(--color-on-ink)', nameColor: 'var(--avatar-4)'},
    {color: 'var(--avatar-5)', textColor: 'var(--color-text)', nameColor: 'var(--color-success)'},
    {color: 'var(--avatar-6)', textColor: 'var(--color-on-ink)', nameColor: 'var(--avatar-6)'},
    {color: 'var(--avatar-7)', textColor: 'var(--color-on-ink)', nameColor: 'var(--avatar-7)'},
    {color: 'var(--avatar-8)', textColor: 'var(--color-text)', nameColor: 'var(--color-text-tertiary)'},
];

// Цвет зависит только от id: у человека он один и тот же в списке чатов, в шапке и в ленте
function pickPaletteIndex(id: string): number {
    let sum = 0;
    for (const char of id) {
        sum += char.charCodeAt(0);
    }
    return sum % AVATAR_PALETTE.length;
}

// «Айгерим Сапарова» → «АС», «Мама» → «М»
function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('');
}

export function getAvatar(id: string, name: string, image: string | null): Avatar {
    return {
        initials: getInitials(name),
        ...AVATAR_PALETTE[pickPaletteIndex(id)],
        image,
    };
}
