import type { MessageModel } from '@/lib/models/message.model';

const marat = { id: 'demo-marat', name: 'Марат', color: 'var(--avatar-4)' };
const aigerim = { id: 'demo-aigerim', name: 'Айгерим', color: 'var(--avatar-3)' };
const me = { id: 'demo-me', name: 'Вы', color: 'var(--avatar-6)' };

export const demoChat = {
    title: 'Команда Next.js',
    subtitle: '5 участников, 2 в сети',
    avatar: { initials: 'КН', color: 'var(--avatar-1)', image: null },
    typing: 'Данияр',
    messages: [
        { id: '1', author: marat, isMine: false, sentAt: '2026-10-21T11:15:00Z',
            text: 'Кто разобрался, почему список чатов не перерисовывается?' },
        { id: '2', author: me, isMine: true, status: 'read', sentAt: '2026-10-21T11:18:00Z',
            text: 'Он в layout.tsx — лейаут живёт, пока меняется только [chatId]' },
        { id: '3', author: aigerim, isMine: false, sentAt: '2026-10-21T11:19:00Z',
            text: 'Точно! Спасибо' },
    ] satisfies MessageModel[],
};