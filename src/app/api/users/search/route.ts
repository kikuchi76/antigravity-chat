import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/users/search?q=query - Search users by name or email
export async function GET(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
        }

        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        id: {
                            not: session.user.id // Exclude current user
                        }
                    },
                    {
                        OR: [
                            {
                                name: {
                                    contains: query,
                                    mode: 'insensitive'
                                }
                            },
                            {
                                email: {
                                    contains: query,
                                    mode: 'insensitive'
                                }
                            }
                        ]
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true
            },
            take: 10
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        return NextResponse.json({ error: 'Error searching users' }, { status: 500 });
    }
}
