import type { Metadata } from 'next';
import { ClerkProvider, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import CartButton from './ui/cart/CartButton';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { CartProvider } from './providers/CartProvider';

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 flex flex-col min-h-screen`}>
        <ClerkProvider>
          <CartProvider>

            {/* Cabecera Principal */}
            <header className="flex justify-between items-center px-6 py-4 h-16 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">

              {/* Logo de la app */}
              <Link href="/" className="text-xl font-bold text-purple-700 hover:text-purple-800 transition-colors">
                Buscaloya
              </Link>

              {/* Botones de Navegación y Autenticación */}
              <div className="flex items-center gap-6">
                {!userId ? (
                  // Vista para usuarios deslogueados
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors cursor-pointer [&>button]:w-full [&>button]:h-full [&>button]:text-left">
                      <SignInButton mode="modal">Iniciar Sesión</SignInButton>
                    </div>
                    <div className="bg-purple-700 text-white rounded-full font-medium text-sm h-10 px-5 hover:bg-purple-800 transition-colors shadow-sm flex items-center cursor-pointer [&>button]:w-full [&>button]:h-full [&>button]:text-center">
                      <SignUpButton mode="modal">Regístrate</SignUpButton>
                    </div>
                  </div>
                ) : (
                  // Vista para usuarios logueados
                  <>
                    <nav className="flex items-center gap-5 text-sm font-medium text-gray-700">
                      <Link href="/stores" className="hover:text-purple-700 transition-colors">Tiendas</Link>
                      <Link href="/purchase" className="hover:text-purple-700 transition-colors">Mi Compra</Link>
                      <Link href="/user" className="hover:text-purple-700 transition-colors">Mi Perfil</Link>

                      {/* Enlace exclusivo para el Administrador */}
                      {isAdmin && (
                        <Link
                          href="/admin/users"
                          className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                        >
                          Panel Admin
                        </Link>
                      )}
                    </nav>

                    <div className="flex items-center gap-4 ml-2 pl-4 border-l border-gray-200">
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