import {z} from 'zod';
import {emailSchema} from './email.schema';
import {usernameSchema} from './username.schema';

export const registerSchema = z.object({
    name: z.string().trim().min(1, 'Укажите имя'),
    username: usernameSchema,
    email: emailSchema,
    // Те же границы, что у Better Auth по умолчанию (minPasswordLength и maxPasswordLength):
    // иначе форма пропустит пароль, который отклонит сервер
    password: z.string()
        .min(8, 'Пароль должен быть не короче 8 символов')
        .max(128, 'Пароль должен быть не длиннее 128 символов'),
});

export type RegisterData = z.infer<typeof registerSchema>;
