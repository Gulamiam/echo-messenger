// pluralize(5, ['участник', 'участника', 'участников']) → «участников»
export function pluralize(count: number, forms: [one: string, few: string, many: string]): string {
    const lastTwoDigits = count % 100;
    const lastDigit = count % 10;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return forms[2];
    }
    if (lastDigit === 1) {
        return forms[0];
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
        return forms[1];
    }
    return forms[2];
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Время в списке чатов: сегодня — «14:21», вчера — «вчера», раньше — «21 окт.»
export function formatChatTime(iso: string, now: Date = new Date()): string {
    const date = new Date(iso);
    if (isSameDay(date, now)) {
        return date.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (isSameDay(date, yesterday)) {
        return 'вчера';
    }

    return date.toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'});
}
