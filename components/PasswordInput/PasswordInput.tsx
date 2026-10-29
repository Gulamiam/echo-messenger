'use client';
import {ComponentProps, useState} from "react";
import clsx from "clsx";
import TextField from "@/components/TextField/TextField";
import '@/lib/icons.scss'
import './PasswordInput.scss'

type PasswordInputProps = Omit<ComponentProps<typeof TextField>, 'type' | 'endSlot'>;

// autoComplete по умолчанию — current-password (вход). Для регистрации и смены пароля
// передайте autoComplete="new-password": тогда менеджер паролей предложит сгенерировать новый
export default function PasswordInput(props: Readonly<PasswordInputProps>) {
    const [isVisible, setIsVisible] = useState(false);

    const toggleButton = (
        <button
            type="button"
            className={'password-input__toggle'}
            aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
            aria-pressed={isVisible}
            onClick={() => setIsVisible(!isVisible)}
        >
            <span className={isVisible ? 'ico-eye-off' : 'ico-eye'}/>
        </button>
    );

    return (
        <TextField
            name="password"
            autoComplete="current-password"
            autoCapitalize="off"
            spellCheck={false}
            {...props}
            className={clsx('password-input', props.className)}
            type={isVisible ? 'text' : 'password'}
            endSlot={toggleButton}
        />
    );
}
