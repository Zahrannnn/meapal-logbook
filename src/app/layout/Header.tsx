import React from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  Megaphone,
  Shield,
  UserCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { User as UserType, teams } from '../../entities';
import { AppLogo } from './AppLogo';

export interface HeaderProps {
  currentUser: UserType;
  viewMode: 'dashboard' | 'analytics' | 'admin' | 'reports';
  onViewModeChange: (mode: 'dashboard' | 'analytics' | 'admin' | 'reports') => void;
  onLogout: () => void;
  onOpenProfile?: () => void;
  onWhatsNewOpen?: () => void;
  whatsNewUnseen?: boolean;
  onOpenInstall?: () => void;
  isInstalled?: boolean;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

const roleLabelFor = (role: UserType['role']) => {
  if (role === 'admin') return 'Administrator';
  if (role === 'manager' || role === 'project_manager') return 'Project Manager';
  return 'Team Member';
};

type NavItem = {
  mode: HeaderProps['viewMode'];
  label: string;
  icon: React.ElementType;
};

const navLinkClass = (isActive: boolean) =>
  cn(
    'relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'text-primary'
      : 'text-muted-foreground hover:text-foreground',
  );

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  viewMode,
  onViewModeChange,
  onLogout,
  onOpenProfile,
  onWhatsNewOpen,
  whatsNewUnseen = false,
  onOpenInstall,
  isInstalled = false,
  isMobileMenuOpen,
  onMobileMenuToggle,
}) => {
  const userTeam = teams.find((team) => team.id === currentUser.team);
  const TeamIcon = userTeam?.icon;
  const roleLabel = roleLabelFor(currentUser.role);

  const installButtonTitle = isInstalled ? 'App installed' : 'Install app';

  const navItems: NavItem[] = [
    { mode: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  if (currentUser.role === 'manager' || currentUser.role === 'admin') {
    navItems.push(
      { mode: 'analytics', label: 'Analytics', icon: BarChart3 },
      { mode: 'reports', label: 'Reports', icon: FileSpreadsheet },
      {
        mode: 'admin',
        label: currentUser.role === 'admin' ? 'Administration' : 'Projects',
        icon: Shield,
      },
    );
  }

  const userInitials = currentUser.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      {/* Desktop header */}
      <header className="hidden lg:block fixed top-0 inset-x-0 z-40 bg-card border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center h-full">
              <AppLogo className="mr-8" />

              <div className="h-5 w-px bg-border mr-1" aria-hidden="true" />

              <nav className="flex items-center h-full ml-1" aria-label="Main navigation">
                {navItems.map((item) => {
                  const isActive = viewMode === item.mode;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.mode}
                      onClick={() => onViewModeChange(item.mode)}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(navLinkClass(isActive), 'h-full')}
                    >
                      <Icon className="size-4" strokeWidth={isActive ? 2.25 : 2} />
                      {item.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onOpenInstall}
                title={installButtonTitle}
                aria-label="Install app"
                className="text-muted-foreground hover:text-foreground"
              >
                <Download />
              </Button>

              <div className="h-5 w-px bg-border mx-1" aria-hidden="true" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted transition-colors"
                    aria-label={`Account menu for ${currentUser.name}`}
                  >
                    <div
                      className="size-8 rounded-md flex items-center justify-center text-xs font-semibold shrink-0"
                      style={{
                        backgroundColor: userTeam?.color ? `${userTeam.color}18` : undefined,
                        color: userTeam?.color ?? undefined,
                      }}
                    >
                      {TeamIcon ? (
                        <TeamIcon className="size-4" />
                      ) : (
                        <span className="text-primary">{userInitials}</span>
                      )}
                    </div>
                    <span className="flex flex-col items-start leading-tight text-left">
                      <span className="text-sm font-medium text-foreground">{currentUser.name}</span>
                      <span className="text-[11px] text-muted-foreground">{roleLabel}</span>
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={onWhatsNewOpen} className="justify-between">
                    <span className="flex items-center gap-2">
                      <Megaphone />
                      What's new
                    </span>
                    {whatsNewUnseen && <span className="size-2 rounded-full bg-primary" aria-hidden="true" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onOpenProfile}>
                    <UserCircle />
                    My profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onOpenInstall} title={installButtonTitle}>
                    <Download />
                    {isInstalled ? 'App installed' : 'Install app'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={onLogout}>
                    <LogOut />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between h-[52px] px-4">
          <AppLogo compact />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onOpenInstall}
              title={installButtonTitle}
              aria-label="Install app"
              className="text-muted-foreground"
            >
              <Download />
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onMobileMenuToggle}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              className="text-foreground"
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>
    </>
  );
};
