import {Suspense} from "react";
import NewChatContent, {NewChatSearchParams} from "./NewChatContent";

// /chats/new, открытый напрямую (по ссылке или после обновления страницы): окно стоит на месте переписки.
// При переходе по «+» внутри приложения вместо этой страницы показывается @modal/(.)new
export default function NewChatPage({searchParams}: Readonly<{ searchParams: NewChatSearchParams }>) {
    return (
        <Suspense>
            <NewChatContent searchParams={searchParams} variant={'page'}/>
        </Suspense>
    );
}
