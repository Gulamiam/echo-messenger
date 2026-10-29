// proxy.ts — в корне проекта, рядом с app/
import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const hasSession = Boolean(getSessionCookie(request));
    const isLoginPage = pathname.startsWith('/login');
    const isRegisterPage = pathname.startsWith('/register');

    // Не вошёл и идёт в закрытый раздел → на вход, с возвратом туда, куда шёл
    if (!hasSession && !isLoginPage && !isRegisterPage) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname + search);
        return NextResponse.redirect(loginUrl);
    }

    // Уже вошёл, а открывает /login → сразу в чаты
    if (hasSession && (isLoginPage || isRegisterPage)) {
        return NextResponse.redirect(new URL('/chats', request.url));
    }

    return NextResponse.next(); // пропустить запрос дальше
}

// Next читает config сам: proxy вызывается только для этих адресов,
// остальные (лендинг, приглашения, API, статика) открыты без сессии
// noinspection JSUnusedGlobalSymbols
export const config = {
    matcher: ['/chats/:path*', '/settings/:path*', '/onboarding', '/login/:path*', '/register/:path*'],
};