/**
 * Google Meet API Integration
 * Handles Google Meet link generation and management
 * 
 * Note: Google Meet doesn't have a direct API for creating meetings.
 * We use Google Calendar API to create calendar events with Meet links.
 */

export interface GoogleMeetConfig {
  summary: string;
  description?: string;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  timezone?: string;
  attendees?: Array<{ email: string; displayName?: string }>;
  location?: string;
}

export interface GoogleMeetEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  hangoutLink?: string; // Google Meet link
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: { type: string };
    };
  };
  attendees?: Array<{ email: string; displayName?: string; responseStatus: string }>;
}

export interface GoogleMeetRecording {
  id: string;
  meetingId: string;
  recordingUrl: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export class GoogleMeetService {
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private accessToken?: string;
  private tokenExpiresAt?: Date;

  constructor(config: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    accessToken?: string;
    tokenExpiresAt?: Date;
  }) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.refreshToken = config.refreshToken;
    this.accessToken = config.accessToken;
    this.tokenExpiresAt = config.tokenExpiresAt;
  }

  /**
   * Get OAuth access token using refresh token
   */
  private async getAccessToken(): Promise<string> {
    // If we have a valid token, return it
    if (this.accessToken && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
      return this.accessToken;
    }

    // Refresh the token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh Google token: ${error}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiresAt = new Date(Date.now() + (data.expires_in - 60) * 1000); // Refresh 1 min early
    return this.accessToken;
  }

  /**
   * Create a Google Calendar event with Meet link
   */
  async createMeeting(config: GoogleMeetConfig): Promise<GoogleMeetEvent> {
    const token = await this.getAccessToken();
    
    // Generate a unique request ID for the conference
    const requestId = `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const event: Partial<GoogleMeetEvent> = {
      summary: config.summary,
      description: config.description,
      start: {
        dateTime: config.startTime,
        timeZone: config.timezone || 'Asia/Seoul',
      },
      end: {
        dateTime: config.endTime,
        timeZone: config.timezone || 'Asia/Seoul',
      },
      attendees: config.attendees?.map(a => ({
        email: a.email,
        displayName: a.displayName,
        responseStatus: 'needsAction',
      })),
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create Google Meet: ${JSON.stringify(error)}`);
    }

    const createdEvent = await response.json();
    return createdEvent;
  }

  /**
   * Get event details
   */
  async getMeeting(eventId: string): Promise<GoogleMeetEvent> {
    const token = await this.getAccessToken();
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get Google Meet event: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }

  /**
   * Update event
   */
  async updateMeeting(eventId: string, updates: Partial<GoogleMeetConfig>): Promise<GoogleMeetEvent> {
    const token = await this.getAccessToken();
    
    const event: Partial<GoogleMeetEvent> = {};
    if (updates.summary) event.summary = updates.summary;
    if (updates.description) event.description = updates.description;
    if (updates.startTime) {
      event.start = {
        dateTime: updates.startTime,
        timeZone: updates.timezone || 'Asia/Seoul',
      };
    }
    if (updates.endTime) {
      event.end = {
        dateTime: updates.endTime,
        timeZone: updates.timezone || 'Asia/Seoul',
      };
    }

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update Google Meet event: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }

  /**
   * Delete event
   */
  async deleteMeeting(eventId: string): Promise<void> {
    const token = await this.getAccessToken();
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete Google Meet event: ${error}`);
    }
  }

  /**
   * Generate a simple Meet link (without Calendar API)
   * This is a fallback method that generates a Meet link without creating a calendar event
   */
  generateMeetLink(): string {
    // Google Meet allows generating links without API
    // Format: https://meet.google.com/xxx-xxxx-xxx
    const randomId = Math.random().toString(36).substr(2, 9);
    return `https://meet.google.com/${randomId}`;
  }
}

