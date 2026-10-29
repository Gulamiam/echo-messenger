'use client';
import React, {useState} from "react";
import clsx from "clsx";
import '@/lib/icons.scss'
import './MessageInput.scss'

// Поле ввода сообщения. Само ничего не отправляет: отдаёт текст в onSend, а что с ним делать — решает лента.
// После отправки поле сразу очищается — не ждём ответа сервера, статус покажет само сообщение в ленте
export default function MessageInput({onSend, placeholder = 'Сообщение'}: Readonly<{
    onSend: (text: string) => void;
    placeholder?: string;
}>) {
    const [draft, setDraft] = useState('');
    const hasText = draft.trim().length > 0;

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!hasText) {
            return;
        }
        onSend(draft.trim());
        setDraft('');
    }

    return (
        <form className={'message-input'} onSubmit={handleSubmit}>
            <div className={'message-input__field'}>
                <input
                    className={'message-input__text'}
                    aria-label={'Сообщение'}
                    placeholder={placeholder}
                    autoComplete={'off'}
                    maxLength={4000}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                />
                <button
                    type={'submit'}
                    className={clsx('message-input__send', hasText && 'message-input__send_active')}
                    aria-label={'Отправить'}
                    disabled={!hasText}
                >
                    <span className={'ico-send'}/>
                </button>
            </div>
        </form>
    );
}
