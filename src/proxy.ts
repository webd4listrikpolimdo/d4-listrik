import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all API routes except public /api/news
  if (pathname.startsWith("/api") && pathname !== "/api/news" && pathname !== "/api/news/") {
    const secFetchDest = request.headers.get("sec-fetch-dest");
    const secFetchMode = request.headers.get("sec-fetch-mode");
    const secFetchSite = request.headers.get("sec-fetch-site");

    // 1. Block direct browser navigation to API routes (address bar, link clicks)
    if (secFetchDest === "document" || secFetchMode === "navigate") {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Block cross-origin requests from external websites
    if (secFetchSite && secFetchSite !== "same-origin") {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*", 
};


