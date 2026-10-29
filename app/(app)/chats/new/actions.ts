'use server';
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {z} from "zod";
import {getCurrentUser} from "@/lib/session";
import {countExistingUsers} from "@/lib/data/people";
import {createDirectChat, createGroupChat} from "@/lib/data/chats";
import {ChatId} from "@/lib/types/types";

const newChatSchema = z.object({
    memberIds: z.array(z.string().min(1))
        .min(1, 'Выберите хотя бы одного человека')
        .max(50, 'В группе может быть не больше 50 человек'),
    title: z.string().trim().max(60, 'Название — не длиннее 60 символов'),
});

export interface NewChatState {
    formError?: string;
    titleError?: string;
}

// Server Action: вызывается из формы окна «Новый чат». Один человек — личный чат (или уже существующий),
// несколько — группа. Данные приходят из браузера, поэтому проверяем всё заново, а не верим форме
export async function createChat(_previous: NewChatState, formData: FormData): Promise<NewChatState> {
    const user = await getCurrentUser();

    const parsed = newChatSchema.safeParse({
        memberIds: formData.getAll('memberIds'),
        title: formData.get('title') ?? '',
    });
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return issue.path[0] === 'title' ? {titleError: issue.message} : {formError: issue.message};
    }

    // Повторы и самого себя убираем: в чат нельзя добавить человека дважды
    const memberIds = [...new Set(parsed.data.memberIds)].filter((id) => id !== user.id);
    if (memberIds.length === 0) {
        return {formError: 'Выберите хотя бы одного человека'};
    }
    if (await countExistingUsers(memberIds) !== memberIds.length) {
        return {formError: 'Кого-то из выбранных уже нет. Поищите заново'};
    }

    let chatId: ChatId;
    if (memberIds.length === 1) {
        chatId = await createDirectChat(user.id, memberIds[0]);
    } else {
        if (!parsed.data.title) {
            return {titleError: 'Введите название группы'};
        }
        chatId = await createGroupChat(user.id, memberIds, parsed.data.title);
    }

    // Список чатов в layout загружен раньше — просим Next собрать его заново, чтобы новый чат появился слева
    revalidatePath('/chats', 'layout');
    redirect(`/chats/${chatId}`);
}
