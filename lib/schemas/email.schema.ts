import {z} from 'zod';

// Тексты ошибок совпадают с EmailInput: он подсказывает при уходе из поля, схема — при отправке
export const emailSchema = z.string()
    .trim()
    .min(1, 'Введите почту')
    .pipe(z.email('Проверьте адрес — похоже, в нём опечатка'));
