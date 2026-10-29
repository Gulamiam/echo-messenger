import {Suspense} from "react";
import NewChatContent, {NewChatSearchParams} from "../../new/NewChatContent";

// Перехватывающий маршрут: (.)new ловит переход на /chats/new внутри приложения и показывает окно
// поверх открытого чата, не уводя с него. Адрес при этом всё равно /chats/new
export default function NewChatModal({searchParams}: Readonly<{ searchParams: NewChatSearchParams }>) {
    return (
        <Suspense>
            <NewChatContent searchParams={searchParams} variant={'modal'}/>
        </Suspense>
    );
}
