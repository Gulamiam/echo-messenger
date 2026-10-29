'use client';
import ErrorState from "@/components/ErrorState/ErrorState";

// Ошибка при загрузке переписки. Список чатов слева остаётся рабочим: он в layout, выше этой границы
export default function ChatError({reset}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
    return (
        <ErrorState
            title={'Не удалось загрузить чат'}
            text={'Сообщения никуда не делись. Попробуйте ещё раз через пару секунд.'}
            reset={reset}
        />
    );
}
