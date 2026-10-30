import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {formatChatTime, pluralize} from '@/lib/format';

const MEMBER_FORMS: [string, string, string] = ['участник', 'участника', 'участников'];

describe('pluralize', () => {
    it('выбирает форму «один» для 1, 21, 101', () => {
        for (const count of [1, 21, 101]) {
            assert.equal(pluralize(count, MEMBER_FORMS), 'участник', `count = ${count}`);
        }
    });

    it('выбирает форму «несколько» для 2–4, 22, 34', () => {
        for (const count of [2, 3, 4, 22, 34]) {
            assert.equal(pluralize(count, MEMBER_FORMS), 'участника', `count = ${count}`);
        }
    });

    it('выбирает форму «много» для 0, 5–9, 20, 100', () => {
        for (const count of [0, 5, 9, 20, 100]) {
            assert.equal(pluralize(count, MEMBER_FORMS), 'участников', `count = ${count}`);
        }
    });

    // 11–14 оканчиваются на 1–4, но склоняются как «много» — самое частое место ошибки
    it('выбирает форму «много» для 11–14 и 111–114', () => {
        for (const count of [11, 12, 13, 14, 111, 114]) {
            assert.equal(pluralize(count, MEMBER_FORMS), 'участников', `count = ${count}`);
        }
    });
});

// Даты собираются в локальном времени: formatChatTime сравнивает дни по часовому
// поясу машины, и тест не должен зависеть от того, где его запускают.
function localIso(year: number, month: number, day: number, hours = 12, minutes = 0): string {
    return new Date(year, month - 1, day, hours, minutes).toISOString();
}

describe('formatChatTime', () => {
    const now = new Date(2026, 9, 30, 18, 0);

    it('сегодня показывает время', () => {
        assert.equal(formatChatTime(localIso(2026, 10, 30, 14, 21), now), '14:21');
    });

    it('сегодня дополняет часы нулём', () => {
        assert.equal(formatChatTime(localIso(2026, 10, 30, 9, 5), now), '09:05');
    });

    it('сегодня в первую минуту суток — тоже время, а не «вчера»', () => {
        assert.equal(formatChatTime(localIso(2026, 10, 30, 0, 0), now), '00:00');
    });

    it('вчера показывает «вчера»', () => {
        assert.equal(formatChatTime(localIso(2026, 10, 29, 23, 59), now), 'вчера');
    });

    it('позавчера и раньше показывает дату', () => {
        assert.equal(formatChatTime(localIso(2026, 10, 28), now), '28 окт.');
        assert.equal(formatChatTime(localIso(2026, 10, 21), now), '21 окт.');
    });

    it('то же число прошлого месяца — дата, а не «сегодня»', () => {
        assert.equal(formatChatTime(localIso(2026, 9, 30), now), '30 сент.');
    });

    it('«вчера» работает через границу месяца', () => {
        const firstOfMonth = new Date(2026, 10, 1, 10, 0);
        assert.equal(formatChatTime(localIso(2026, 10, 31), firstOfMonth), 'вчера');
    });

    it('«вчера» работает через границу года', () => {
        const newYear = new Date(2027, 0, 1, 10, 0);
        assert.equal(formatChatTime(localIso(2026, 12, 31), newYear), 'вчера');
    });
});
