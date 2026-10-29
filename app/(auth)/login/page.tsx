import LoginForm from "./LoginForm";
import Link from "next/link";

export default function LoginPage() {
    return (
        <div className={'login__group'}>
            <div className={'login__header'}>
                <h1 className={'login__title'}>Вход</h1>
                <span className={'login__description'}>С возвращением! Введите почту и пароль.</span>
            </div>

            <LoginForm/>

            <span className={'login__account'}>
                Нет аккаунта? <Link href={'/register'}>Зарегистрироваться</Link>
            </span>
        </div>
    )
}