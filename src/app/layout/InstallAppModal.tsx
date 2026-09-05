import React from 'react';
import { CheckCircle2, Download, MonitorSmartphone, Share, Smartphone } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { INSTALL_BENEFITS, INSTALL_STEPS, type InstallGuide } from '../../pwa/installGuide';

export interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isInstalled: boolean;
  isInstalling: boolean;
  canNativeInstall: boolean;
  installGuide: InstallGuide;
}

const guideIcon = (guide: InstallGuide) => {
  if (guide === 'safari-ios') return Share;
  if (guide === 'chrome') return MonitorSmartphone;
  return Smartphone;
};

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isInstalled,
  isInstalling,
  canNativeInstall,
  installGuide,
}) => {
  const GuideIcon = guideIcon(installGuide);
  const manualSteps =
    installGuide !== 'native' ? INSTALL_STEPS[installGuide] : INSTALL_STEPS.chrome;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-5 border-b border-border bg-muted/30">
          <AppLogo className="mb-5" />
          <DialogHeader className="text-left gap-1.5">
            <DialogTitle>
              {isInstalled ? 'App already installed' : 'Install Meapal LogBook'}
            </DialogTitle>
            <DialogDescription>
              {isInstalled
                ? 'You are using the installed version of the workspace.'
                : canNativeInstall
                  ? 'Add the app to your device for quicker daily access.'
                  : 'Follow the steps below to add the app to your device.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5">
          {isInstalled ? (
            <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 px-4 py-4">
              <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Ready to go</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Meapal LogBook is available from your home screen or applications folder.
                </p>
              </div>
            </div>
          ) : canNativeInstall ? (
            <ul className="space-y-3">
              {INSTALL_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <GuideIcon className="size-4" />
                </span>
                Manual installation
              </div>
              <ol className="space-y-3">
                {manualSteps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20 sm:justify-between">
          {isInstalled ? (
            <Button onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
          ) : canNativeInstall ? (
            <>
              <Button variant="outline" onClick={onClose} disabled={isInstalling}>
                Not now
              </Button>
              <Button onClick={onConfirm} disabled={isInstalling} className="gap-2">
                <Download className="size-4" />
                {isInstalling ? 'Installing…' : 'Install app'}
              </Button>
            </>
          ) : (
            <Button onClick={onClose} className="w-full sm:w-auto">
              Got it
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
