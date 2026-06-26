'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function AuthActivityTracker() {
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Guardamos un flag en sessionStorage para que el update se haga 
      // una sola vez por cada sesión de navegador, evitando saturar la BD.
      const hasTrackedSession = sessionStorage.getItem('tracked_login_session');
      if (!hasTrackedSession) {
        fetch('/api/user/activity', { method: 'POST' })
          .then(res => {
            if (res.ok) {
              sessionStorage.setItem('tracked_login_session', 'true');
            }
          })
          .catch(console.error);
      }
    }
  }, [isLoaded, isSignedIn]);

  return null; // Componente invisible
}
