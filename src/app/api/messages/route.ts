import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get('conversationId');

        const whereClause = conversationId ? { conversationId } : {};

        const messages = await prisma.message.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                user: {
                    select: {
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { content, role, conversationId } = body;

        if (!content || !role) {
            return NextResponse.json({ error: 'Content and role are required' }, { status: 400 });
        }

        let targetConversationId = conversationId;

        // If no conversationId provided, find or create "General"
        if (!targetConversationId) {
            let generalConversation = await prisma.conversation.findFirst({
                where: { title: 'General' },
            });

            if (!generalConversation) {
                generalConversation = await prisma.conversation.create({
                    data: {
                        title: 'General',
                        ownerId: session.user.id,
                    },
                });

                // Add creator as member
                await prisma.conversationMember.create({
                    data: {
                        conversationId: generalConversation.id,
                        userId: session.user.id,
                    },
                });
            }
            targetConversationId = generalConversation.id;
        }

        const message = await prisma.message.create({
            data: {
                content,
                role,
                conversationId: targetConversationId,
                userId: role === 'user' ? session.user.id : null,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({ error: 'Error creating message' }, { status: 500 });
    }
}
