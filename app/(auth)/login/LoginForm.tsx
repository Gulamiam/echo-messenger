'use client';
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import EmailInput from "@/components/EmailInput/EmailInput";
import PasswordInput from "@/components/PasswordInput/PasswordInput";
import {LoginData, loginSchema} from "@/lib/schemas/login.schema";

const defaultValues: LoginData = {
    email: '',
    password: '',
};

// Заглушка: здесь будет вызов authClient.signIn.email
async function signIn(data: LoginData) {
    console.log('signIn', data.email);
}

export default function LoginForm() {
    // Проверка — при отправке, а после первой неудачной отправки — на каждый ввод,
    // поэтому ошибка пропадает, как только поле исправили
    const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        defaultValues,
    });

    // noValidate: при отправке проверяет схема, а не браузер, — иначе ошибки показывались бы дважды
    return (
        <form className={'login__form'} noValidate onSubmit={handleSubmit(signIn)}>
            <EmailInput
                className={'login__email'}
                label={'Электронная почта'}
                placeholder={'you@example.com'}
                error={errors.email?.message}
                {...register('email')}
            />
            <PasswordInput
                className={'login__password'}
                label={'Пароль'}
                error={errors.password?.message}
                {...register('password')}
            />
            {/* Пока ждём ответ, кнопка неактивна — чтобы повторное нажатие не отправило запрос ещё раз */}
            <button type='submit' className={'echo-button size_l tertiary'} disabled={isSubmitting}>Войти</button>
        </form>
    );
}
