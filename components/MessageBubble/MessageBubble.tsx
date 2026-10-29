import {MessageModel} from "@/lib/models/message.model";
import clsx from "clsx";
import './MessageBubble.scss'

// showAuthor: имя над пузырём нужно только в группах и только у первого из подряд идущих сообщений одного автора
export default function MessageBubble({message, showAuthor = true}: Readonly<{ message: MessageModel; showAuthor?: boolean }>){
    return (
        <div className={clsx('message', message.isMine && 'message_mine')}>
            {showAuthor && (
                <div style={{color: message.author.color || 'var(--color-ink)'}} className={'message__name'}>{message.author.name}</div>
            )}
            <div className={'message__text'}>{message.text}</div>
        </div>
    );
}
