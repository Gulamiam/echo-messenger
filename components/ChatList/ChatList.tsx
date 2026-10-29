'use client';
import Link from "next/link";
import {useParams} from "next/navigation";
import clsx from "clsx";
import Avatar from "@/components/Avatar/Avatar";
import {ChatPreview} from "@/lib/types/types";
import {formatChatTime} from "@/lib/format";
import './ChatList.scss'

// «Вы: …» для своих, «Марат: …» в группах, просто текст в личных чатах
function getPreviewText(chat: ChatPreview): string {
    const message = chat.lastMessage;
    if (!message) {
        return 'Сообщений пока нет';
    }
    if (message.isMine) {
        return `Вы: ${message.text}`;
    }
    if (chat.isGroup && message.authorName) {
        return `${message.authorName}: ${message.text}`;
    }
    return message.text;
}

// Клиентский компонент, потому что подсветка открытого чата зависит от адреса,
// а список живёт в layout и не перерисовывается сервером при переходе между чатами
export default function ChatList({chats}: Readonly<{ chats: ChatPreview[] }>) {
    const {chatId} = useParams<{ chatId?: string }>();

    return (
        <ul className={'chat-list'}>
            {chats.map((chat) => {
                const isActive = chat.id === chatId;
                // У открытого чата счётчик не показываем: человек и так видит эти сообщения
                const unreadCount = isActive ? 0 : chat.unreadCount;

                return (
                    <li key={chat.id}>
                        <Link
                            href={`/chats/${chat.id}`}
                            className={clsx('chat-list__item', isActive && 'chat-list__item_active')}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <Avatar avatar={chat.avatar} size={'l'}/>
                            <span className={'chat-list__body'}>
                                <span className={'chat-list__row'}>
                                    <b className={'chat-list__title'}>{chat.title}</b>
                                    {chat.lastMessage && (
                                        // Время форматируется в часовом поясе того, кто рендерит: сервер и браузер
                                        // могут разойтись — браузерный вариант верный, поэтому расхождение не считаем ошибкой
                                        <span className={'chat-list__time'} suppressHydrationWarning>
                                            {formatChatTime(chat.lastMessage.sentAt)}
                                        </span>
                                    )}
                                </span>
                                <span className={'chat-list__row'}>
                                    <span className={'chat-list__preview'}>{getPreviewText(chat)}</span>
                                    {unreadCount > 0 && (
                                        <span className={'chat-list__unread'} aria-label={`${unreadCount} непрочитанных`}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </span>
                            </span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
