import React from "react";
import Button from "./Button";
import Icon from "./Icon";
import Text from "./Text";

export type EmptyStatePreset =
  | "search"
  | "permissions"
  | "offline"
  | "404"
  | "notifications"
  | "table"
  | "favorites"
  | "generic";

type EmptyStateProps = {
  preset?: EmptyStatePreset;
  title?: string;
  description?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

const emptyStatePresets = {
  search: {
    title: "No search results",
    description: "Adjust your query, filters, or spelling to explore other matches.",
    icon: "search",
  },
  permissions: {
    title: "Access restricted",
    description: "You do not have the credentials required to view this content. Contact your administrator.",
    icon: "lock",
  },
  offline: {
    title: "Internet disconnected",
    description: "Please check your local network connection and proxy settings to sync data.",
    icon: "cloud_off",
  },
  404: {
    title: "Page not found",
    description: "The page you are looking for does not exist or has been relocated.",
    icon: "error_outline",
  },
  notifications: {
    title: "Inbox is clean",
    description: "You're all caught up! Check back later for new notifications.",
    icon: "notifications",
  },
  table: {
    title: "Empty repository",
    description: "No data records found. Try adding a new record to get started.",
    icon: "grid_on",
  },
  favorites: {
    title: "No favorites saved",
    description: "Click the star or bookmark icon on jobs to save them to your favorites list.",
    icon: "star_border",
  },
  generic: {
    title: "No item selected",
    description: "Select an item from the list to display details here.",
    icon: "inbox",
  },
};

export default function EmptyState({
  preset,
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  // Derive values from preset if provided
  const derivedPreset = preset ? emptyStatePresets[preset] : undefined;
  
  const finalTitle = title || derivedPreset?.title || emptyStatePresets.generic.title;
  const finalDescription = description || derivedPreset?.description || emptyStatePresets.generic.description;
  const finalIcon = icon || derivedPreset?.icon || emptyStatePresets.generic.icon;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/80 bg-surface-0 rounded-2xl max-w-md mx-auto ${className}`}
    >
      <div className="h-16 w-16 rounded-full bg-surface-2 flex items-center justify-center text-muted mb-6">
        <Icon name={finalIcon} size={32} aria-hidden="true" />
      </div>
      <Text variant="h3" as="h3" className="mb-2" color="text">
        {finalTitle}
      </Text>
      <Text variant="body-sm" className="mb-6 leading-relaxed" color="muted">
        {finalDescription}
      </Text>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
