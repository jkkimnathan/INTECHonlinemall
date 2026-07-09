import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// Rate limiting: IP별 시도 횟수 추적 (메모리 기반, 서버리스 환경에서는 요청 단위)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10; // 최대 시도 횟수
const RATE_LIMIT_WINDOW = 60 * 1000; // 1분

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const pathname = request.nextUrl.pathname;

  // Rate Limiting: 로그인/회원가입 페이지 POST 요청 제한
  if (
    (pathname === "/login" || pathname === "/signup") &&
    request.method === "POST"
  ) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }
  }

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

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
