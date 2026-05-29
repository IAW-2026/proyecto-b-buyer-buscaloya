import type { Metadata, Viewport } from 'next';
import { ClerkProvider, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import CartButton from './ui/cart/CartButton';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { CartProvider } from './providers/CartProvider';
import HeaderNav from './ui/layout/HeaderNav';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Buscaloya | Tu Delivery',
  description: 'Encuentra las mejores tiendas y compra rápido.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Obtenemos el usuario autenticado desde Clerk
  const authObject = await auth();
  const userId = authObject.userId;
  const role = (authObject.sessionClaims as any)?.metadata?.role;
  // 2. Verificamos si es administrador en la base de datos
  const isAdmin = role === 'system_admin';

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white flex flex-col min-h-screen w-full overflow-x-hidden`}>
        <ClerkProvider>
          <CartProvider>

            {/* Cabecera Principal */}
            <header className="flex flex-wrap justify-between items-center px-4 sm:px-6 py-3 sm:py-4 min-h-[4rem] bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 gap-y-3">

              {/* Logo de la app */}
              <Link href="/" className="text-xl font-bold text-rose-600 hover:text-rose-700 transition-colors shrink-0">
                Buscaloya
              </Link>

              {/* Botones de Navegación y Autenticación */}
              <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-6 flex-1 sm:flex-none">
                {!userId ? (
                  // Vista para usuarios deslogueados
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-xs sm:text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors cursor-pointer [&>button]:w-full [&>button]:h-full [&>button]:text-left">
                      <SignInButton mode="modal">Iniciar Sesión</SignInButton>
                    </div>
                    <div className="bg-rose-600 text-white rounded-full font-medium text-xs sm:text-sm h-8 sm:h-10 px-4 sm:px-5 hover:bg-rose-700 transition-colors shadow-sm flex items-center cursor-pointer [&>button]:w-full [&>button]:h-full [&>button]:text-center">
                      <SignUpButton mode="modal">Regístrate</SignUpButton>
                    </div>
                  </div>
                ) : (
                  // Vista para usuarios logueados
                  <>
                    <HeaderNav isAdmin={isAdmin} />

                    <div className="flex items-center gap-3 sm:gap-4 ml-1 sm:ml-2 pl-3 sm:pl-4 border-l border-gray-200 shrink-0">
                      <CartButton />
                      <UserButton />
                    </div>
                  </>
                )}
              </div>
            </header>

            {/* Contenido principal de la página */}
            <main className="flex-1">
              {children}
            </main>

          </CartProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}