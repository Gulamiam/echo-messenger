import RegisterForm from "./RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
    return (
        <div className={'login__group'}>
            <div className={'login__header'}>
                <h1 className={'login__title'}>Регистрация</h1>
                <span className={'login__description'}>Пара полей — и можно писать друзьям.</span>
            </div>

            <RegisterForm/>

            <span className={'login__account'}>
                Уже есть аккаунт? <Link href={'/login'}>Войти</Link>
            </span>
        </div>
    )
}
