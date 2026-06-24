import React from "react";
import Button from "./Button";
import Text from "./Text";
import { AlertCircle, CloudOff, Lock, Server, Search, WifiOff, ShieldAlert } from "lucide-react";

export type ErrorStateType = "network" | "server" | "permission" | "not-found" | "offline" | "generic";

type ErrorStateProps = {
  type?: ErrorStateType;
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
};

const errorStatePresets = {
  network: {
    title: "Connection handshake failure",
    description: "Verify local network connection, firewalls, and active VPN tunnels.",
    icon: CloudOff,
  },
  server: {
    title: "Internal database sync error",
    description: "Database handshakes encountered an error. Our engineering team has been notified.",
    icon: Server,
  },
  permission: {
    title: "Action unauthorized",
    description: "Security layers prevented this action. Please re-authenticate.",
    icon: Lock,
  },
  "not-found": {
    title: "Resource missing",
    description: "The requested document or record could not be located in the database.",
    icon: Search,
  },
  offline: {
    title: "Internet disconnected",
    description: "Offline operations active. Real-time actions will sync once network is restored.",
    icon: WifiOff,
  },
  generic: {
    title: "Operation failed",
    description: "An unexpected error occurred. Please try the action again.",
    icon: ShieldAlert,
  },
};

export default function ErrorState({
  type = "generic",
  title,
  description,
  onRetry,
  className = "",
}: ErrorStateProps) {
  const preset = errorStatePresets[type] || errorStatePresets.generic;

  const finalTitle = title || preset.title;
  const finalDescription = description || preset.description;
  const IconComponent = preset.icon;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-error/15 bg-error-bg/5 rounded-2xl max-w-md mx-auto ${className}`}
    >
      <div className="h-12 w-12 rounded-full bg-error-bg flex items-center justify-center text-error mb-4">
        <IconComponent size={24} aria-hidden="true" />
      </div>
      <Text variant="h3" as="h3" className="mb-2" color="text">
        {finalTitle}
      </Text>
      <Text variant="body-sm" className="mb-6 leading-relaxed" color="muted">
        {finalDescription}
      </Text>
      {onRetry && (
        <Button variant="danger" onClick={onRetry} className="min-w-[120px]">
          Try again
        </Button>
      )}
    </div>
  );
}
