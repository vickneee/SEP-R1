import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

import { i18nRouter } from 'next-i18n-router';
import i18nConfig from './i18nConfig';

export async function middleware(request: NextRequest) {
    // Step 1: Handle Supabase session (auth)
    const response = await updateSession(request)

    // Step 2: Handle i18n routing (locale detection)
    const i18nResponse = i18nRouter(request, i18nConfig)

    // If i18nRouter returned a redirect (like adding /en), use it
    if (i18nResponse) {
        return i18nResponse
    }
    // Otherwise, continue with Supabase response
    return response
  // return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
