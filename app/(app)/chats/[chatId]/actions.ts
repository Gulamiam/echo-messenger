'use server';
import {revalidatePath} from "next/cache";
import {z} from "zod";
import {getCurrentUser} from "@/lib/session";
import {addMessage, isChatMember} from "@/lib/data/chats";
import {ChatId} from "@/lib/types/types";

const messageSchema = z.object({
    body: z.string().trim().min(1).max(4000),
    clientId: z.uuid(),
});

export type SendMessageResult = { ok: true } | { ok: false };

// Server Action отправки сообщения. Ошибку не бросаем, а возвращаем: лента покажет «Не отправлено»
// у конкретного сообщения и предложит повторить, а не уронит весь экран
export async function sendMessage(chatId: ChatId, body: string, clientId: string): Promise<SendMessageResult> {
    const user = await getCurrentUser();

    const parsed = messageSchema.safeParse({body, clientId});
    if (!parsed.success || !await isChatMember(chatId, user.id)) {
        return {ok: false};
    }

    await addMessage(chatId, user.id, parsed.data.body, parsed.data.clientId);

    // Next заново соберёт ленту (в ней появится сохранённое сообщение) и список слева (чат поднимется наверх)
    // и вернёт их вместе с ответом на этот же запрос
    revalidatePath('/chats', 'layout');
    return {ok: true};
}
