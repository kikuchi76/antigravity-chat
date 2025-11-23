import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// POST /api/conversations/[id]/members - Add a member to a conversation
export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const conversationId = params.id;
        const body = await request.json();
        // Accept both "userId" and "id" for flexibility
        const userId = body.userId ?? body.id;
        console.log('Invite API called with conversationId:', conversationId, 'userId:', userId);

        if (!userId) {
            console.error('Invite API Error: User ID is missing in request body', body);
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Check if conversation exists and user is a member
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                members: {
                    some: {
                        userId: session.user.id
                    }
                }
            }
        });

        if (!conversation) {
            console.error('Invite API Error: Conversation not found or access denied', { conversationId, userId: session.user.id });
            return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
        }

        // Check if user is already a member
        const existingMember = await prisma.conversationMember.findFirst({
            where: {
                conversationId,
                userId: userId
            }
        });

        if (existingMember) {
            console.warn('Invite API Warning: User is already a member', { conversationId, userId });
            return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
        }

        // Add user as member
        const member = await prisma.conversationMember.create({
            data: {
                conversation: {
                    connect: { id: conversationId }
                },
                user: {
                    connect: { id: userId }
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });

        return NextResponse.json(member, { status: 201 });
    } catch (error) {
        console.error('Error adding member:', error);
        return NextResponse.json({
            error: 'Error adding member',
            details: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}

// GET /api/conversations/[id]/members - Get all members of a conversation
export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const conversationId = params.id;

        // Check if user is a member of this conversation
        const isMember = await prisma.conversationMember.findFirst({
            where: {
                conversationId,
                userId: session.user.id
            }
        });

        if (!isMember) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const members = await prisma.conversationMember.findMany({
            where: {
                conversationId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                joinedAt: 'asc'
            }
        });

        return NextResponse.json(members);
    } catch (error) {
        console.error('Error fetching members:', error);
        return NextResponse.json({ error: 'Error fetching members' }, { status: 500 });
    }
}
