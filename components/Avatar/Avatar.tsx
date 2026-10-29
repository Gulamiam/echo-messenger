import clsx from "clsx";
import {Avatar as AvatarData} from "@/lib/types/types";
import './Avatar.scss'

type AvatarSize = 's' | 'm' | 'l';

// Пока показываем только инициалы: загрузки фото профиля ещё нет, поле image всегда null.
// aria-hidden: рядом с аватаром всегда есть имя, читать инициалы скринридеру незачем
export default function Avatar({avatar, size = 'm'}: Readonly<{ avatar: AvatarData; size?: AvatarSize }>) {
    return (
        <span
            className={clsx('avatar', `avatar_size_${size}`)}
            style={{background: avatar.color, color: avatar.textColor}}
            aria-hidden={true}
        >
            {avatar.initials}
        </span>
    );
}
