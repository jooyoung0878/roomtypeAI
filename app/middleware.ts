// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 이미 api / _next / favicon 등은 패스
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // /ko, /en 프리픽스 처리
  if (pathname === "/ko" || pathname.startsWith("/ko/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/ko/, "") || "/";
    url.searchParams.set("lang", "ko");
    return NextResponse.rewrite(url);
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/en/, "") || "/";
    url.searchParams.set("lang", "en");
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"], // 파일 확장자 없는 경로만
};