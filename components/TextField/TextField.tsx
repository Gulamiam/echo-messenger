import {ComponentProps, ReactNode, useId} from "react";
import clsx from "clsx";
import './TextField.scss'

type TextFieldProps = ComponentProps<'input'> & {
    // Подпись необязательна: без неё полю нужен aria-label, иначе скринридер не поймёт, что вводить
    label?: string;
    error?: string;
    // Подсказка под полем, например правила формата. Пока есть ошибка, вместо подсказки показывается она
    hint?: string;
    // Префикс у левого края поля, например «@» у ника
    startSlot?: ReactNode;
    // Кнопка или иконка у правого края поля, например «показать пароль»
    endSlot?: ReactNode;
};

export default function TextField({label, error, hint, startSlot, endSlot, className, ...inputProps}: Readonly<TextFieldProps>) {
    const id = useId();
    const messageId = `${id}-message`;
    const message = error ?? hint;

    return (
        <div className={clsx(
            'text-field',
            error && 'text-field_error',
            startSlot && 'text-field_with-start',
            endSlot && 'text-field_with-end',
            className,
        )}>
            {label && <label htmlFor={id} className={'text-field__label'}>{label}</label>}
            <div className={'text-field__control'}>
                <input
                    id={id}
                    className={'text-field__input'}
                    aria-invalid={Boolean(error)}
                    aria-describedby={message ? messageId : undefined}
                    {...inputProps}
                />
                {startSlot && <div className={'text-field__start'}>{startSlot}</div>}
                {endSlot && <div className={'text-field__end'}>{endSlot}</div>}
            </div>
            {message && (
                <div id={messageId} className={clsx(error ? 'text-field__error' : 'text-field__hint')}>{message}</div>
            )}
        </div>
    );
}
