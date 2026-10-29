'use client';
import {useTransition} from "react";
import {useRouter} from "next/navigation";
import './ErrorState.scss'

// Экран ошибки загрузки для error.tsx. reset сам по себе только перерисовывает сегмент со старыми данными,
// поэтому сначала просим сервер отрендерить страницу заново (router.refresh), а потом сбрасываем ошибку
export default function ErrorState({title, text, reset}: Readonly<{
    title: string;
    text: string;
    reset: () => void;
}>) {
    const router = useRouter();
    const [isRetrying, startTransition] = useTransition();

    function retry() {
        startTransition(() => {
            router.refresh();
            reset();
        });
    }

    return (
        <div className={'error-state'} role={'alert'}>
            <h2 className={'error-state__title'}>{title}</h2>
            <p className={'error-state__text'}>{text}</p>
            <button type={'button'} className={'echo-button primary'} onClick={retry} disabled={isRetrying}>
                {isRetrying ? 'Загружаем…' : 'Повторить'}
            </button>
        </div>
    );
}
