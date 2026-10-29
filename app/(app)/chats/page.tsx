import {Suspense} from "react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState/EmptyState";
import {getCurrentUser} from "@/lib/session";
import {getChatPreviews} from "@/lib/data/chats";

// Правая часть, когда чат не выбран. Suspense — по той же причине, что в layout:
// пока читаем сессию и базу, Next уже показывает остальной экран
export default function ChatsPage() {
    return (
        <Suspense>
            <ChatsPlaceholder/>
        </Suspense>
    );
}

// Список берётся из кеша запроса: layout уже загрузил его
async function ChatsPlaceholder() {
    const user = await getCurrentUser();
    const chats = await getChatPreviews(user.id);

    if (chats.length === 0) {
        return (
            <EmptyState title={'Пока тихо'} text={'Найдите друзей по @нику и начните первый разговор.'}>
                <Link href={'/chats/new'} className={'echo-button primary'}>Найти людей</Link>
            </EmptyState>
        );
    }

    return <EmptyState title={'Выберите чат'} text={'Откройте переписку слева или начните новую.'}/>;
}
