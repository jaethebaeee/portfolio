import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { parse } from 'json2csv';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Fetch all patient data for the user
    // In a real scenario, we might need to paginate or stream for large datasets
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (format === 'csv') {
      const fields = [
        'name', 'phone', 'birth_date', 'gender', 
        'last_visit_date', 'last_surgery_date', 'notes',
        'marketing_consent', 'privacy_consent', 'consent_date',
        'created_at'
      ];
      
      const csv = parse(patients, { fields });
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="patients_export_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      return NextResponse.json({
        exported_at: new Date().toISOString(),
        count: patients.length,
        data: patients
      });
    }

  } catch (error: any) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

