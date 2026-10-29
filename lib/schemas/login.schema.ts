import {z} from 'zod';
import {emailSchema} from './email.schema';

export const loginSchema = z.object({
    email: emailSchema,
    // При входе длину не проверяем: если требования к паролю ужесточат, старые пароли должны работать
    password: z.string().min(1, 'Введите пароль'),
});

export type LoginData = z.infer<typeof loginSchema>;
