import {MessageModel} from "@/lib/models/message.model";
import clsx from "clsx";
import './MessageBubble.scss'

export default function MessageBubble({ message }: Readonly<{ message: MessageModel }>){
    return (
        <div className={clsx('message', message.isMine && 'message_mine')}>
            <div style={{color: message.author.color || 'var(--color-ink)'}} className={'message__name'}>{message.author.name}</div>
            <div className={'message__text'}>{message.text}</div>
        </div>
    );
}