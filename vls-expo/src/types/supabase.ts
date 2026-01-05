// vls-expo/src/types/supabase.ts

// Based on the existing Next.js app and common Supabase table structures.
// These can be refined as we migrate each feature.

export interface Task {
    id: string;
    created_at: string;
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'done';
    due_at?: string;
    priority: 'Low' | 'Medium' | 'High';
    assignee?: string;
    course?: string;
    created_by: string;
    file_url?: string;
  }
  
  export interface Announcement {
    id: string;
    created_at: string;
    title: string;
    content: string;
    course?: string;
    author_id: string;
  }
  
  export interface LeaderboardEntry {
    user_id: string;
    score: number;
    full_name?: string; // Assuming this comes from a join with a 'users' table
  }

  export interface Profile {
    id: string;
    updated_at: string;
    username: string;
    full_name: string;
    avatar_url: string;
    website: string;
  }

  export interface CalendarEvent {
    id: string;
    created_at: string;
    title: string;
    start_time: string;
    end_time?: string;
    category: string;
    course?: string;
    assignee?: string;
    created_by: string;
  }

  export interface WikiPage {
    id: string;
    created_at: string;
    title: string;
    content: string; // Markdown content
    author_id: string;
    last_edited_at: string;
  }

  export interface CTFChallenge {
    id: number;
    created_at: string;
    title: string;
    description: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    points: number;
    flag_hash?: string; // Should not be sent to client
  }

  export interface CTFSubmission {
    id: number;
    created_at: string;
    user_id: string;
    challenge_id: number;
    submitted_flag: string;
    correct: boolean;
  }

  export interface Notification {
    id: number;
    created_at: string;
    user_id: string;
    message: string;
    read: boolean;
    source_id?: string;
    source_type?: 'task' | 'announcement' | 'submission';
  }

