import React, {Suspense} from 'react';
import Link from "next/link";
import {ScrollArea} from "@/components/ScrollArea";
import ChatList from "@/components/ChatList/ChatList";
import Avatar from "@/components/Avatar/Avatar";
import {getCurrentUser} from "@/lib/session";
import {getChatPreviews} from "@/lib/data/chats";
import {getAvatar} from "@/lib/avatar";
import {ChatPreview} from "@/lib/types/types";
import '@/lib/icons.scss'
import './layout.module.scss'

// Список чатов живёт здесь, а не на странице: при переходе между чатами меняется только [chatId],
// layout не перемонтируется, и список не мигает.
// Всё, что зависит от сессии и базы, стоит внутри <Suspense>: с cacheComponents Next отдаёт
// рамку экрана сразу, а данные подставляет, когда они готовы. Без Suspense страница ждала бы базу целиком
// modal — слот @modal: окно «Новый чат» поверх экрана. Когда окно закрыто, там null
export default function ChatsLayout({children, modal}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
    return (
        <div className={'chats'}>
            <aside className={'chats__sidebar'} aria-label={'Чаты'}>
                <header className={'chats__header'}>
                    <Link href={'/'} className={'chats__home'} aria-label={'Эхо, на главную'}>
                        <span className={'ico-logo'}/>
                        <span className={'chats__heading'}>Чаты</span>
                    </Link>
                    <Link href={'/chats/new'} className={'chats__new'} aria-label={'Новый чат'}>
                        <span className={'ico-plus'}/>
                    </Link>
                    <Suspense fallback={<span className={'chats__profile-placeholder'}/>}>
                        <ProfileLink/>
                    </Suspense>
                </header>

                <Suspense fallback={<ChatListSkeleton/>}>
                    <ChatListSection/>
                </Suspense>
            </aside>

            <main className={'chats__main'}>
                {children}
            </main>

            {modal}
        </div>
    )
}

async function ProfileLink() {
    const user = await getCurrentUser();
    return (
        <Link href={'/settings'} className={'chats__profile'} aria-label={'Настройки профиля'}>
            <Avatar avatar={getAvatar(user.id, user.name, user.image ?? null)}/>
        </Link>
    );
}

async function ChatListSection() {
    const user = await getCurrentUser();

    // Ошибку списка показываем прямо в боковой панели: error.tsx этого сегмента ловит ошибки
    // только внутри children, а ошибка самого layout уронила бы весь экран вместе с открытым чатом
    let chats: ChatPreview[];
    try {
        chats = await getChatPreviews(user.id);
    } catch (error) {
        console.error('Не удалось загрузить список чатов', error);
        return <p className={'chats__list-error'}>Не удалось загрузить чаты. Обновите страницу.</p>;
    }

    return (
        <ScrollArea className={'chats__list'}>
            <ChatList chats={chats}/>
        </ScrollArea>
    );
}

// Строки-заглушки той же высоты, что настоящие: когда список загрузится, ничего не сдвинется
function ChatListSkeleton() {
    return (
        <ul className={'chats__list-skeleton'} aria-busy={true} aria-label={'Загружаем чаты'}>
            {[0, 1, 2, 3, 4].map((index) => (
                <li key={index} className={'chats__skeleton-item'}>
                    <span className={'chats__skeleton-avatar'}/>
                    <span className={'chats__skeleton-lines'}>
                        <span className={'chats__skeleton-line'}/>
                        <span className={'chats__skeleton-line chats__skeleton-line_short'}/>
                    </span>
                </li>
            ))}
        </ul>
    );
}
