import React from "react";
import { redirect } from "next/navigation";
import { getThreads } from "@/services/messaging.server";
import MessagesPageClient from "@/features/dashboard/components/messages/MessagesPageClient";

interface PageProps {
  searchParams: Promise<{ thread?: string }>;
}

export default async function CandidateMessagesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const initialThreadId = resolvedParams.thread || null;
  let threads = [];

  try {
    threads = await getThreads();
  } catch (error) {
    redirect("/auth/signin");
  }

  return (
    <MessagesPageClient
      initialThreads={threads}
      initialThreadId={initialThreadId}
    />
  );
}
