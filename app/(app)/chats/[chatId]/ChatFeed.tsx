'use client';
import {startTransition, useEffect, useRef, useState} from "react";
import clsx from "clsx";
import {ScrollArea} from "@/components/ScrollArea";
import MessageBubble from "@/components/MessageBubble/MessageBubble";
import MessageInput from "@/components/MessageInput/MessageInput";
import EmptyState from "@/components/EmptyState/EmptyState";
import {MessageModel} from "@/lib/models/message.model";
import {ChatId} from "@/lib/types/types";
import {sendMessage} from "./actions";

type Author = MessageModel['author'];

// Лента и поле ввода. messages — сохранённые сообщения с сервера, pending — свои, которые ещё в пути или не ушли.
// Своё сообщение показываем сразу («отправляется…»), не дожидаясь сервера: так чат ощущается мгновенным
export default function ChatFeed({chatId, messages, isGroup, me}: Readonly<{
    chatId: ChatId;
    messages: MessageModel[];
    isGroup: boolean;
    me: Author;
}>) {
    const [pending, setPending] = useState<MessageModel[]>([]);
    const endRef = useRef<HTMLDivElement>(null);

    // Сохранённая копия может прийти с сервера раньше, чем мы уберём сообщение из pending, —
    // по clientId узнаём её и не показываем сообщение дважды
    const visiblePending = pending.filter((draft) => !messages.some((message) => message.clientId === draft.clientId));
    const allMessages = [...messages, ...visiblePending];

    // Новое сообщение — прокручиваем к нему, иначе своё сообщение могло бы оказаться ниже видимой части
    useEffect(() => {
        endRef.current?.scrollIntoView({block: 'end'});
    }, [allMessages.length]);

    function deliver(draft: MessageModel) {
        startTransition(async () => {
            let isDelivered: boolean;
            try {
                isDelivered = (await sendMessage(chatId, draft.text ?? '', draft.clientId ?? '')).ok;
            } catch {
                // Сервер не ответил (например, пропала сеть) — для человека это то же «не отправлено»
                isDelivered = false;
            }
            // После await обновление состояния снова оборачиваем в startTransition — так требует React
            startTransition(() => setPending((current) => isDelivered
                ? current.filter((item) => item.clientId !== draft.clientId)
                : current.map((item) => item.clientId === draft.clientId ? {...item, status: 'failed'} : item)));
        });
    }

    function send(text: string) {
        const clientId = crypto.randomUUID();
        const draft: MessageModel = {
            id: clientId,
            clientId,
            text,
            sentAt: new Date().toISOString(),
            author: me,
            isMine: true,
            status: 'sending',
        };
        setPending((current) => [...current, draft]);
        deliver(draft);
    }

    // Повтор с тем же clientId: если первая попытка всё-таки дошла до базы, второй копии не будет
    function retry(draft: MessageModel) {
        setPending((current) => current.map((item) => item.clientId === draft.clientId ? {...item, status: 'sending'} : item));
        deliver(draft);
    }

    return (
        <>
            {allMessages.length === 0
                ? <EmptyState title={'Пока тихо'} text={'Напишите первое сообщение — собеседник увидит его сразу.'}/>
                : (
                    <ScrollArea className={'conversation__feed'} startAtEnd>
                        <div className={'conversation__messages'} role={'log'} aria-label={'Сообщения'}>
                            {allMessages.map((message, index) => {
                                const previous = allMessages[index - 1];
                                const showAuthor = isGroup && !message.isMine && previous?.author.id !== message.author.id;
                                return (
                                    <div
                                        key={message.clientId ?? message.id}
                                        className={clsx('conversation__item', message.isMine && 'conversation__item_mine')}
                                    >
                                        <MessageBubble message={message} showAuthor={showAuthor}/>
                                        {message.status === 'sending' && (
                                            <span className={'conversation__status'}>отправляется…</span>
                                        )}
                                        {message.status === 'failed' && (
                                            <button
                                                type={'button'}
                                                className={'conversation__status conversation__status_failed'}
                                                onClick={() => retry(message)}
                                            >
                                                Не отправлено. Повторить
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={endRef}/>
                        </div>
                    </ScrollArea>
                )}

            <MessageInput onSend={send}/>
        </>
    );
}
