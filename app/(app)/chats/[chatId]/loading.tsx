import clsx from "clsx";
import './page.module.scss'

// Ширины пузырей разные, чтобы скелетон был похож на переписку, а не на таблицу
const BUBBLES = [
    {width: '46%'},
    {width: '30%'},
    {width: '54%', isMine: true},
    {width: '38%', isTall: true},
    {width: '26%', isMine: true},
];

// Показывается, пока грузится страница чата. Список слева остаётся на месте: он в layout
export default function ChatLoading() {
    return (
        <section className={'conversation-skeleton'} aria-busy={true} aria-label={'Загружаем переписку'}>
            <div className={'conversation-skeleton__header'}>
                <span className={'conversation-skeleton__avatar'}/>
                <span className={'conversation-skeleton__lines'}>
                    <span className={'conversation-skeleton__line'}/>
                    <span className={'conversation-skeleton__line conversation-skeleton__line_short'}/>
                </span>
            </div>
            <div className={'conversation-skeleton__feed'}>
                {BUBBLES.map((bubble, index) => (
                    <span
                        key={index}
                        className={clsx(
                            'conversation-skeleton__bubble',
                            bubble.isMine && 'conversation-skeleton__bubble_mine',
                            bubble.isTall && 'conversation-skeleton__bubble_tall',
                        )}
                        style={{width: bubble.width}}
                    />
                ))}
            </div>
        </section>
    );
}
