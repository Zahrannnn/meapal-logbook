import React from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Shield,
  UserCircle,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User as UserType, teams } from '../../entities';
import { AppLogo } from './AppLogo';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: 'dashboard' | 'analytics' | 'admin' | 'reports';
  onViewModeChange: (mode: 'dashboard' | 'analytics' | 'admin' | 'reports') => void;
  onLogout: () => void;
  onOpenProfile?: () => void;
  onWhatsNewOpen?: () => void;
  whatsNewUnseen?: boolean;
  onOpenInstall?: () => void;
  isInstalled?: boolean;
  currentUser: UserType;
  isManager: boolean;
  isAdmin: boolean;
}

type MenuItem = {
  mode: MobileMenuProps['viewMode'];
  label: string;
  icon: React.ElementType;
  managerOnly?: boolean;
};

const roleLabelFor = (role: UserType['role']) => {
  if (role === 'admin') return 'Administrator';
  if (role === 'manager' || role === 'project_manager') return 'Project Manager';
  return 'Team Member';
};

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  viewMode,
  onViewModeChange,
  onLogout,
  onOpenProfile,
  onWhatsNewOpen,
  whatsNewUnseen = false,
  onOpenInstall,
  isInstalled = false,
  currentUser,
  isManager,
  isAdmin,
}) => {
  const userTeam = teams.find((team) => team.id === currentUser.team);
  const TeamIcon = userTeam?.icon;
  const roleLabel = roleLabelFor(currentUser.role);

  const userInitials = currentUser.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const menuItems: MenuItem[] = [
    { mode: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { mode: 'analytics', label: 'Analytics', icon: BarChart3, managerOnly: true },
    { mode: 'reports', label: 'Reports', icon: FileSpreadsheet, managerOnly: true },
    {
      mode: 'admin',
      label: isAdmin ? 'Administration' : 'Projects',
      icon: Shield,
      managerOnly: true,
    },
  ];

  const visibleItems = menuItems.filter((item) => !item.managerOnly || isManager || isAdmin);

  const handleNav = (mode: MobileMenuProps['viewMode']) => {
    onViewModeChange(mode);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-foreground/20 z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="lg:hidden fixed top-0 right-0 bottom-0 w-[min(300px,85vw)] z-50 bg-card border-l border-border flex flex-col shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 h-[52px] border-b border-border shrink-0">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Menu
              </span>
              <button
                onClick={onClose}
                className="flex items-center justify-center size-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* User card */}
            <div className="px-4 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="size-10 rounded-md flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{
                    backgroundColor: userTeam?.color ? `${userTeam.color}18` : undefined,
                    color: userTeam?.color ?? undefined,
                  }}
                >
                  {TeamIcon ? (
                    <TeamIcon className="size-5" />
                  ) : (
                    <span className="text-primary">{userInitials}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{roleLabel}</p>
                  {userTeam && (
                    <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">
                      {userTeam.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Mobile navigation">
              <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Workspace
              </p>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = viewMode === item.mode;
                  const Icon = item.icon;
                  return (
                    <li key={item.mode}>
                      <button
                        onClick={() => handleNav(item.mode)}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary/8 text-primary border-l-2 border-primary pl-[10px]'
                            : 'text-foreground hover:bg-muted border-l-2 border-transparent pl-[10px]',
                        )}
                      >
                        <Icon className="size-4 shrink-0" strokeWidth={isActive ? 2.25 : 2} />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer actions */}
            <div className="shrink-0 border-t border-border px-3 py-3 space-y-0.5">
              <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Account
              </p>

              {onWhatsNewOpen && (
                <button
                  onClick={() => {
                    onWhatsNewOpen();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Megaphone className="size-4" />
                    What's new
                  </span>
                  {whatsNewUnseen && <span className="size-2 rounded-full bg-primary" aria-hidden="true" />}
                </button>
              )}

              {onOpenProfile && (
                <button
                  onClick={() => {
                    onOpenProfile();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <UserCircle className="size-4" />
                  My profile
                </button>
              )}

              <button
                onClick={() => {
                  onOpenInstall?.();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Download className="size-4" />
                {isInstalled ? 'App installed' : 'Install app'}
              </button>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/8 transition-colors"
              >
                <LogOut className="size-4" />
                Sign out
              </button>

              <div className="pt-3 px-2">
                <AppLogo compact showWordmark className="opacity-60" />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
