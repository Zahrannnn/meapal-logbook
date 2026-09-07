import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/**
 * Meapal LogBook toaster: light-only, pinned top-center below the fixed header
 * so it never collides with the mobile bottom tab bar. Toasts are full design-
 * system cards: Manrope, card surface, border-border, card shadow, 16px radius,
 * semantic icon colors and a brand-primary action button (used by Undo).
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      offset={60}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "1rem",
          "fontFamily": "Manrope, ui-sans-serif, system-ui, sans-serif",
        } as React.CSSProperties
      }
      toastOptions={{
        duration: 3000,
        classNames: {
          toast:
            "group !rounded-2xl !border-border !bg-card !text-foreground !shadow-card !font-sans !items-start",
          title: "!text-sm !font-bold",
          description: "!text-sm !font-medium !text-muted-foreground",
          actionButton:
            "!rounded-lg !bg-primary !text-primary-foreground !text-xs !font-bold",
          cancelButton:
            "!rounded-lg !bg-muted !text-muted-foreground !text-xs !font-bold",
          success: "[&_svg]:!text-success",
          error: "[&_svg]:!text-destructive",
          warning: "[&_svg]:!text-warning",
          info: "[&_svg]:!text-info",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
