export interface Participant {
  id: string;
  email: string;
  account_type: "CANDIDATE" | "RECRUITER" | "COMPANY";
  name: string;
  headline: string;
  avatar: string;
}

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  message_type: string;
  attachment_url?: string;
  is_read: boolean;
  sent_at: string;
  isOptimistic?: boolean;
}

export interface Thread {
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
