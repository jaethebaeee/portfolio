import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TelemedicineService, TelemedicineMeetingConfig } from '@/lib/telemedicine';
import { createServerClient } from '@/lib/supabase';
import { getAppointment, updateAppointment } from '@/lib/appointments';

/**
 * POST /api/telemedicine/appointments
 * Create a telemedicine appointment
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      appointment_id,
      provider,
      duration_minutes = 30,
      require_password = true,
      waiting_room = true,
      auto_record = false,
      recording_consent = false,
    } = body;

    if (!appointment_id) {
      return NextResponse.json({ error: 'appointment_id is required' }, { status: 400 });
    }

    // Get appointment details
    const appointment = await getAppointment(userId, appointment_id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Get patient details
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('id', appointment.patient_id)
      .single();

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Create meeting
    const meetingConfig: TelemedicineMeetingConfig = {
      provider: provider || 'zoom',
      title: `상담 - ${patient.name}님`,
      description: `예약일시: ${appointment.appointment_date} ${appointment.appointment_time}`,
      startTime: new Date(`${appointment.appointment_date}T${appointment.appointment_time}`).toISOString(),
      durationMinutes: duration_minutes,
      patientEmail: patient.email,
      patientName: patient.name,
      requirePassword: require_password,
      waitingRoom: waiting_room,
      autoRecord: auto_record,
      recordingConsent: recording_consent,
    };

    const meeting = await TelemedicineService.createMeeting(userId, meetingConfig);

    // Update appointment with meeting info
    const updatedAppointment = await updateAppointment(userId, appointment_id, {
      is_telemedicine: true,
      video_provider: meeting.provider,
      meeting_id: meeting.meetingId,
      meeting_url: meeting.meetingUrl,
      meeting_password: meeting.password,
      recording_consent: recording_consent,
      video_metadata: meeting.metadata,
    });

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      meeting: {
        url: meeting.meetingUrl,
        password: meeting.password,
        provider: meeting.provider,
      },
    });
  } catch (error: any) {
    console.error('Telemedicine appointment creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create telemedicine appointment' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/telemedicine/appointments/[id]
 * Update telemedicine appointment
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { appointment_id, updates } = body;

    if (!appointment_id) {
      return NextResponse.json({ error: 'appointment_id is required' }, { status: 400 });
    }

    const appointment = await getAppointment(userId, appointment_id);
    if (!appointment || !appointment.is_telemedicine) {
      return NextResponse.json({ error: 'Telemedicine appointment not found' }, { status: 404 });
    }

    // Update meeting on provider side
    if (updates.startTime || updates.durationMinutes || updates.title) {
      await TelemedicineService.updateMeeting(
        userId,
        appointment.meeting_id!,
        appointment.video_provider as 'zoom' | 'google_meet',
        updates
      );
    }

    // Update appointment in database
    const updatedAppointment = await updateAppointment(userId, appointment_id, {
      meeting_url: updates.meetingUrl,
      recording_consent: updates.recordingConsent,
    });

    return NextResponse.json({ success: true, appointment: updatedAppointment });
  } catch (error: any) {
    console.error('Telemedicine appointment update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update telemedicine appointment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/telemedicine/appointments/[id]
 * Cancel telemedicine appointment
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const appointment_id = searchParams.get('appointment_id');

    if (!appointment_id) {
      return NextResponse.json({ error: 'appointment_id is required' }, { status: 400 });
    }

    const appointment = await getAppointment(userId, appointment_id);
    if (!appointment || !appointment.is_telemedicine || !appointment.meeting_id) {
      return NextResponse.json({ error: 'Telemedicine appointment not found' }, { status: 404 });
    }

    // Delete meeting on provider side
    await TelemedicineService.deleteMeeting(
      userId,
      appointment.meeting_id,
      appointment.video_provider as 'zoom' | 'google_meet'
    );

    // Update appointment
    await updateAppointment(userId, appointment_id, {
      is_telemedicine: false,
      meeting_id: null,
      meeting_url: null,
      meeting_password: null,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Telemedicine appointment deletion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete telemedicine appointment' },
      { status: 500 }
    );
  }
}

