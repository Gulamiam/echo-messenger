import {and, asc, ilike, inArray, ne, or} from "drizzle-orm";
import {db} from "@/db";
import {user} from "@/db/schema";
import {Person, UserId} from "@/lib/types/types";
import {getAvatar} from "@/lib/avatar";

// Больше в окне всё равно не поместится — человек уточнит запрос
const SEARCH_LIMIT = 20;

// % и _ в ILIKE — подстановочные знаки. Экранируем их, чтобы запрос «a_b» искал именно «a_b»
function escapeLikePattern(text: string): string {
    return text.replace(/[\\%_]/g, '\\$&');
}

// Поиск по имени и нику без учёта регистра. Пустой запрос — первые люди по алфавиту, чтобы окно не было пустым.
// Себя не показываем: написать самому себе нельзя
export async function searchPeople(query: string, currentUserId: UserId): Promise<Person[]> {
    // «@aigerim» и «aigerim» ищут одно и то же: @ — часть того, как ник пишут, а не сам ник
    const text = query.trim().replace(/^@/, '');
    const pattern = `%${escapeLikePattern(text)}%`;

    const rows = await db
        .select({id: user.id, name: user.name, username: user.username, image: user.image, isBot: user.isBot})
        .from(user)
        .where(and(
            ne(user.id, currentUserId),
            text ? or(ilike(user.name, pattern), ilike(user.username, pattern)) : undefined,
        ))
        .orderBy(asc(user.name))
        .limit(SEARCH_LIMIT);

    return rows.map((row) => ({
        id: row.id,
        name: row.name,
        username: row.username,
        isBot: row.isBot,
        avatar: getAvatar(row.id, row.name, row.image),
    }));
}

// Сколько из переданных id — настоящие пользователи. Нужно перед созданием чата: id приходят из браузера
export async function countExistingUsers(ids: UserId[]): Promise<number> {
    const rows = await db.select({id: user.id}).from(user).where(inArray(user.id, ids));
    return rows.length;
}
