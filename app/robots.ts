import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    if (process.env.VERCEL_ENV !== 'production') {
        return { rules: { userAgent: '*', disallow: '/' } }; // превью и локалка — не индексировать
    }
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/chats', '/settings', '/api/'],
        },
        sitemap: 'https://echo.example.com/sitemap.xml',
    };
}