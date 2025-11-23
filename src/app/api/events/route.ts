import { NextRequest, NextResponse } from 'next/server';
import { sseManager } from '@/lib/sse';

export async function GET(req: NextRequest) {
    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            const send = (data: any) => {
                const message = `data: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(encoder.encode(message));
            };

            const unsubscribe = sseManager.subscribe(send);

            req.signal.addEventListener('abort', () => {
                unsubscribe();
                try {
                    controller.close();
                } catch (e) {
                    // Controller might be already closed
                }
            });
        }
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
