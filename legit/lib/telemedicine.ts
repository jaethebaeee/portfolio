/**
 * Unified Telemedicine Service
 * Abstracts Zoom and Google Meet integrations
 * 
 * @deprecated Complex integrations are paused. Use manual meeting links instead.
 */

// import { ZoomService, ZoomMeetingConfig } from './integrations/zoom';
// import { GoogleMeetService, GoogleMeetConfig } from './integrations/google-meet';
import { createServerClient } from './supabase';

export type TelemedicineProvider = 'zoom' | 'google_meet';

export interface TelemedicineMeetingConfig {
  provider: TelemedicineProvider;
  title: string;
  description?: string;
  startTime: string; // ISO 8601
  durationMinutes: number;
  patientEmail?: string;
  patientName?: string;
  requirePassword?: boolean;
  waitingRoom?: boolean;
  autoRecord?: boolean;
  recordingConsent?: boolean;
}

export interface TelemedicineMeeting {
  meetingId: string;
  meetingUrl: string;
  password?: string;
  provider: TelemedicineProvider;
  startTime: string;
  durationMinutes: number;
  metadata: Record<string, any>;
}

export class TelemedicineService {
  /**
   * Get telemedicine settings for a user
   */
  static async getSettings(userId: string) {
    const supabase = createServerClient();
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
      .from('telemedicine_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  /**
   * Create a telemedicine meeting
   * @deprecated Manual link is preferred
   */
  static async createMeeting(
    userId: string,
    config: TelemedicineMeetingConfig
  ): Promise<TelemedicineMeeting> {
    throw new Error('Automated meeting creation is currently disabled. Please use manual links.');
    /*
    const settings = await this.getSettings(userId);
    if (!settings) {
      throw new Error('Telemedicine settings not configured. Please set up your video provider credentials.');
    }

    const provider = config.provider || settings.default_provider;

    if (provider === 'zoom') {
      return await this.createZoomMeeting(userId, config, settings);
    } else if (provider === 'google_meet') {
      return await this.createGoogleMeetMeeting(userId, config, settings);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
    */
  }

  // ... (Other methods commented out or kept for reference but disabled via createMeeting)
  
  /**
   * Update meeting
   */
  static async updateMeeting(
    userId: string,
    meetingId: string,
    provider: TelemedicineProvider,
    updates: Partial<TelemedicineMeetingConfig>
  ): Promise<void> {
     // No-op or error
     console.warn('TelemedicineService.updateMeeting called but service is disabled.');
  }

  /**
   * Delete meeting
   */
  static async deleteMeeting(
    userId: string,
    meetingId: string,
    provider: TelemedicineProvider
  ): Promise<void> {
     // No-op or error
     console.warn('TelemedicineService.deleteMeeting called but service is disabled.');
  }

  /**
   * Get recording consent text
   */
  static async getConsentText(userId: string): Promise<string> {
    const settings = await this.getSettings(userId);
    return settings?.consent_text || '이 상담은 품질 향상을 위해 녹화될 수 있습니다. 녹화에 동의하시나요?';
  }
}

