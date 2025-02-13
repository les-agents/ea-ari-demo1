import { NextResponse } from 'next/server';

export function middleware(req: Request) {
    const authHeader = req.headers.get('authorization');

    const username = 'demo';
    const password = 'ari';
    const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64');

    if (!authHeader || authHeader !== `Basic ${encodedCredentials}`) {
        return new NextResponse('Unauthorized', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Area"',
            },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/:path*', // Applique le middleware à toutes les routes
};