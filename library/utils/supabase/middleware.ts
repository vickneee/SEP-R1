
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Protected routes that require authentication
const protectedRoutes = ['/my-books', '/history', '/private'];

// Auth routes that should redirect to home if user is already authenticated
const authRoutes = ['/signin', '/signup'];

export async function updateSession(request: NextRequest) {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  // Refresh the user session
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // Handle protected routes
  if (protectedRoutes.some(route => url.pathname.startsWith(route))) {
    if (!user) {
      // Redirect to signin if accessing protected route without auth
      url.pathname = '/signin'
      return NextResponse.redirect(url)
    }
  }

  // Handle auth routes (allow access for testing - comment out redirect)
  // Note: In production, you might want to redirect authenticated users away from auth pages
  // if (authRoutes.some(route => url.pathname.startsWith(route))) {
  //   if (user) {
  //     // Redirect to home if accessing auth routes while authenticated
  //     url.pathname = '/'
  //     return NextResponse.redirect(url)
  //   }
  // }

  // Handle private page redirect
  if (url.pathname === '/private' && !user) {
    url.pathname = '/signin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

// Legacy function for backwards compatibility
export const createClient = (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  return { supabase, response: supabaseResponse }
};
