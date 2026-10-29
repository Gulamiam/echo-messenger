import {
    pgTable, pgEnum, text, timestamp, bigserial, bigint, jsonb,
    primaryKey, index, uniqueIndex,
} from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export * from './auth-schema';

export const chatType = pgEnum('chat_type', ['direct', 'group']);
export const memberRole = pgEnum('member_role', ['owner', 'member']);

export const chats = pgTable('chats', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    type: chatType('type').notNull(),
    title: text('title'),                        // у личных чатов null
    image: text('image'),
    inviteCode: text('invite_code').unique(),    // только у групп
    directKey: text('direct_key').unique(),      // только у личных: "idА:idБ" по алфавиту — второго такого чата не будет
    createdBy: text('created_by').notNull().references(() => user.id),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const chatMembers = pgTable('chat_members', {
    chatId: text('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    role: memberRole('role').notNull().default('member'),
    lastReadMessageId: bigint('last_read_message_id', { mode: 'number' }),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    primaryKey({ columns: [t.chatId, t.userId] }),  // человек в чате только один раз
    index('chat_members_user_idx').on(t.userId),    // быстро найти все чаты пользователя
]);

export const messages = pgTable('messages', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    chatId: text('chat_id').notNull().references(() => chats.id, { onDelete: 'cascade' }),
    authorId: text('author_id').notNull().references(() => user.id),
    body: text('body').notNull(),
    attachment: jsonb('attachment').$type<{ url: string; width: number; height: number }>(),
    clientId: text('client_id'),                    // id из браузера: защита от дублей
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    editedAt: timestamp('edited_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => [
    index('messages_chat_idx').on(t.chatId, t.id),             // лента чата и подгрузка истории
    uniqueIndex('messages_client_idx').on(t.authorId, t.clientId),
]);