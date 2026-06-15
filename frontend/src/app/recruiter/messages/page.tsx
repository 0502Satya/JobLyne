"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { logoutAction } from "@/features/auth/actions";
import { 
  getThreadsAction, 
  getThreadMessagesAction, 
  sendMessageAction, 
  markThreadReadAction 
} from "@/features/auth/actions";

interface Participant {
  id: string;
  email: string;
  account_type: "CANDIDATE" | "RECRUITER" | "COMPANY";
  name: string;
  headline: string;
  avatar: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  message_type: string;
  attachment_url?: string;
  is_read: boolean;
  sent_at: string;
  isOptimistic?: boolean;
}

interface Thread {
  id: string;
  thread_type: string;
  reference_entity_type?: string;
  reference_entity_id?: string;
  created_at: string;
  other_participant: Participant;
  latest_message?: {
    id: string;
    sender_id: string;
    content: string;
    sent_at: string;
    is_read: boolean;
  };
  unread_count: number;
}

function RecruiterMessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialThreadId = searchParams.get("thread");

  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(initialThreadId);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mobile navigation state
  const [viewMode, setViewMode] = useState<"list" | "chat">("list");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeThreadRef = useRef<string | null>(activeThreadId);

  useEffect(() => {
    activeThreadRef.current = activeThreadId;
  }, [activeThreadId]);

  const loadThreads = async (silent = false) => {
    if (!silent) setLoadingThreads(true);
    const res = await getThreadsAction();
    if (res.error) {
      if (!silent) setError(res.error);
    } else {
      setThreads(res || []);
      setError(null);
    }
    if (!silent) setLoadingThreads(false);
  };

  const loadMessages = async (threadId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    const res = await getThreadMessagesAction(threadId);
    if (res.error) {
      if (!silent) alert(res.error);
    } else {
      setMessages(prev => {
        const optimistic = prev.filter(m => m.isOptimistic);
        const fetched = res || [];
        const uniqueOptimistic = optimistic.filter(
          opt => !fetched.some((f: Message) => f.content === opt.content && Math.abs(new Date(f.sent_at).getTime() - new Date(opt.sent_at).getTime()) < 5000)
        );
        return [...fetched, ...uniqueOptimistic];
      });
      
      await markThreadReadAction(threadId);
      setThreads(prev => 
        prev.map(t => t.id === threadId ? { ...t, unread_count: 0 } : t)
      );
    }
    if (!silent) setLoadingMessages(false);
  };

  useEffect(() => {
    loadThreads();

    const interval = setInterval(() => {
      loadThreads(true);
      if (activeThreadRef.current) {
        loadMessages(activeThreadRef.current, true);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setViewMode("chat");
    loadMessages(threadId);
    
    const params = new URLSearchParams(window.location.search);
    params.set("thread", threadId);
    router.replace(`/recruiter/messages?${params.toString()}`);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeThreadId) return;

    const currentInput = messageInput;
    setMessageInput("");

    const optimisticMsg: Message = {
      id: `opt-${Date.now()}`,
      sender_id: "me",
      content: currentInput,
      message_type: "TEXT",
      is_read: false,
      sent_at: new Date().toISOString(),
      isOptimistic: true
    };

    setMessages(prev => [...prev, optimisticMsg]);

    const res = await sendMessageAction(activeThreadId, currentInput);
    if (res.error) {
      alert(`Message delivery failed: ${res.error}`);
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setMessageInput(currentInput);
    } else {
      setMessages(prev => 
        prev.map(m => m.id === optimisticMsg.id ? res : m)
      );
      loadThreads(true);
    }
  };

  const activeThread = threads.find(t => t.id === activeThreadId);

  const filteredThreads = threads.filter(t => {
    const query = searchQuery.toLowerCase();
    return (
      t.other_participant.name.toLowerCase().includes(query) ||
      t.other_participant.headline.toLowerCase().includes(query) ||
      (t.latest_message?.content || "").toLowerCase().includes(query)
    );
  });

  const getAvatarStyle = (email: string) => {
    const gradients = [
      "from-[#8b5cf6] to-[#ec4899]",
      "from-[#3b82f6] to-[#06b6d4]",
      "from-[#f59e0b] to-[#ef4444]",
      "from-[#10b981] to-[#059669]"
    ];
    const index = email.length % gradients.length;
    return `bg-gradient-to-tr ${gradients[index]}`;
  };

  return (
    <div className="min-h-screen bg-bg text-text transition-colors flex flex-col font-sans">
      
      {/* Recruiter Header */}
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 md:px-12 py-4 sticky top-0 z-50 transition-all">
        <div className="flex items-center gap-6">
          <Link href="/recruiter/dashboard" className="flex items-center gap-2 text-primary font-black hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-3xl">hub</span>
            <span className="text-2xl tracking-tight">JobLyne</span>
          </Link>
          <div className="h-6 w-px bg-border hidden md:block"></div>
          <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full hidden md:inline-block">Recruiter Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/recruiter/dashboard" className="text-xs font-black text-muted hover:text-primary transition-colors uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-primary/5 active:scale-[0.98] min-h-[44px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            Dashboard
          </Link>
          <div className="h-6 w-px bg-border hidden md:block"></div>
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-gradient-to-tr from-primary to-[#4c33cf] text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">
              RC
            </div>
            <button 
              onClick={() => logoutAction()} 
              className="text-xs font-black text-muted hover:text-red-500 transition-colors uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-red-500/5 active:scale-[0.98] min-h-[44px]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Recruiter Content Container */}
      <main className="p-6 md:p-12 max-w-7xl mx-auto w-full flex-1 space-y-6 box-sizing">
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-text">Candidate Communications</h1>
          <p className="text-muted text-sm font-semibold">Direct engagement portal. Discuss pipelines, schedules, and offers with sourced candidates.</p>
        </div>

        {/* Messaging Box */}
        <div className="w-full bg-surface border border-border rounded-3xl overflow-hidden shadow-sm flex h-[600px] relative max-w-full">
          
          {/* Left Panel */}
          <div className={`w-full md:w-[350px] lg:w-[400px] border-r border-border flex flex-col h-full bg-surface transition-all duration-300 ${
            viewMode === "chat" ? "hidden md:flex" : "flex"
          }`}>
            <div className="p-4 border-b border-border">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted text-[20px]">search</span>
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-bg border border-border rounded-2xl pl-10 pr-4 py-2.5 text-sm text-text placeholder-muted focus:outline-none focus:border-primary transition-all min-h-[44px]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border/40">
              {loadingThreads ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-muted">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mb-2"></div>
                  <span className="text-xs font-bold uppercase tracking-wider">Loading inbox...</span>
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted">
                  <span className="material-symbols-outlined text-[48px] mb-2 text-muted/60">forum</span>
                  <p className="font-bold text-sm">No discussions started</p>
                  <p className="text-xs text-muted/80 mt-1 max-w-[220px]">Navigate to the Dashboard sourcing tab and click "Message" on any candidate profile.</p>
                </div>
              ) : (
                filteredThreads.map((thread) => {
                  const isSelected = thread.id === activeThreadId;
                  const otherPart = thread.other_participant;
                  const hasUnread = thread.unread_count > 0;
                  
                  return (
                    <button
                      key={thread.id}
                      onClick={() => handleSelectThread(thread.id)}
                      className={`w-full text-left p-4 flex gap-4 transition-all duration-200 group relative border-none ${
                        isSelected 
                          ? "bg-primary/5 dark:bg-primary/10" 
                          : "hover:bg-bg/50"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r"></div>
                      )}

                      <div className="relative flex-shrink-0">
                        <div className={`size-12 rounded-2xl text-white flex items-center justify-center font-black shadow-sm ${getAvatarStyle(otherPart.email)}`}>
                          {otherPart.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-surface rounded-full"></span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className={`text-sm font-bold truncate group-hover:text-primary transition-colors ${
                            hasUnread ? "text-text font-black" : "text-text"
                          }`}>
                            {otherPart.name}
                          </h3>
                          {thread.latest_message && (
                            <span className="text-[10px] text-muted font-bold whitespace-nowrap">
                              {new Date(thread.latest_message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted font-medium truncate mb-1">
                          {otherPart.headline}
                        </p>
                        
                        {thread.latest_message ? (
                          <p className={`text-xs truncate ${
                            hasUnread ? "text-text font-black" : "text-muted"
                          }`}>
                            {thread.latest_message.sender_id === "me" || thread.latest_message.sender_id === otherPart.id ? "" : "You: "}
                            {thread.latest_message.content}
                          </p>
                        ) : (
                          <p className="text-xs text-muted/60 italic truncate">
                            No messages yet
                          </p>
                        )}
                      </div>

                      {hasUnread && (
                        <div className="flex-shrink-0 flex items-center justify-center">
                          <span className="bg-primary text-white text-[10px] font-black size-5 rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                            {thread.unread_count}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className={`flex-1 flex flex-col h-full bg-bg/20 transition-all duration-300 ${
            viewMode === "list" ? "hidden md:flex" : "flex"
          }`}>
            {activeThread ? (
              <>
                <div className="p-4 bg-surface border-b border-border flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => setViewMode("list")}
                      className="md:hidden size-10 rounded-xl hover:bg-bg flex items-center justify-center text-text border border-border flex-shrink-0 min-h-[44px]"
                    >
                      <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </button>

                    <div className={`size-11 rounded-2xl text-white flex items-center justify-center font-black flex-shrink-0 shadow-sm ${getAvatarStyle(activeThread.other_participant.email)}`}>
                      {activeThread.other_participant.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-text truncate">
                        {activeThread.other_participant.name}
                      </h2>
                      <p className="text-[11px] text-muted font-bold truncate">
                        {activeThread.other_participant.headline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                      Online
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 flex flex-col min-w-0">
                  {loadingMessages && messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mb-2"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center py-4">
                        <span className="bg-border/30 text-muted text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                          Recruiter Chat Initiated
                        </span>
                      </div>

                      {messages.map((msg) => {
                        const isMe = msg.sender_id !== activeThread.other_participant.id;
                        
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col max-w-[80%] ${
                              isMe ? "ml-auto items-end" : "mr-auto items-start"
                            }`}
                          >
                            <div className={`p-4 rounded-3xl shadow-sm text-sm word-break break-word ${
                              isMe
                                ? "bg-primary text-white rounded-tr-none"
                                : "bg-surface text-text border border-border/80 rounded-tl-none"
                            }`}>
                              <p className="leading-relaxed font-semibold whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            
                            <div className="flex items-center gap-1.5 mt-1 px-1.5">
                              <span className="text-[10px] text-muted font-bold">
                                {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMe && (
                                <span className={`material-symbols-outlined text-[14px] ${
                                  msg.is_read ? "text-primary" : "text-muted"
                                }`}>
                                  {msg.isOptimistic ? "schedule" : "done_all"}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                <form 
                  onSubmit={handleSendMessage}
                  className="p-4 bg-surface border-t border-border flex items-center gap-3 box-sizing"
                >
                  <input
                    type="text"
                    placeholder="Type a secure message to candidate..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 bg-bg border border-border rounded-2xl px-4 py-3 text-sm text-text placeholder-muted focus:outline-none focus:border-primary transition-all min-h-[48px] box-sizing"
                  />
                  
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="size-12 rounded-2xl bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none min-h-[48px] min-w-[48px] flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted">
                <span className="material-symbols-outlined text-[64px] mb-4 text-muted/40">chat_bubble</span>
                <h2 className="text-xl font-black text-text mb-1">Recruiter Inbox</h2>
                <p className="text-sm font-semibold max-w-sm">Select a discussion from the side panel to view messages or coordinate candidate interviews instantly.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default function RecruiterMessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-text gap-4">
        <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-muted font-bold text-sm tracking-widest uppercase">Loading Messages Hub...</p>
      </div>
    }>
      <RecruiterMessagesContent />
    </Suspense>
  );
}
