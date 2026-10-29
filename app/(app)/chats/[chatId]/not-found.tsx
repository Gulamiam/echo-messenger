import Link from "next/link";
import './page.module.scss'

// Показывается, когда page.tsx вызвал notFound(): чата нет или пользователь в нём не состоит
export default function ChatNotFound() {
    return (
        <section className={'chat-not-found'}>
            <span className={'chat-not-found__code'} aria-hidden={true}>4<span>0</span>4</span>
            <h1 className={'chat-not-found__title'}>Чат не найден</h1>
            <p className={'chat-not-found__text'}>Возможно, вас удалили из группы или приглашение больше не действует.</p>
            <Link href={'/chats'} className={'chat-not-found__link'}>К списку чатов</Link>
        </section>
    );
}
