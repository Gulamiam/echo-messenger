'use client';
import {ChangeEvent, ComponentProps, FocusEvent, SyntheticEvent, useState} from "react";
import TextField from "@/components/TextField/TextField";
import {USERNAME_FORMAT_ERROR, USERNAME_PATTERN, USERNAME_RULES} from "@/lib/schemas/username.schema";

type UsernameInputProps = Omit<ComponentProps<typeof TextField>, 'type' | 'startSlot' | 'hint'>;

function getFormatError(validity: ValidityState): string | undefined {
    if (validity.valueMissing) {
        return 'Введите ник';
    }
    if (validity.patternMismatch) {
        return USERNAME_FORMAT_ERROR;
    }
    return undefined;
}

// Ник хранится строчными, поэтому переводим его сразу при вводе — человек видит ник таким, каким его увидят другие.
// После замены value браузер переносит курсор в конец, так что возвращаем его на место
function toLowerCaseKeepingCaret(input: HTMLInputElement) {
    const lowered = input.value.toLowerCase();
    if (lowered === input.value) {
        return;
    }
    const {selectionStart, selectionEnd} = input;
    input.value = lowered;
    input.setSelectionRange(selectionStart, selectionEnd);
}

export default function UsernameInput({error, onBlur, onChange, onInvalid, ...props}: Readonly<UsernameInputProps>) {
    const [formatError, setFormatError] = useState<string>();

    // Не ругаемся на пустое поле, если по нему просто прошли табом: о пустом скажем при отправке
    function handleBlur(event: FocusEvent<HTMLInputElement>) {
        if (event.currentTarget.value) {
            setFormatError(getFormatError(event.currentTarget.validity));
        }
        onBlur?.(event);
    }

    // Пока ошибка на экране, проверяем на каждый ввод — чтобы она пропала, как только ник исправят
    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        toLowerCaseKeepingCaret(event.currentTarget);
        if (formatError) {
            setFormatError(getFormatError(event.currentTarget.validity));
        }
        onChange?.(event);
    }

    // Как в EmailInput: вместо системной подсказки браузера показываем свою ошибку и сами ставим фокус
    function handleInvalid(event: SyntheticEvent<HTMLInputElement>) {
        event.preventDefault();
        setFormatError(getFormatError(event.currentTarget.validity));
        event.currentTarget.focus();
        onInvalid?.(event);
    }

    return (
        <TextField
            type="text"
            name="username"
            autoComplete="username"
            autoCapitalize="off"
            spellCheck={false}
            required
            maxLength={30}
            pattern={USERNAME_PATTERN}
            {...props}
            startSlot={'@'}
            hint={USERNAME_RULES}
            // Ошибка с сервера важнее: формат может быть верным, а ник — уже занят
            error={error ?? formatError}
            onBlur={handleBlur}
            onChange={handleChange}
            onInvalid={handleInvalid}
        />
    );
}
