// components/ScrollArea.tsx
'use client';
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react';
import 'overlayscrollbars/overlayscrollbars.css';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import React, {useEffect, useRef} from 'react';

// Переход к якорю — по времени с разгоном и торможением: у lerp старт резкий
// и долгий «хвост» в конце. Когда заданы duration и easing, Lenis берёт их вместо lerp
const anchorScrollOptions = {
    duration: 1.2, // секунды
    // easeInOutSine: разгон и торможение мягче, чем у cubic, и нет резкого рывка в середине пути
    easing: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
};

export function ScrollArea({children, className}: Readonly<{
    children: React.ReactNode;
    className?: string;
}>) {
    const contentRef = useRef<HTMLDivElement>(null);
    const lenisRef = useRef<Lenis | null>(null);

    // Уничтожаем Lenis при размонтировании
    useEffect(() => () => lenisRef.current?.destroy(), []);

    return (
        <OverlayScrollbarsComponent
            className={className}
            options={{scrollbars: {theme: 'os-theme-echo', autoHide: 'leave'}}}
            events={{
                // Lenis вешаем на viewport, который создаёт OverlayScrollbars
                initialized: (instance) => {
                    lenisRef.current?.destroy();
                    lenisRef.current = new Lenis({
                        respectReducedMotion: true,
                        wrapper: instance.elements().viewport,
                        content: contentRef.current!,
                        lerp: 0.1,       // меньше — плавнее и «дольше»
                        anchors: anchorScrollOptions, // плавный переход по ссылкам #features и т.п.
                        autoRaf: true,
                    });

                    // Браузер прокручивает к #якорю из адреса ещё до того, как появился вьюпорт
                    // OverlayScrollbars, поэтому после инициализации плавно доводим до якоря сами
                    const anchorId = decodeURIComponent(window.location.hash.slice(1));
                    const anchorTarget = anchorId && document.getElementById(anchorId);
                    if (anchorTarget) {
                        lenisRef.current.scrollTo(anchorTarget, anchorScrollOptions);
                    }
                },
                destroyed: () => {
                    lenisRef.current?.destroy();
                    lenisRef.current = null;
                },
            }}
            defer
        >
            <div ref={contentRef} className={'scroll-area__content'}>
                {children}
            </div>
        </OverlayScrollbarsComponent>
    );
}
