import { NextResponse } from 'next/server';

export const config = {
    matcher: '/:path*',
};

export default function middleware(req: Request) {
    const authHeader = req.headers.get('authorization');

    const username = 'admin';
    const password = 'yourpassword';
    const encodedCredentials = btoa(`${username}:${password}`);

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