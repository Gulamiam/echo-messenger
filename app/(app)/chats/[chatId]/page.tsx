import {notFound} from "next/navigation";
import Avatar from "@/components/Avatar/Avatar";
import {getCurrentUser} from "@/lib/session";
import {getChat, getMessages} from "@/lib/data/chats";
import {getAvatar} from "@/lib/avatar";
import ChatFeed from "./ChatFeed";
import './page.module.scss'

export default async function ChatPage({params}: PageProps<'/chats/[chatId]'>) {
    const {chatId} = await params;
    const user = await getCurrentUser();

    const chat = await getChat(chatId, user.id);
    if (!chat) {
        notFound();
    }
    const messages = await getMessages(chatId, user.id);

    // Автор своих сообщений, которые лента покажет сразу, ещё до ответа сервера
    const me = {id: user.id, name: user.name, color: getAvatar(user.id, user.name, null).nameColor};

    return (
        <section className={'conversation'}>
            <header className={'conversation__header'}>
                <Avatar avatar={chat.avatar}/>
                <div className={'conversation__info'}>
                    <h1 className={'conversation__title'}>{chat.title}</h1>
                    <p className={'conversation__subtitle'}>{chat.subtitle}</p>
                </div>
            </header>

            <ChatFeed chatId={chat.id} messages={messages} isGroup={chat.isGroup} me={me}/>
        </section>
    );
}
