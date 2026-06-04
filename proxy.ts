import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Protect /dashboard route
  // Wallet state is client-side, so we use a cookie set by the client
  if (request.nextUrl.pathname === "/dashboard") {
    const walletConnected = request.cookies.get("wallet-connected")?.value;
    if (!walletConnected) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"],
};
