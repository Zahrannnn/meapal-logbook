import React, { useState } from 'react';
import { BarChart3, ClipboardList, Loader2, Users } from 'lucide-react';
import { AppLogo } from '@/app/layout/AppLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { User } from '../../../entities';
import { authService, convertBackendUserToFrontend } from '../services/auth.service';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onForgotPassword?: () => void;
}

const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Daily activity logging',
    description: 'Record tasks, hours, and progress in one place.',
  },
  {
    icon: Users,
    title: 'Cross-team collaboration',
    description: 'Work across departments and shared projects.',
  },
  {
    icon: BarChart3,
    title: 'Reporting & analytics',
    description: 'Managers get real-time visibility into team output.',
  },
] as const;

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onForgotPassword }) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login(loginEmail, loginPassword);
      onLogin(convertBackendUserToFrontend(response.user));
      setLoginEmail('');
      setLoginPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Brand panel */}
      <aside className="hidden lg:flex lg:w-[min(42vw,480px)] shrink-0 flex-col justify-between bg-foreground text-background border-r border-border/10 p-10 xl:p-12">
        <AppLogo variant="inverse" large />

        <div className="space-y-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50 mb-3">
              Internal system
            </p>
            <h1 className="text-2xl font-semibold leading-snug text-white">
              Daily activity reporting for Ricoh teams
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/65 max-w-sm">
              Log your work, track project contributions, and keep managers informed — all in one
              secure workspace.
            </p>
          </div>

          <ul className="space-y-5">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-white">
                  <Icon className="size-4" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="text-xs leading-relaxed text-white/55 mt-0.5">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] text-white/40">
          Ricoh Company · Authorized personnel only
        </p>
      </aside>

      {/* Sign-in panel */}
      <main className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[380px]">
          {/* Mobile brand */}
          <div className="lg:hidden mb-8 pb-8 border-b border-border">
            <AppLogo large />
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Sign in to your internal activity workspace.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">Sign in</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Use your company credentials to continue.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-email">Work email</Label>
              <Input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                placeholder="name@ricoh.com"
                autoComplete="email"
                required
                disabled={isLoading}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Password</Label>
                {onForgotPassword && (
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="h-10"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={cn('w-full h-10', isLoading && 'opacity-80')}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <p className="mt-10 text-center text-[11px] text-muted-foreground leading-relaxed">
            Access restricted to Ricoh employees and approved contractors.
            <br />
            Contact your administrator if you need an account.
          </p>
        </div>
      </main>
    </div>
  );
};
