import {cache} from "react";
import {and, count, desc, eq, gt, inArray, isNull, ne, sql} from "drizzle-orm";
import {db} from "@/db";
import {chatMembers, chats, messages, user} from "@/db/schema";
import {ChatDetails, ChatId, ChatPreview, UserId} from "@/lib/types/types";
import {MessageModel} from "@/lib/models/message.model";
import {getAvatar} from "@/lib/avatar";
import {pluralize} from "@/lib/format";

// Сколько последних сообщений показываем при открытии чата. Более ранние — потом, подгрузкой по курсору
const MESSAGES_PAGE_SIZE = 50;

// Собеседник в личном чате: от него берутся название и аватар чата
async function getCompanions(directChatIds: ChatId[], userId: UserId) {
    if (directChatIds.length === 0) {
        return [];
    }
    return db
        .select({
            chatId: chatMembers.chatId,
            id: user.id,
            name: user.name,
            username: user.username,
            image: user.image,
            isBot: user.isBot,
        })
        .from(chatMembers)
        .innerJoin(user, eq(user.id, chatMembers.userId))
        .where(and(inArray(chatMembers.chatId, directChatIds), ne(chatMembers.userId, userId)));
}

// По одному последнему сообщению на чат: DISTINCT ON оставляет первую строку каждой группы,
// а сортировка по убыванию id делает первой самую свежую
async function getLastMessages(chatIds: ChatId[]) {
    return db
        .selectDistinctOn([messages.chatId], {
            chatId: messages.chatId,
            body: messages.body,
            hasAttachment: sql<boolean>`${messages.attachment} is not null`,
            authorId: messages.authorId,
            authorName: user.name,
            createdAt: messages.createdAt,
        })
        .from(messages)
        .innerJoin(user, eq(user.id, messages.authorId))
        .where(and(inArray(messages.chatId, chatIds), isNull(messages.deletedAt)))
        .orderBy(messages.chatId, desc(messages.id));
}

// Непрочитанные — чужие сообщения новее того, что пользователь видел последним в этом чате
async function getUnreadCounts(userId: UserId) {
    return db
        .select({chatId: messages.chatId, count: count()})
        .from(messages)
        .innerJoin(chatMembers, and(eq(chatMembers.chatId, messages.chatId), eq(chatMembers.userId, userId)))
        .where(and(
            ne(messages.authorId, userId),
            isNull(messages.deletedAt),
            gt(messages.id, sql`coalesce(${chatMembers.lastReadMessageId}, 0)`),
        ))
        .groupBy(messages.chatId);
}

// Список чатов пользователя, свежие сверху.
// cache: layout и страница /chats в одном запросе получают список один раз
export const getChatPreviews = cache(async (userId: UserId): Promise<ChatPreview[]> => {
    const myChats = await db
        .select({id: chats.id, type: chats.type, title: chats.title, image: chats.image})
        .from(chatMembers)
        .innerJoin(chats, eq(chats.id, chatMembers.chatId))
        .where(eq(chatMembers.userId, userId))
        // У нового чата сообщений ещё нет — сортируем его по времени создания, чтобы он оказался наверху
        .orderBy(sql`coalesce(${chats.lastMessageAt}, ${chats.createdAt}) desc`);

    if (myChats.length === 0) {
        return [];
    }

    const chatIds = myChats.map((chat) => chat.id);
    const directChatIds = myChats.filter((chat) => chat.type === 'direct').map((chat) => chat.id);
    const [companions, lastMessages, unreadCounts] = await Promise.all([
        getCompanions(directChatIds, userId),
        getLastMessages(chatIds),
        getUnreadCounts(userId),
    ]);

    return myChats.map((chat): ChatPreview => {
        const isGroup = chat.type === 'group';
        const companion = companions.find((member) => member.chatId === chat.id);
        const lastMessage = lastMessages.find((message) => message.chatId === chat.id);
        const unread = unreadCounts.find((row) => row.chatId === chat.id);

        const title = isGroup ? (chat.title ?? 'Группа') : (companion?.name ?? 'Удалённый пользователь');
        const avatar = isGroup
            ? getAvatar(chat.id, title, chat.image)
            : getAvatar(companion?.id ?? chat.id, title, companion?.image ?? null);

        return {
            id: chat.id,
            title,
            avatar,
            isGroup,
            lastMessage: lastMessage
                ? {
                    // У сообщения с одной картинкой текста нет — показываем, что это фото
                    text: lastMessage.body || (lastMessage.hasAttachment ? 'Фото' : ''),
                    authorName: lastMessage.authorName,
                    isMine: lastMessage.authorId === userId,
                    sentAt: lastMessage.createdAt.toISOString(),
                }
                : null,
            unreadCount: unread?.count ?? 0,
        };
    });
});

// Шапка чата. null — если чата нет или пользователь в нём не состоит:
// для чужого чата ответ тот же, что для несуществующего, чтобы по id нельзя было узнать, что он есть
export async function getChat(chatId: ChatId, userId: UserId): Promise<ChatDetails | null> {
    const [chat] = await db
        .select({id: chats.id, type: chats.type, title: chats.title, image: chats.image})
        .from(chats)
        .innerJoin(chatMembers, and(eq(chatMembers.chatId, chats.id), eq(chatMembers.userId, userId)))
        .where(eq(chats.id, chatId));

    if (!chat) {
        return null;
    }

    if (chat.type === 'group') {
        const [members] = await db
            .select({count: count()})
            .from(chatMembers)
            .where(eq(chatMembers.chatId, chatId));
        const title = chat.title ?? 'Группа';
        return {
            id: chat.id,
            title,
            subtitle: `${members.count} ${pluralize(members.count, ['участник', 'участника', 'участников'])}`,
            avatar: getAvatar(chat.id, title, chat.image),
            isGroup: true,
        };
    }

    const [companion] = await getCompanions([chatId], userId);
    const title = companion?.name ?? 'Удалённый пользователь';
    return {
        id: chat.id,
        title,
        subtitle: companion?.isBot ? 'бот' : (companion?.username ? `@${companion.username}` : ''),
        avatar: getAvatar(companion?.id ?? chat.id, title, companion?.image ?? null),
        isGroup: false,
    };
}

// Последние сообщения чата в хронологическом порядке — так, как они идут в ленте сверху вниз.
// Членство не проверяем: страница вызывает это только после getChat
export async function getMessages(chatId: ChatId, userId: UserId): Promise<MessageModel[]> {
    const rows = await db
        .select({
            id: messages.id,
            body: messages.body,
            attachment: messages.attachment,
            clientId: messages.clientId,
            createdAt: messages.createdAt,
            authorId: user.id,
            authorName: user.name,
        })
        .from(messages)
        .innerJoin(user, eq(user.id, messages.authorId))
        .where(and(eq(messages.chatId, chatId), isNull(messages.deletedAt)))
        .orderBy(desc(messages.id))
        .limit(MESSAGES_PAGE_SIZE);

    // Берём самые новые (сортировка по убыванию), а показываем от старых к новым.
    // Обычные объекты, а не new MessageModel: лента — клиентский компонент, а React передаёт туда
    // с сервера только простые объекты, экземпляры классов не проходят
    return rows.reverse().map((row): MessageModel => ({
        id: String(row.id),
        clientId: row.clientId ?? undefined,
        text: row.body,
        sentAt: row.createdAt.toISOString(),
        author: {
            id: row.authorId,
            name: row.authorName,
            color: getAvatar(row.authorId, row.authorName, null).nameColor,
        },
        isMine: row.authorId === userId,
        status: row.authorId === userId ? 'sent' : undefined,
        attachment: row.attachment ?? undefined,
    }));
}

// Личный чат с человеком. Если он уже есть — возвращаем его id, второй такой не создаём:
// directKey — пара id по алфавиту, одинаковая для обоих собеседников, и в базе она уникальна
export async function createDirectChat(userId: UserId, companionId: UserId): Promise<ChatId> {
    const directKey = [userId, companionId].sort().join(':');

    return db.transaction(async (tx) => {
        // onConflictDoNothing: если двое одновременно нажали «Написать» друг другу, второй вставки просто не будет
        const [created] = await tx
            .insert(chats)
            .values({type: 'direct', directKey, createdBy: userId})
            .onConflictDoNothing({target: chats.directKey})
            .returning({id: chats.id});

        if (!created) {
            const [existing] = await tx.select({id: chats.id}).from(chats).where(eq(chats.directKey, directKey));
            return existing.id;
        }

        await tx.insert(chatMembers).values([
            {chatId: created.id, userId, role: 'owner'},
            {chatId: created.id, userId: companionId, role: 'member'},
        ]);
        return created.id;
    });
}

// Группа: создатель — владелец, остальные — участники. Транзакция: без участников чат не должен остаться
export async function createGroupChat(userId: UserId, memberIds: UserId[], title: string): Promise<ChatId> {
    return db.transaction(async (tx) => {
        const [created] = await tx
            .insert(chats)
            .values({type: 'group', title, createdBy: userId})
            .returning({id: chats.id});

        await tx.insert(chatMembers).values([
            {chatId: created.id, userId, role: 'owner' as const},
            ...memberIds.map((memberId) => ({chatId: created.id, userId: memberId, role: 'member' as const})),
        ]);
        return created.id;
    });
}

// Состоит ли пользователь в чате. Проверяем перед записью: id чата приходит из браузера
export async function isChatMember(chatId: ChatId, userId: UserId): Promise<boolean> {
    const [membership] = await db
        .select({chatId: chatMembers.chatId})
        .from(chatMembers)
        .where(and(eq(chatMembers.chatId, chatId), eq(chatMembers.userId, userId)));
    return Boolean(membership);
}

// Сохраняет сообщение и поднимает чат наверх списка (lastMessageAt).
// clientId придумывает браузер: если запрос повторили (сеть оборвалась, нажали «Повторить»),
// уникальный индекс (author_id, client_id) не даст сохранить сообщение второй раз
export async function addMessage(chatId: ChatId, authorId: UserId, body: string, clientId: string): Promise<void> {
    await db.transaction(async (tx) => {
        const [created] = await tx
            .insert(messages)
            .values({chatId, authorId, body, clientId})
            .onConflictDoNothing({target: [messages.authorId, messages.clientId]})
            .returning({createdAt: messages.createdAt});

        if (created) {
            await tx.update(chats).set({lastMessageAt: created.createdAt}).where(eq(chats.id, chatId));
        }
    });
}
