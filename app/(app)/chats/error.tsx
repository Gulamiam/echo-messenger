'use client';
import ErrorState from "@/components/ErrorState/ErrorState";

// Ошибка правой части, когда чат не выбран (страница /chats)
export default function ChatsError({reset}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
    return (
        <ErrorState
            title={'Не удалось загрузить'}
            text={'Попробуйте ещё раз через пару секунд.'}
            reset={reset}
        />
    );
}
