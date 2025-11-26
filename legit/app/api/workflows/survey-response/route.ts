import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * Workflow Survey Response API
 * Handles survey responses from workflow nodes (cancellation reasons, patient feedback, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      user_id,
      patient_id, 
      workflow_id,
      node_id,
      appointment_id,
      survey_type, // 'cancellation_reason', 'patient_feedback', 'satisfaction'
      response_value, // Category/code value
      response_text, // Human-readable text
    } = body;

    if (!user_id || !patient_id || !workflow_id || !survey_type || !response_value) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Store survey response in patient_responses table
    const { data: responseData, error: responseError } = await supabase
      .from('patient_responses')
      .insert({
        user_id,
        patient_id,
        workflow_id,
        step_index: null, // For visual workflows, we use node_id instead
        response_type: survey_type,
        response_value: response_value,
        severity_level: 'normal', // Survey responses are typically normal
        is_reviewed: false,
        // Store additional metadata in a JSONB field if available
        // For now, we'll use response_value for the category and add response_text if needed
      })
      .select()
      .single();

    if (responseError) {
      throw responseError;
    }

    // If this is a cancellation reason survey, update the appointment
    if (survey_type === 'cancellation_reason' && appointment_id) {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          cancellation_reason: response_text || response_value,
          cancellation_reason_category: response_value,
        })
        .eq('id', appointment_id)
        .eq('user_id', user_id);

      if (updateError) {
        console.error('Failed to update appointment cancellation reason:', updateError);
        // Don't fail the whole request if appointment update fails
      }
    }

    // Store in patient's cancellation history (handled by database trigger, but we can also do it here)
    if (survey_type === 'cancellation_reason') {
      // The database trigger should handle this, but we can also update manually if needed
      const { data: patient } = await supabase
        .from('patients')
        .select('cancellation_history')
        .eq('id', patient_id)
        .single();

      if (patient) {
        const history = (patient.cancellation_history as any[]) || [];
        const newEntry = {
          appointment_id: appointment_id || null,
          date: new Date().toISOString(),
          reason_category: response_value,
          reason: response_text || response_value,
          workflow_id,
          node_id,
        };

        await supabase
          .from('patients')
          .update({
            cancellation_history: [...history, newEntry]
          })
          .eq('id', patient_id);
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: responseData,
      message: 'Survey response recorded successfully'
    });
  } catch (error: unknown) {
    console.error('Workflow Survey Response Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Server Error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

