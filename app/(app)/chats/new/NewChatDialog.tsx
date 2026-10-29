'use client';
import React, {startTransition, useActionState, useEffect, useRef, useState, useTransition} from "react";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import clsx from "clsx";
import Avatar from "@/components/Avatar/Avatar";
import TextField from "@/components/TextField/TextField";
import {ScrollArea} from "@/components/ScrollArea";
import {Person} from "@/lib/types/types";
import {createChat, NewChatState} from "./actions";
import './NewChatDialog.scss'

// Пауза после последней буквы, прежде чем искать: не дёргаем сервер на каждое нажатие
const SEARCH_DELAY_MS = 300;

function getHint(selectedCount: number): string {
    if (selectedCount === 0) {
        return 'Выберите одного человека или нескольких';
    }
    if (selectedCount === 1) {
        return 'Откроется личный чат';
    }
    return `Выбрано: ${selectedCount}`;
}

// modal — окно поверх чатов (переход по «+» внутри приложения), page — то же окно отдельной страницей
// (адрес /chats/new открыли напрямую). Результаты поиска приходят с сервера в people:
// мы только меняем ?q= в адресе, а страница отрисовывается заново с новым списком
export default function NewChatDialog({people, query, variant}: Readonly<{
    people: Person[];
    query: string;
    variant: 'modal' | 'page';
}>) {
    const router = useRouter();
    const pathname = usePathname();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const [search, setSearch] = useState(query);
    const [isSearching, startSearch] = useTransition();
    // Выбранных храним целиком, а не по id: человек остаётся в «чипах», даже если пропал из результатов нового поиска
    const [selected, setSelected] = useState<Person[]>([]);
    const [state, formAction, isCreating] = useActionState<NewChatState, FormData>(createChat, {});

    // showModal, а не просто open: браузер сам держит фокус внутри окна, закрывает его по Esc и затемняет фон.
    // Фокус в поиск ставим после showModal: иначе браузер переведёт его на первую кнопку — «Закрыть»
    useEffect(() => {
        const dialog = dialogRef.current;
        if (variant === 'modal' && dialog && !dialog.open) {
            dialog.showModal();
        }
        searchRef.current?.focus();

        // Next не удаляет окно после закрытия, а прячет его (React Activity), чтобы вернуть при повторном открытии.
        // Прячем — закрываем по-настоящему, иначе при следующем showModal браузер выдал бы ошибку «уже открыто»
        return () => dialog?.close();
    }, [variant]);

    useEffect(() => {
        if (search === query) {
            return;
        }
        const timer = setTimeout(() => {
            const url = search ? `${pathname}?q=${encodeURIComponent(search)}` : pathname;
            // replace, а не push: каждая буква не должна становиться шагом истории для кнопки «Назад»
            startSearch(() => router.replace(url, {scroll: false}));
        }, SEARCH_DELAY_MS);
        return () => clearTimeout(timer);
    }, [search, query, pathname, router]);

    // В окне «закрыть» — вернуться туда, откуда открыли. На отдельной странице возвращаться некуда — идём к чатам
    function close() {
        if (variant === 'modal') {
            router.back();
        } else {
            router.push('/chats');
        }
    }

    function toggle(person: Person) {
        setSelected((current) => current.some((item) => item.id === person.id)
            ? current.filter((item) => item.id !== person.id)
            : [...current, person]);
    }

    // Отправляем через onSubmit, а не <form action>: после action React 19 сбрасывает форму —
    // снялись бы отметки у выбранных людей и стёрлось бы название группы, даже если сервер вернул ошибку
    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => formAction(formData));
    }

    const isGroup = selected.length > 1;

    const content = (
        <form className={'new-chat__body'} onSubmit={handleSubmit}>
            <header className={'new-chat__header'}>
                <h1 id={'new-chat-title'} className={'new-chat__title'}>Новый чат</h1>
                {variant === 'modal'
                    ? (
                        <button type={'button'} className={'new-chat__close'} aria-label={'Закрыть'} onClick={close}>
                            <span className={'ico-close'}/>
                        </button>
                    )
                    : (
                        <Link href={'/chats'} className={'new-chat__close'} aria-label={'Закрыть'}>
                            <span className={'ico-close'}/>
                        </Link>
                    )}
            </header>

            <div className={'new-chat__controls'}>
                <label className={'new-chat__search'}>
                    <span className={'ico-search'}/>
                    <span className={'new-chat__visually-hidden'}>Найти по имени или @нику</span>
                    <input
                        ref={searchRef}
                        type={'search'}
                        className={'new-chat__search-input'}
                        placeholder={'Имя или @ник'}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        // Поле поиска внутри формы: без этого Enter отправил бы её и создал чат раньше времени
                        onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()}
                    />
                </label>

                {selected.length > 0 && (
                    <div className={'new-chat__chips'}>
                        {selected.map((person) => (
                            <button
                                key={person.id}
                                type={'button'}
                                className={'new-chat__chip'}
                                aria-label={`Убрать ${person.name}`}
                                onClick={() => toggle(person)}
                            >
                                <Avatar avatar={person.avatar} size={'s'}/>
                                {person.name.split(' ')[0]}
                                <span className={'ico-close'}/>
                            </button>
                        ))}
                    </div>
                )}

                {isGroup && (
                    <TextField
                        name={'title'}
                        label={'Название группы'}
                        placeholder={'Например, «Поход в горы»'}
                        maxLength={60}
                        error={state.titleError}
                    />
                )}
            </div>

            <div className={'new-chat__section-title'}>Люди</div>
            <ScrollArea className={'new-chat__list'}>
                {people.length === 0
                    ? <p className={'new-chat__empty'}>Никого не нашли по запросу «{query}»</p>
                    : (
                        <ul className={clsx('new-chat__people', isSearching && 'new-chat__people_loading')}>
                            {people.map((person) => (
                                <li key={person.id}>
                                    <label className={'new-chat__person'}>
                                        <Avatar avatar={person.avatar}/>
                                        <span className={'new-chat__person-info'}>
                                            <b className={'new-chat__person-name'}>{person.name}</b>
                                            <span className={'new-chat__person-nick'}>
                                                {person.isBot ? 'бот' : `@${person.username}`}
                                            </span>
                                        </span>
                                        <input
                                            type={'checkbox'}
                                            className={'new-chat__checkbox'}
                                            checked={selected.some((item) => item.id === person.id)}
                                            onChange={() => toggle(person)}
                                        />
                                    </label>
                                </li>
                            ))}
                        </ul>
                    )}
            </ScrollArea>

            {/* Выбор хранится в состоянии компонента, а Server Action получает его из формы — скрытыми полями */}
            {selected.map((person) => <input key={person.id} type={'hidden'} name={'memberIds'} value={person.id}/>)}

            <footer className={'new-chat__footer'}>
                <span className={clsx('new-chat__hint', state.formError && 'new-chat__hint_error')} role={'status'}>
                    {state.formError ?? getHint(selected.length)}
                </span>
                <button
                    type={'submit'}
                    className={'echo-button primary'}
                    disabled={selected.length === 0 || isCreating}
                >
                    {isGroup ? 'Создать группу' : 'Написать'}
                </button>
            </footer>
        </form>
    );

    if (variant === 'page') {
        return <section className={'new-chat new-chat_page'} aria-labelledby={'new-chat-title'}>{content}</section>;
    }

    return (
        <dialog
            ref={dialogRef}
            className={'new-chat new-chat_modal'}
            aria-labelledby={'new-chat-title'}
            // Esc: браузер сам закрыл бы окно, но адрес остался бы /chats/new — закрываем через router.back
            onCancel={(event) => {
                event.preventDefault();
                close();
            }}
            // Клик мимо окна попадает в сам <dialog> (его затемнённый фон), клик внутри — в его содержимое
            onClick={(event: React.MouseEvent<HTMLDialogElement>) => {
                if (event.target === dialogRef.current) {
                    close();
                }
            }}
        >
            {content}
        </dialog>
    );
}
