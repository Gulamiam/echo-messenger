'use client';
import {ChangeEvent, ComponentProps, FocusEvent, SyntheticEvent, useState} from "react";
import TextField from "@/components/TextField/TextField";

type EmailInputProps = Omit<ComponentProps<typeof TextField>, 'type'>;

// Браузер по стандарту HTML пропускает адреса без точки в домене (ivan@mail),
// поэтому точку требуем отдельно. Это подсказка человеку об опечатке, а не защита:
// запрос можно отправить в обход формы, так что формат ещё раз проверяет сервер
const EMAIL_PATTERN = String.raw`[^@\s]+@[^@\s]+\.[^@\s]+`;

function getFormatError(validity: ValidityState): string | undefined {
    if (validity.valueMissing) {
        return 'Введите почту';
    }
    if (validity.typeMismatch || validity.patternMismatch) {
        return 'Проверьте адрес — похоже, в нём опечатка';
    }
    return undefined;
}

export default function EmailInput({error, onBlur, onChange, onInvalid, ...props}: Readonly<EmailInputProps>) {
    const [formatError, setFormatError] = useState<string>();

    // Не ругаемся на пустое поле, если по нему просто прошли табом: о пустом скажем при отправке
    function handleBlur(event: FocusEvent<HTMLInputElement>) {
        if (event.currentTarget.value) {
            setFormatError(getFormatError(event.currentTarget.validity));
        }
        onBlur?.(event);
    }

    // Пока ошибка на экране, проверяем на каждый ввод — чтобы она пропала, как только адрес исправят
    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        if (formatError) {
            setFormatError(getFormatError(event.currentTarget.validity));
        }
        onChange?.(event);
    }

    // Браузер вызывает invalid при отправке формы и сам её не отправит.
    // preventDefault убирает системную подсказку — вместо неё показываем свою ошибку,
    // но тогда и фокус браузер не переводит, поэтому ставим его сами
    function handleInvalid(event: SyntheticEvent<HTMLInputElement>) {
        event.preventDefault();
        setFormatError(getFormatError(event.currentTarget.validity));
        event.currentTarget.focus();
        onInvalid?.(event);
    }

    return (
        <TextField
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            required
            pattern={EMAIL_PATTERN}
            {...props}
            // Ошибка с сервера важнее: формат может быть верным, а адрес — отклонён
            error={error ?? formatError}
            onBlur={handleBlur}
            onChange={handleChange}
            onInvalid={handleInvalid}
        />
    );
}
