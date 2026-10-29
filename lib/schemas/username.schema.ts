import {z} from 'zod';

// Те же правила, что у плагина username в Better Auth по умолчанию: от 3 до 30 символов, латиница, цифры, _ и точка.
// Записаны без ^ и $: в таком виде строку принимает атрибут pattern у input, а схема ниже добавляет их сама
export const USERNAME_PATTERN = '[a-z0-9_.]{3,30}';

export const USERNAME_RULES = 'Латиница, цифры, _ и точка, от 3 до 30 символов';
export const USERNAME_FORMAT_ERROR = 'От 3 до 30 символов: латиница, цифры, _ и точка';

export const usernameSchema = z.string()
    .trim()
    .toLowerCase()
    .min(1, 'Введите ник')
    .regex(new RegExp(`^${USERNAME_PATTERN}$`), USERNAME_FORMAT_ERROR);
