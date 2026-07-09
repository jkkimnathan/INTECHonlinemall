import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const pathname = request.nextUrl.pathname;

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // getUser()는 서버에서 JWT를 검증 (getSession보다 안전)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 로그인 필요 경로
    if (pathname.startsWith("/mypage") || pathname.startsWith("/checkout")) {
      if (!user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // 관리자 경로: JWT 서버 검증 + app_metadata role 확인
    if (pathname.startsWith("/admin")) {
      if (!user) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // app_metadata는 서버에서만 설정 가능하므로 클라이언트 조작 불가
      const isAdmin = user.app_metadata?.is_admin === true;
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // 이미 로그인한 유저가 로그인/회원가입 페이지 접근 시 리다이렉트
    if (user && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/mypage", request.url));
    }
  } catch {
    // Supabase 연결 실패 시: 보호 경로는 fail-closed (인증 확인 불가 = 차단)
    if (pathname.startsWith("/admin")) {
      return new NextResponse("Service temporarily unavailable", { status: 503 });
    }
    if (pathname.startsWith("/mypage") || pathname.startsWith("/checkout")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // 공개 경로만 통과
    return response;
  }

  return response;
}

// 인증 확인이 필요한 경로에서만 미들웨어 실행 (공개 페이지는 getUser() 호출 없이 통과)
export const config = {
  matcher: [
    "/admin/:path*",
    "/mypage/:path*",
    "/checkout/:path*",
    "/login",
    "/signup",
  ],
};
