import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/conversations - Get all conversations for the current user
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                members: {
                    some: {
                        userId: session.user.id
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        messages: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        return NextResponse.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ error: 'Error fetching conversations' }, { status: 500 });
    }
}

// POST /api/conversations - Create a new conversation
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const conversation = await prisma.conversation.create({
            data: {
                title,
                ownerId: session.user.id,
                members: {
                    create: {
                        userId: session.user.id
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(conversation, { status: 201 });
    } catch (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json({ error: 'Error creating conversation' }, { status: 500 });
    }
}
