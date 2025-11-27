import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const url = new URL(request.url);

  // Protect /driver: must be logged in and be a driver
  if (url.pathname.startsWith("/driver")) {
    if (!session) {
      const redirect = encodeURIComponent(url.pathname + url.search);
      return NextResponse.redirect(new URL(`/login?redirect=${redirect}`, request.url));
    }

    const { data: driver } = await supabase
      .from("drivers")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (!driver) {
      return NextResponse.redirect(new URL(`/login?error=role_mismatch`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/driver"],
};