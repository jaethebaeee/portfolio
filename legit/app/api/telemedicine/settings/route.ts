import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/telemedicine/settings
 * Get telemedicine settings
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('telemedicine_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Don't return sensitive credentials
    if (data) {
      delete data.zoom_api_secret;
      delete data.zoom_access_token;
      delete data.google_client_secret;
      delete data.google_refresh_token;
      delete data.google_access_token;
    }

    return NextResponse.json({ settings: data || null });
  } catch (error: any) {
    console.error('Get telemedicine settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/telemedicine/settings
 * Create or update telemedicine settings
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      default_provider,
      zoom_api_key,
      zoom_api_secret,
      zoom_account_id,
      google_client_id,
      google_client_secret,
      google_refresh_token,
      default_duration_minutes,
      auto_record,
      require_password,
      waiting_room_enabled,
      require_recording_consent,
      consent_text,
    } = body;

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Check if settings exist
    const { data: existing } = await supabase
      .from('telemedicine_settings')
      .select('id')
      .eq('user_id', userId)
      .single();

    const settingsData: any = {
      user_id: userId,
      default_provider: default_provider || 'zoom',
      default_duration_minutes: default_duration_minutes || 30,
      auto_record: auto_record ?? false,
      require_password: require_password ?? true,
      waiting_room_enabled: waiting_room_enabled ?? true,
      require_recording_consent: require_recording_consent ?? true,
      consent_text: consent_text || '이 상담은 품질 향상을 위해 녹화될 수 있습니다. 녹화에 동의하시나요?',
    };

    // Only update credentials if provided
    if (zoom_api_key) settingsData.zoom_api_key = zoom_api_key;
    if (zoom_api_secret) settingsData.zoom_api_secret = zoom_api_secret;
    if (zoom_account_id) settingsData.zoom_account_id = zoom_account_id;
    if (google_client_id) settingsData.google_client_id = google_client_id;
    if (google_client_secret) settingsData.google_client_secret = google_client_secret;
    if (google_refresh_token) settingsData.google_refresh_token = google_refresh_token;

    let data, error;
    if (existing) {
      // Update existing
      ({ data, error } = await supabase
        .from('telemedicine_settings')
        .update(settingsData)
        .eq('user_id', userId)
        .select()
        .single());
    } else {
      // Insert new
      ({ data, error } = await supabase
        .from('telemedicine_settings')
        .insert(settingsData)
        .select()
        .single());
    }

    if (error) {
      throw error;
    }

    // Don't return sensitive credentials
    delete data.zoom_api_secret;
    delete data.zoom_access_token;
    delete data.google_client_secret;
    delete data.google_refresh_token;
    delete data.google_access_token;

    return NextResponse.json({ success: true, settings: data });
  } catch (error: any) {
    console.error('Update telemedicine settings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}

