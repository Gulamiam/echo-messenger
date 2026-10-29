import './layout.module.scss';
import {ScrollArea} from "@/components/ScrollArea";
export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <ScrollArea className={'marketing'}>
            <header className={'marketing__header header'}>
                <div className={'header__actions'}>
                    <div className={'header__logo'}>
                        <span className={'ico_marketing'}/>
                        <span>Эхо</span>
                    </div>
                    <nav aria-label={'Навигация по странице'}>
                        <a href="#features">Возможности</a>
                        <a href="#structure">Как устроено</a>
                    </nav>
                </div>

                <button className={'echo-button primary'}>Войти</button>
            </header>
            <div className={'content-box'}>
                { children }
            </div>
            <footer className={'marketing__footer footer'}>
                <span className={'footer__description'}>
                    <span className={'footer__echo'}>Эхо</span> — учебный проект на Next.js
                </span>
            </footer>
        </ScrollArea>
    )
}