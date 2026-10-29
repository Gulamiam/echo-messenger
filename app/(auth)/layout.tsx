import {ReactNode} from "react";
import './layout.module.scss'
import '../../lib/icons.scss'

export default function LoginLayout({children}: Readonly<{ children: ReactNode }>) {
    return (
        <div className={'login'}>
            <aside className={'login__brand'}>
                <header>
                    <div className={'ico-ink-logo'}></div>
                    Эхо
                </header>
                <footer>Вас уже ждут в чатах</footer>
            </aside>
            <main className={'login__content'}>
                {children}
            </main>
        </div>
    );
}