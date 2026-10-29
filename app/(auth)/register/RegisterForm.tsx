'use client';
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import TextField from "@/components/TextField/TextField";
import UsernameInput from "@/components/UsernameInput/UsernameInput";
import EmailInput from "@/components/EmailInput/EmailInput";
import PasswordInput from "@/components/PasswordInput/PasswordInput";
import {RegisterData, registerSchema} from "@/lib/schemas/register.schema";
import {authClient} from "@/lib/auth-client";

const defaultValues: RegisterData = {
    name: '',
    username: '',
    email: '',
    password: '',
};

// Отправляет POST /api/auth/sign-up/email. Better Auth создаёт пользователя, хеширует пароль
// и сразу открывает сессию: в ответ браузер получает cookie, по которой proxy.ts пускает в /chats.
// При ошибке исключения нет — она приходит в поле error ответа
async function signUp(data: RegisterData) {
    const {data: result, error} = await authClient.signUp.email({
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
    });

    if (error) {
        console.error('Регистрация не удалась', error);
        return;
    }
    console.log('Зарегистрирован', result.user);
}

export default function RegisterForm() {
    // Проверка — при отправке, а после первой неудачной отправки — на каждый ввод,
    // поэтому ошибка пропадает, как только поле исправили
    const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
        defaultValues,
    });

    // noValidate: при отправке проверяет схема, а не браузер, — иначе ошибки показывались бы дважды
    return (
        <form className={'login__form'} noValidate onSubmit={handleSubmit(signUp)}>
            <TextField
                label={'Имя'}
                placeholder={'Как к вам обращаться'}
                autoComplete={'name'}
                error={errors.name?.message}
                {...register('name')}
            />
            <UsernameInput
                label={'Ник'}
                placeholder={'nickname'}
                error={errors.username?.message}
                {...register('username')}
            />
            <EmailInput
                label={'Электронная почта'}
                placeholder={'you@example.com'}
                error={errors.email?.message}
                {...register('email')}
            />
            <PasswordInput
                label={'Пароль'}
                hint={'Минимум 8 символов'}
                // new-password: менеджер паролей предложит сгенерировать надёжный пароль и сохранит его
                autoComplete={'new-password'}
                error={errors.password?.message}
                {...register('password')}
            />
            {/* Пока ждём ответ, кнопка неактивна — чтобы повторное нажатие не отправило запрос ещё раз */}
            <button type='submit' className={'echo-button size_l tertiary'} disabled={isSubmitting}>Создать аккаунт</button>
        </form>
    );
}
