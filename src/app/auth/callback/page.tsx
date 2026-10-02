'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * This page handles the OAuth callback (Google Sign In).
 * The Supabase browser client automatically detects the `?code=` param,
 * exchanges it for a session using the stored PKCE verifier, and fires
 * onAuthStateChange — which the AuthProvider listens to and logs the user in.
 */
export default function AuthCallbackPage() {
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      window.location.href = '/';
      return;
    }

    // Supabase browser client automatically exchanges the code in the URL
    // No manual call needed — onAuthStateChange in auth-context.tsx handles the rest
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Short delay to let AuthProvider update, then go to app
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } else if (event === 'INITIAL_SESSION' && !session) {
        // No session after callback — something went wrong, go home
        window.location.href = '/';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
      <div className="flex flex-col items-center gap-4">
        {/* Radarly logo spinner */}
        <img
          src="/radarly-logo.png"
          alt="Radarly AI"
          className="h-14 w-14 object-contain animate-pulse"
        />
        <p className="text-sm font-semibold text-slate-600 tracking-wide">
          Signing you in...
        </p>
      </div>
    </div>
  );
}
