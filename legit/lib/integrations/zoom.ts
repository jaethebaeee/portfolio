/**
 * Zoom API Integration
 * Handles Zoom meeting creation, management, and recording
 */

export interface ZoomMeetingConfig {
  topic: string;
  type: 1 | 2 | 3 | 8; // 1=Instant, 2=Scheduled, 3=Recurring, 8=RecurringNoFixed
  start_time?: string; // ISO 8601 format
  duration?: number; // minutes
  timezone?: string;
  password?: string;
  agenda?: string;
  settings?: {
    host_video?: boolean;
    participant_video?: boolean;
    join_before_host?: boolean;
    mute_upon_entry?: boolean;
    waiting_room?: boolean;
    auto_recording?: 'local' | 'cloud' | 'none';
    approval_type?: 0 | 1 | 2; // 0=Automatically, 1=Manually, 2=No registration
  };
}

export interface ZoomMeeting {
  id: string;
  uuid: string;
  host_id: string;
  topic: string;
  type: number;
  start_time: string;
  duration: number;
  timezone: string;
  created_at: string;
  join_url: string;
  start_url: string;
  password?: string;
  settings: {
    host_video: boolean;
    participant_video: boolean;
    join_before_host: boolean;
    mute_upon_entry: boolean;
    waiting_room: boolean;
    auto_recording: string;
  };
}

export interface ZoomRecording {
  id: string;
  meeting_id: string;
  recording_start: string;
  recording_end: string;
  file_type: string;
  file_size: number;
  play_url: string;
  download_url: string;
  status: string;
}

export class ZoomService {
  private apiKey: string;
  private apiSecret: string;
  private accountId?: string;
  private accessToken?: string;
  private tokenExpiresAt?: Date;

  constructor(config: {
    apiKey: string;
    apiSecret: string;
    accountId?: string;
    accessToken?: string;
    tokenExpiresAt?: Date;
  }) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.accountId = config.accountId;
    this.accessToken = config.accessToken;
    this.tokenExpiresAt = config.tokenExpiresAt;
  }

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.accessToken && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
      return this.accessToken;
    }

    // For Server-to-Server OAuth (recommended for production)
    if (this.accountId) {
      const token = await this.getServerToServerToken();
      this.accessToken = token.access_token;
      this.tokenExpiresAt = new Date(Date.now() + (token.expires_in - 60) * 1000); // Refresh 1 min early
      return this.accessToken;
    }

    // Fallback to basic auth (deprecated but works for testing)
    const credentials = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');
    return credentials;
  }

  /**
   * Get Server-to-Server OAuth token
   */
  private async getServerToServerToken(): Promise<{ access_token: string; expires_in: number }> {
    const response = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.accountId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get Zoom token: ${error}`);
    }

    return await response.json();
  }

  /**
   * Create a Zoom meeting
   */
  async createMeeting(config: ZoomMeetingConfig): Promise<ZoomMeeting> {
    const token = await this.getAccessToken();
    const userId = await this.getUserId();

    const response = await fetch(`https://api.zoom.us/v2/users/${userId}/meetings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create Zoom meeting: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }

  /**
   * Get Zoom user ID (for meeting creation)
   */
  private async getUserId(): Promise<string> {
    const token = await this.getAccessToken();
    const response = await fetch('https://api.zoom.us/v2/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // If we can't get user info, try using account email or default to 'me'
      return 'me';
    }

    const user = await response.json();
    return user.id || 'me';
  }

  /**
   * Get meeting details
   */
  async getMeeting(meetingId: string): Promise<ZoomMeeting> {
    const token = await this.getAccessToken();
    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get Zoom meeting: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }

  /**
   * Update meeting
   */
  async updateMeeting(meetingId: string, updates: Partial<ZoomMeetingConfig>): Promise<void> {
    const token = await this.getAccessToken();
    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update Zoom meeting: ${JSON.stringify(error)}`);
    }
  }

  /**
   * Delete meeting
   */
  async deleteMeeting(meetingId: string): Promise<void> {
    const token = await this.getAccessToken();
    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete Zoom meeting: ${JSON.stringify(error)}`);
    }
  }

  /**
   * Get meeting recordings
   */
  async getRecordings(meetingId: string): Promise<ZoomRecording[]> {
    const token = await this.getAccessToken();
    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}/recordings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get Zoom recordings: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.recording_files || [];
  }

  /**
   * Delete recording
   */
  async deleteRecording(meetingId: string, recordingId: string): Promise<void> {
    const token = await this.getAccessToken();
    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}/recordings/${recordingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete Zoom recording: ${JSON.stringify(error)}`);
    }
  }
}

