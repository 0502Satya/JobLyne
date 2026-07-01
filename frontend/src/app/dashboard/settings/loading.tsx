import React from "react";
import { LoadingState, Text } from "@/shared/ui";

export default function Loading() {
  return (
    <div className="space-y-6 text-left">
      <div className="animate-pulse">
        <Text variant="h1" className="text-text mb-1 bg-border/20 h-8 w-32 rounded"></Text>
        <Text variant="body" className="bg-border/20 h-4 w-96 rounded mt-2"></Text>
      </div>

      <LoadingState variant="list" />
    </div>
  );
}
