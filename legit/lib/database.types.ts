export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Patient {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  last_visit_date?: string;
  last_surgery_date?: string;
  notes?: string;
  tags?: string[];
  marketing_consent?: boolean;
  privacy_consent?: boolean;
  consent_date?: string;
  cancellation_history?: Array<{
    appointment_id?: string;
    date: string;
    reason_category: string;
    reason: string;
    workflow_id?: string;
    node_id?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export type SurgeryType = 
  | 'lasik' | 'lasek' | 'cataract' | 'glaucoma' 
  | 'blepharoplasty' | 'rhinoplasty' | 'breast_augmentation' | 'liposuction' 
  | 'other';

export interface Appointment {
  id: string;
  user_id: string;
  patient_id: string;
  doctor_id?: string;
  appointment_date: string;
  appointment_time: string;
  type?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  cancellation_reason?: string;
  cancellation_reason_category?: 'schedule_conflict' | 'financial' | 'health_concern' | 'dissatisfaction' | 'found_other_provider' | 'no_longer_needed' | 'other';
  surgery_type?: string; // Should ideally be SurgeryType but keeping as string for flexibility
  surgery_details?: Record<string, any>;
  naver_booking_id?: string;
  // Telemedicine fields
  is_telemedicine?: boolean;
  video_provider?: 'zoom' | 'google_meet' | 'custom';
  meeting_id?: string;
  meeting_url?: string;
  meeting_password?: string;
  recording_consent?: boolean;
  recording_url?: string;
  video_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  patient?: Patient; // For joined queries
  doctor?: Doctor; // For joined queries
}

export interface Doctor {
  id: string;
  user_id: string;
  name: string;
  specialty?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  trigger_type: string;
  target_surgery_type?: string;
  steps: {
    day: number;
    type: 'survey' | 'photo';
    title?: string;
    message_template?: string;
  }[];
  visual_data?: { nodes: any[], edges: any[] };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  user_id: string;
  workflow_id?: string;
  patient_id?: string;
  trigger_type: string;
  status: "pending" | "running" | "completed" | "failed";
  current_step_index?: number;
  steps_completed?: number;
  total_steps?: number;
  error_message?: string;
  execution_data?: Record<string, any>;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface TemplateMessage {
  type: 'sms' | 'lms' | 'kakao_alimtalk' | 'kakao_friendtalk';
  content: string;
  title?: string; // For LMS
  buttons?: any[]; // For Kakao
  imageId?: string; // For MMS/FriendTalk
}

export interface DatabaseTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_value?: number;
  trigger_unit?: 'days' | 'months';
  target_surgery_type?: string;
  messages: TemplateMessage[];
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTemplate {
  id: string;
  user_id: string | null;
  name: string;
  description?: string;
  category: '안과' | '성형외과' | '피부과' | '공통';
  specialty?: string;
  target_surgery_type?: string;
  visual_data?: { nodes: any[]; edges: any[] };
  steps?: any[];
  is_public: boolean;
  is_featured: boolean;
  is_system_template: boolean;
  usage_count: number;
  rating_average: number;
  rating_count: number;
  tags?: string[];
  preview_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTemplateRating {
  id: string;
  template_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface WorkflowTemplateUsage {
  id: string;
  template_id: string;
  user_id: string;
  workflow_id?: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  template_id?: string;
  target_patients?: string[]; // UUID array
  scheduled_at?: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface MessageLog {
  id: string;
  user_id: string;
  patient_id?: string;
  template_id?: string;
  campaign_id?: string;
  channel: 'kakao' | 'sms';
  recipient_phone: string;
  message_content: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  error_message?: string;
  metadata?: Record<string, any>;
  sent_at?: string;
  delivered_at?: string;
  created_at: string;
}

export interface Consultation {
  id: string;
  user_id: string;
  patient_id?: string; // Linked patient (optional)
  doctor_id?: string;
  patient_name: string;
  patient_phone: string;
  source?: string; // e.g. 'naver_booking', 'referral', 'walk_in'
  status: 'pending' | 'scheduled' | 'completed' | 'no_show';
  outcome?: 'scheduled_surgery' | 'follow_up' | 'lost'; // Consultation outcome
  notes?: string;
  follow_up_date?: string;
  follow_up_notes?: string;
  consultation_date: string;
  // Telemedicine fields
  is_telemedicine?: boolean;
  video_provider?: 'zoom' | 'google_meet' | 'custom';
  meeting_id?: string;
  meeting_url?: string;
  meeting_password?: string;
  recording_consent?: boolean;
  recording_url?: string;
  video_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface ConsultationStats {
  total_consultations: number;
  conversion_rate: number; // percentage
  top_sources: { source: string; count: number }[];
  recent_consultations: Consultation[];
}

export interface EventCampaign {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  target_audience?: Record<string, any>; // e.g. { age_range: [20, 30], gender: 'female' }
  created_at: string;
  updated_at: string;
}

export interface PatientPhoto {
  id: string;
  user_id: string;
  patient_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  category?: 'pre_op' | 'post_op' | 'checkup';
  taken_at: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  patient_id: string;
  last_message_at: string;
  status: 'open' | 'closed' | 'archived';
  created_at: string;
  updated_at: string;
  patient?: Patient; // Joined
  messages?: Message[]; // Joined
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  direction: 'inbound' | 'outbound';
  channel: 'kakao' | 'sms' | 'lms';
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'received';
  created_at: string;
}

export interface EmailSettings {
  id: string;
  user_id: string;
  sender_name: string;
  sender_email: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user?: string;
  smtp_password?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      email_settings: {
        Row: EmailSettings;
        Insert: Omit<EmailSettings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EmailSettings, 'id' | 'created_at' | 'updated_at'>>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'patient' | 'messages'>;
        Update: Partial<Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'patient' | 'messages'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: Partial<Omit<Message, 'id' | 'created_at'>>;
      };
      patients: {
        Row: Patient;
        Insert: Omit<Patient, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Patient, 'id' | 'created_at' | 'updated_at'>>;
      };
      appointments: {
        Row: Appointment;
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>>;
      };
      doctors: {
        Row: Doctor;
        Insert: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Doctor, 'id' | 'created_at' | 'updated_at'>>;
      };
      workflows: {
        Row: Workflow;
        Insert: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Workflow, 'id' | 'created_at' | 'updated_at'>>;
      };
      templates: {
        Row: DatabaseTemplate;
        Insert: Omit<DatabaseTemplate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseTemplate, 'id' | 'created_at' | 'updated_at'>>;
      };
      campaigns: {
        Row: Campaign;
        Insert: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Campaign, 'id' | 'created_at' | 'updated_at'>>;
      };
      message_logs: {
        Row: MessageLog;
        Insert: Omit<MessageLog, 'id' | 'created_at'>;
        Update: Partial<Omit<MessageLog, 'id' | 'created_at'>>;
      };
      consultations: {
        Row: Consultation;
        Insert: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Consultation, 'id' | 'created_at' | 'updated_at'>>;
      };
      event_campaigns: {
        Row: EventCampaign;
        Insert: Omit<EventCampaign, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EventCampaign, 'id' | 'created_at' | 'updated_at'>>;
      };
      patient_photos: {
        Row: PatientPhoto;
        Insert: Omit<PatientPhoto, 'id' | 'created_at'>;
        Update: Partial<Omit<PatientPhoto, 'id' | 'created_at'>>;
      };
      workflow_templates: {
        Row: WorkflowTemplate;
        Insert: Omit<WorkflowTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count' | 'rating_average' | 'rating_count'>;
        Update: Partial<Omit<WorkflowTemplate, 'id' | 'created_at' | 'updated_at'>>;
      };
      workflow_template_ratings: {
        Row: WorkflowTemplateRating;
        Insert: Omit<WorkflowTemplateRating, 'id' | 'created_at'>;
        Update: Partial<Omit<WorkflowTemplateRating, 'id' | 'created_at'>>;
      };
      workflow_template_usage: {
        Row: WorkflowTemplateUsage;
        Insert: Omit<WorkflowTemplateUsage, 'id' | 'created_at'>;
        Update: Partial<Omit<WorkflowTemplateUsage, 'id' | 'created_at'>>;
      };
      workflow_executions: {
        Row: WorkflowExecution;
        Insert: Omit<WorkflowExecution, 'id' | 'created_at'>;
        Update: Partial<Omit<WorkflowExecution, 'id' | 'user_id'>>;
      };
    };
  };
}
