import Link from "next/link";
import { auth } from '@clerk/nextjs/server';
import { SignUpButton } from "@clerk/nextjs";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4">
      <main className="max-w-3xl flex flex-col items-center gap-8 py-20">

        {/* Título Principal */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Todo lo que necesitás, <br className="hidden sm:block" />
            <span className="text-rose-600">en la puerta de tu casa.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Explorá las mejores tiendas de tu ciudad, elegí lo que más te gusta y nosotros nos encargamos del resto. Rápido, fácil y seguro.
          </p>
        </div>

        {/* Botones de Acción (Call to Action) */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full justify-center">
          {userId && (
            <Link
              href="/stores"
              className="flex items-center justify-center h-14 px-8 rounded-full bg-rose-600 text-white font-semibold text-lg hover:bg-rose-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Ver Tiendas
            </Link>
          )}
          {!userId && (
            <div className="flex items-center justify-center h-14 px-8 rounded-full bg-white border-2 border-gray-200 text-gray-800 font-semibold text-lg hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer [&>button]:w-full [&>button]:h-full [&>button]:text-center">
              <SignUpButton mode="modal">Crear una cuenta</SignUpButton>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}