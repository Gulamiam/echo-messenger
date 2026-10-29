export type UserId = string;     // id от Better Auth — строки
export type ChatId = string;

export interface User {
    id: UserId;
    name: string;
    username: string;
    image: string | null;
    isBot: boolean;
    lastSeenAt: string | null;     // ISO-строка в UTC: "2026-10-21T11:25:00.000Z"
}

export interface Chat {
    id: ChatId;
    type: 'direct' | 'group';
    title: string | null;          // у личного чата null — имя берётся у собеседника
    image: string | null;
    inviteCode: string | null;
    createdBy: UserId;
    lastMessageAt: string | null;
    createdAt: string;
}

export interface ChatMember {
    chatId: ChatId;
    userId: UserId;
    role: 'owner' | 'member';
    lastReadMessageId: number | null;
    joinedAt: string;
}

export interface Message {
    id: number;                    // bigserial — растёт по порядку, удобно для курсоров
    chatId: ChatId;
    authorId: UserId;
    body: string;
    attachment: Attachment | null;
    clientId: string | null;
    createdAt: string;
    editedAt: string | null;
    deletedAt: string | null;
}

export interface Attachment {
    url: string;
    width: number;                 // размеры нужны next/image, чтобы лента не прыгала при загрузке
    height: number;
}

export interface Avatar {
    initials: string;              // "АС"
    color: string;                 // var(--avatar-3), выбирается по хешу id
    image: string | null;
}

export interface ChatPreview {   // строка в списке чатов
    id: ChatId;
    title: string;
    avatar: Avatar;
    isGroup: boolean;
    lastMessage: {
        text: string;
        authorName: string | null;   // для групп: «Марат: …»
        isMine: boolean;             // «Вы: …»
        sentAt: string;
    } | null;
    unreadCount: number;
}

export type MessageStatus = 'sending' | 'failed' | 'sent' | 'read';
