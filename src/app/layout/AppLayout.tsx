import React from 'react';
import { User as UserType } from '../../entities';
import { cn } from '@/lib/utils';
import { usePwaInstall } from '../../pwa/usePwaInstall';
import { Header } from './Header';
import { InstallAppModal } from './InstallAppModal';
import { MobileMenu } from './MobileMenu';
import { MobileNav } from './MobileNav';

export interface AppLayoutProps {
  currentUser: UserType;
  viewMode: 'dashboard' | 'analytics' | 'admin' | 'reports';
  onViewModeChange: (mode: 'dashboard' | 'analytics' | 'admin' | 'reports') => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  onWhatsNewOpen: () => void;
  whatsNewUnseen: boolean;
  isMobileMenuOpen: boolean;
  onMobileMenuOpenChange: (isOpen: boolean) => void;
  onAddActivity: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentUser,
  viewMode,
  onViewModeChange,
  onLogout,
  onOpenProfile,
  onWhatsNewOpen,
  whatsNewUnseen,
  isMobileMenuOpen,
  onMobileMenuOpenChange,
  onAddActivity,
  children,
}) => {
  const isManager = currentUser.role === 'manager' || currentUser.role === 'admin';
  const showMobileNav = currentUser.role !== 'admin';
  const install = usePwaInstall();

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentUser={currentUser}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onLogout={onLogout}
        onOpenProfile={onOpenProfile}
        onWhatsNewOpen={onWhatsNewOpen}
        whatsNewUnseen={whatsNewUnseen}
        onOpenInstall={install.openInstallModal}
        isInstalled={install.isInstalled}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => onMobileMenuOpenChange(!isMobileMenuOpen)}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => onMobileMenuOpenChange(false)}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onLogout={onLogout}
        onOpenProfile={onOpenProfile}
        onWhatsNewOpen={onWhatsNewOpen}
        whatsNewUnseen={whatsNewUnseen}
        onOpenInstall={() => {
          onMobileMenuOpenChange(false);
          install.openInstallModal();
        }}
        isInstalled={install.isInstalled}
        currentUser={currentUser}
        isManager={isManager}
        isAdmin={currentUser.role === 'admin'}
      />

      <InstallAppModal
        isOpen={install.isModalOpen}
        onClose={install.closeInstallModal}
        onConfirm={install.confirmInstall}
        isInstalled={install.isInstalled}
        isInstalling={install.isInstalling}
        canNativeInstall={install.canNativeInstall}
        installGuide={install.installGuide}
      />

      <main
        className={cn(
          'pt-[calc(52px+1rem)] lg:pt-[calc(3.5rem+1.25rem)] px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto',
          showMobileNav
            ? 'pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-8'
            : 'pb-6 lg:pb-8',
        )}
      >
        <div className="animate-fade-in">{children}</div>
      </main>

      {showMobileNav && (
        <MobileNav
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          onAddActivity={onAddActivity}
          isManager={currentUser.role === 'manager'}
        />
      )}
    </div>
  );
};
