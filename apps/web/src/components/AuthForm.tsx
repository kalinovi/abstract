'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signIn, signUp, type AuthState } from '@/app/auth/actions';
import { OAuthButtons } from '@/components/OAuthButtons';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? 'Please wait…' : label}
    </button>
  );
}

export function AuthForm({
  mode,
  next,
  oauthError,
}: {
  mode: 'login' | 'signup';
  next?: string;
  oauthError?: boolean;
}) {
  const action = mode === 'login' ? signIn : signUp;
  const [state, formAction] = useFormState<AuthState, FormData>(action, { error: null });

  return (
    <div className="mx-auto mt-16 max-w-md px-5">
      <div className="card p-8">
        <h1 className="text-2xl font-black">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          {mode === 'login'
            ? 'Log in to like, comment and share your art.'
            : 'Join the community and start sharing your art.'}
        </p>

        {oauthError && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            Could not sign in with that provider. Please try again.
          </p>
        )}

        <div className="mt-6">
          <OAuthButtons next={next} />
        </div>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-zinc-500">
          <span className="h-px flex-1 bg-white/10" />
          or with email
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form action={formAction} className="space-y-4">
          {next && <input type="hidden" name="next" value={next} />}

          {mode === 'signup' && (
            <div>
              <label className="mb-1 block text-sm text-zinc-300" htmlFor="username">
                Username
              </label>
              <input id="username" name="username" className="field" placeholder="yourhandle" />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm text-zinc-300" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" className="field" placeholder="you@example.com" />
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-300" htmlFor="password">
              Password
            </label>
            <input id="password" name="password" type="password" className="field" placeholder="••••••••" />
          </div>

          {state.error && <p className="text-sm text-red-400">{state.error}</p>}

          <SubmitButton label={mode === 'login' ? 'Log in' : 'Sign up'} />
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          {mode === 'login' ? (
            <>
              New here?{' '}
              <Link href="/signup" className="text-accent hover:underline">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/login" className="text-accent hover:underline">
                Log in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
