import {getCurrentUser} from "@/lib/session";
import {searchPeople} from "@/lib/data/people";
import NewChatDialog from "./NewChatDialog";

export type NewChatSearchParams = Promise<{ q?: string | string[] }>;

// Общая часть страницы /chats/new и окна @modal/(.)new: читает ?q= и ищет людей на сервере
export default async function NewChatContent({searchParams, variant}: Readonly<{
    searchParams: NewChatSearchParams;
    variant: 'modal' | 'page';
}>) {
    const {q} = await searchParams;
    const query = typeof q === 'string' ? q : '';
    const user = await getCurrentUser();
    const people = await searchPeople(query, user.id);

    return <NewChatDialog people={people} query={query} variant={variant}/>;
}
