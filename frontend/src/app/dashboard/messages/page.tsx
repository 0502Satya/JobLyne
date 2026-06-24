"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  getThreadsAction, 
  getThreadMessagesAction, 
  sendMessageAction, 
  markThreadReadAction 
} from "@/features/auth/actions";
import {
  Search,
  MessagesSquare,
  ArrowLeft,
  Clock,
  CheckCheck,
  Send,
  MessageSquare
} from "lucide-react";

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

function CandidateMessagesContent() {
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
  
  // Mobile navigation state: 'list' | 'chat'
  const [viewMode, setViewMode] = useState<"list" | "chat">("list");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeThreadRef = useRef<string | null>(activeThreadId);

  // Sync ref to allow interval to access latest active thread state
  useEffect(() => {
    activeThreadRef.current = activeThreadId;
  }, [activeThreadId]);

  // Load threads initial
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

  // Load messages initial & when thread changes
  const loadMessages = async (threadId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    const res = await getThreadMessagesAction(threadId);
    if (res.error) {
      if (!silent) alert(res.error);
    } else {
      // Avoid overwriting optimistic messages that are still sending
      setMessages(prev => {
        const optimistic = prev.filter(m => m.isOptimistic);
        const fetched = res || [];
        // Combine fetched with any ongoing optimistic messages that aren't in fetched yet
        const uniqueOptimistic = optimistic.filter(
          opt => !fetched.some((f: Message) => f.content === opt.content && Math.abs(new Date(f.sent_at).getTime() - new Date(opt.sent_at).getTime()) < 5000)
        );
        return [...fetched, ...uniqueOptimistic];
      });
      
      // Mark read backend
      await markThreadReadAction(threadId);
      
      // Refresh local threads to clear unread indicator
      setThreads(prev => 
        prev.map(t => t.id === threadId ? { ...t, unread_count: 0 } : t)
      );
    }
    if (!silent) setLoadingMessages(false);
  };

  // Setup thread and polling intervals
  useEffect(() => {
    loadThreads();

    // Poll active thread & thread list every 4 seconds
    const interval = setInterval(() => {
      loadThreads(true);
      if (activeThreadRef.current) {
        loadMessages(activeThreadRef.current, true);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Handle active thread selection
  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setViewMode("chat");
    loadMessages(threadId);
    
    // Update URL query parameters cleanly
    const params = new URLSearchParams(window.location.search);
    params.set("thread", threadId);
    router.replace(`/dashboard/messages?${params.toString()}`);
  };

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sending message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeThreadId) return;

    const currentInput = messageInput;
    setMessageInput("");

    // Create optimistic message
    const optimisticMsg: Message = {
      id: `opt-${Date.now()}`,
      sender_id: "me", // Placeholder identifying self
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
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setMessageInput(currentInput); // Restore input
    } else {
      // Replace optimistic message with actual DB message
      setMessages(prev => 
        prev.map(m => m.id === optimisticMsg.id ? res : m)
      );
      // Refresh thread list metadata
      loadThreads(true);
    }
  };

  const activeThread = threads.find(t => t.id === activeThreadId);

  // Filter conversations
  const filteredThreads = threads.filter(t => {
    const query = searchQuery.toLowerCase();
    return (
      t.other_participant.name.toLowerCase().includes(query) ||
      t.other_participant.headline.toLowerCase().includes(query) ||
      (t.latest_message?.content || "").toLowerCase().includes(query)
    );
  });

  // Get stable background color or gradient for user avatars based on email length
  const getAvatarStyle = (email: string) => {
    const gradients = [
      "bg-gradient-info",
      "bg-gradient-accent",
      "bg-gradient-warning",
      "bg-gradient-success"
    ];
    const index = email.length % gradients.length;
    return gradients[index];
  };

  return (
    <div className="max-w-full box-sizing overflow-hidden flex gap-6 flex-col">
      
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-text type-h1">Messages</h1>
          <p className="type-label">Communicate with recruiters and hiring managers in real time.</p>
        </div>
      </div>

      {/* Main Glassmorphic Inbox Container */}
      <div className="w-full max-w-full border-border rounded-3xl relative overflow-hidden h-[calc(100vh-224px)] shadow-sm flex bg-surface border md:h-[648px]">
        
        {/* Left Pane: Conversation List */}
        <div className={`w-full h-full border-border transition-all duration-300 flex border-r bg-surface flex-col md:w-[352px] lg:w-[400px] ${
          viewMode === "chat" ? "hidden md:flex" : "flex"
        }`}>
          {/* Search Box */}
          <div className="border-b p-4 border-border">
            <div className="relative">
              <Search className="left-3 absolute top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-text border-border rounded-2xl pl-10 min-h-[44px] text-sm bg-bg transition-all py-2.5 placeholder-muted pr-4 border focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Thread List */}
          <div className="divide-y divide-border/40 flex-1 overflow-y-auto">
            {loadingThreads ? (
              <div className="justify-center h-full items-center p-6 flex text-muted flex-col">
                <div className="mb-2 border-t-2 rounded-full border-primary h-8 w-8 animate-spin"></div>
                <span className="tracking-wider uppercase type-caption">Loading inbox...</span>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="justify-center h-full items-center text-center p-6 flex text-muted flex-col">
                <MessagesSquare className="text-muted/60 mb-2" size={32} aria-hidden="true" />
                <p className="type-ui">No conversations found</p>
                <p className="mt-1 text-xs text-muted/80 max-w-[200px]">Start checking in on your job applications to trigger recruiter interactions.</p>
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
                    className={`w-full group gap-4 relative duration-200 transition-all flex border-none p-4 text-left ${
                      isSelected 
                        ? "bg-primary/5 dark:bg-primary/10" 
                        : "hover:bg-bg/50"
                    }`}
                  >
                    {/* Active highlight line */}
                    {isSelected && (
                      <div className="absolute w-1 left-0 bg-primary bottom-0 rounded-r top-0"></div>
                    )}

                    {/* Avatar */}
                    <div className="flex-shrink-0 relative">
                      <div className={`justify-center rounded-2xl size-12 items-center text-white shadow-sm flex ${getAvatarStyle(otherPart.email)}`}>
                        {otherPart.name.charAt(0).toUpperCase()}
                      </div>
                      {/* Active status bubble */}
                      <span className="absolute border-2 rounded-full size-3 bg-success bottom-0 border-surface right-0"></span>
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="items-baseline flex mb-1 justify-between">
                        <h3 className={`type-ui truncate transition-colors group-hover:text-primary ${
                          hasUnread ? "text-text" : "text-text"
                        }`}>
                          {otherPart.name}
                        </h3>
                        {thread.latest_message && (
                          <span className="text-xs whitespace-nowrap text-muted">
                            {new Date(thread.latest_message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      
                      <p className="truncate text-muted mb-1 type-caption">
                        {otherPart.headline}
                      </p>
                      
                      {thread.latest_message ? (
                        <p className={`truncate text-xs ${
                          hasUnread ? "text-text" : "text-muted"
                        }`}>
                          {thread.latest_message.sender_id === "me" || thread.latest_message.sender_id === otherPart.id ? "" : "You: "}
                          {thread.latest_message.content}
                        </p>
                      ) : (
                        <p className="italic text-muted/60 truncate text-xs">
                          No messages yet
                        </p>
                      )}
                    </div>

                    {/* Badge */}
                    {hasUnread && (
                      <div className="flex-shrink-0 flex justify-center items-center">
                        <span className="size-5 justify-center text-xs items-center text-white rounded-full shadow-lg shadow-primary/20 bg-primary flex">
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

        {/* Right Pane: Message Viewer */}
        <div className={`bg-bg/20 h-full flex-1 transition-all duration-300 flex flex-col ${
          viewMode === "list" ? "hidden md:flex" : "flex"
        }`}>
          {activeThread ? (
            <>
              {/* Conversation Header */}
              <div className="border-b border-border gap-4 items-center flex p-4 bg-surface justify-between">
                <div className="flex gap-3 items-center min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setViewMode("list")}
                    className="md:hidden flex-shrink-0 text-text justify-center border-border min-h-[44px] items-center flex size-10 rounded-xl border hover:bg-bg cursor-pointer"
                  >
                    <ArrowLeft size={20} aria-hidden="true" />
                  </button>

                  {/* Avatar */}
                  <div className={`flex-shrink-0 justify-center rounded-2xl items-center size-11 text-white shadow-sm flex ${getAvatarStyle(activeThread.other_participant.email)}`}>
                    {activeThread.other_participant.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name and Headline */}
                  <div className="min-w-0">
                    <h2 className="text-text type-ui truncate">
                      {activeThread.other_participant.name}
                    </h2>
                    <p className="text-xs truncate text-muted">
                      {activeThread.other_participant.headline}
                    </p>
                  </div>
                </div>

                <div className="gap-2 flex items-center">
                  <span className="py-1 text-success px-2.5 bg-success-bg rounded-full type-badge">
                    Online
                  </span>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto min-w-0 flex p-4 space-y-4 flex-col md:p-6">
                {loadingMessages && messages.length === 0 ? (
                  <div className="justify-center h-full items-center flex text-muted">
                    <div className="mb-2 border-t-2 rounded-full border-primary h-8 w-8 animate-spin"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-center py-4">
                      <span className="bg-border/30 px-3 py-1.5 rounded-full type-badge text-muted">
                        Conversation Initialized
                      </span>
                    </div>

                    {messages.map((msg) => {
                      const isMe = msg.sender_id !== activeThread.other_participant.id;
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex max-w-[80%] flex-col ${
                            isMe ? "ml-auto items-end" : "mr-auto items-start"
                          }`}
                        >
                          <div className={`break-word rounded-3xl text-sm shadow-sm word-break p-4 ${
                            isMe
                              ? "bg-primary text-white rounded-tr-none"
                              : "text-text border border-border/80 bg-surface rounded-tl-none"
                          }`}>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          
                          <div className="px-1.5 gap-1.5 items-center flex mt-1">
                            <span className="text-xs text-muted">
                              {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              msg.isOptimistic ? (
                                <Clock size={12} className="text-muted" aria-hidden="true" />
                              ) : (
                                <CheckCheck size={12} className={msg.is_read ? "text-primary" : "text-muted"} aria-hidden="true" />
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input Footer */}
              <form 
                onSubmit={handleSendMessage}
                className="border-t box-sizing border-border items-center gap-3 flex p-4 bg-surface"
              >
                <input
                  type="text"
                  placeholder="Type a secure message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="text-text flex-1 min-h-[48px] box-sizing border-border rounded-2xl text-sm bg-bg transition-all py-3 placeholder-muted px-4 border focus:outline-none focus:border-primary"
                />
                
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="flex-shrink-0 justify-center min-h-[48px] rounded-2xl size-12 items-center transition-all text-white min-w-[48px] shadow-primary/20 bg-primary flex shadow-lg hover:scale-105 hover:bg-primary/95 active:scale-95 disabled:shadow-none disabled:opacity-50 disabled:scale-100 cursor-pointer"
                >
                  <Send size={20} aria-hidden="true" />
                </button>
              </form>
            </>
          ) : (
            <div className="justify-center h-full items-center text-center p-6 flex text-muted flex-col">
              <MessageSquare className="mb-4 text-muted/40" size={32} aria-hidden="true" />
              <h2 className="text-text type-h2 mb-1">Your Conversation Canvas</h2>
              <p className="type-ui max-w-sm">Select a thread from the side panel to view messages or start corresponding with hiring stakeholders.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function CandidateMessagesPage() {
  return (
    <Suspense fallback={
      <div className="justify-center gap-4 items-center p-12 flex text-muted flex-col">
        <div className="mb-2 border-t-2 rounded-full border-primary h-8 w-8 animate-spin"></div>
        <span className="tracking-wider uppercase type-caption">Loading inbox...</span>
      </div>
    }>
      <CandidateMessagesContent />
    </Suspense>
  );
}
