import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const session = await auth();

    // Protect chat routes
    if (request.nextUrl.pathname === "/" || request.nextUrl.pathname.startsWith("/api/messages")) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // Redirect to chat if already logged in and trying to access auth pages
    if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup") {
        if (session) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/login", "/signup", "/api/messages/:path*"]
};
