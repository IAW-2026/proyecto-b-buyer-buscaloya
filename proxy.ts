import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// 1. Definimos qué rutas son públicas (No requieren login)
const isPublicRoute = createRouteMatcher([
  '/', 
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/api/clerk-webhook'
]);

// 2. Definimos las rutas de administración
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // REGLA 1: Si la ruta NO es pública, obligamos a que esté logueado
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // REGLA 2: Si además es una ruta de admin, verificamos el rol
  if (isAdminRoute(req)) {
    const authObject = await auth(); 
    const role = (authObject.sessionClaims as any)?.metadata?.role;
    console.log(`Acceso a ruta admin: UserID=${authObject.userId}, Role=${role}, Path=${req.nextUrl.pathname}`);
    if (role !== 'system_admin') {
      // Si está logueado pero no es admin, lo mandamos al home
      const homeUrl = new URL('/', req.url);
      return NextResponse.redirect(homeUrl);
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};