import React from "react";
import './EmptyState.scss'

// Пустой экран: нет чатов, чат не выбран, в чате нет сообщений. children — кнопки под текстом
export default function EmptyState({title, text, children}: Readonly<{
    title: string;
    text: string;
    children?: React.ReactNode;
}>) {
    return (
        <div className={'empty-state'}>
            <svg className={'empty-state__picture'} width="104" height="104" viewBox="0 0 104 104" aria-hidden={true}>
                <rect className={'empty-state__bubble'} x="10" y="22" width="60" height="44" rx="18"/>
                <path className={'empty-state__bubble'} d="M24 66l-6 14 18-14"/>
                <path className={'empty-state__wave'} d="M78 36a14 14 0 0 1 0 22"/>
                <path className={'empty-state__wave empty-state__wave_far'} d="M86 28a26 26 0 0 1 0 38"/>
            </svg>
            <h2 className={'empty-state__title'}>{title}</h2>
            <p className={'empty-state__text'}>{text}</p>
            {children && <div className={'empty-state__actions'}>{children}</div>}
        </div>
    );
}
