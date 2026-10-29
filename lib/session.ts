import {cache} from "react";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {auth} from "@/auth";

// Текущий пользователь для серверных компонентов. proxy.ts уже не пускает без cookie сессии,
// но cookie может быть просроченной — тогда отправляем на вход.
// cache: layout и страница в одном запросе спрашивают сессию у базы один раз
export const getCurrentUser = cache(async () => {
    const session = await auth.api.getSession({headers: await headers()});
    if (!session) {
        redirect('/login');
    }
    return session.user;
});
