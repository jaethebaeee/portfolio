import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { normalizePhone } from '@/lib/utils/phone';

// 네이버 예약 상태 매핑
const NAVER_STATUS_MAP: Record<string, string> = {
  'REQUESTED': 'scheduled',
  'CONFIRMED': 'scheduled',
  'COMPLETED': 'completed',
  'CANCELLED': 'cancelled',
  'NOSHOW': 'noshow'
};

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bookings } = body;

    // 네이버 예약 데이터 구조 (예상)
    // 실제 데이터 구조는 XHR 응답 확인 후 조정 필요
    const items = Array.isArray(bookings) ? bookings : bookings.items || [];

    let syncedCount = 0;

    for (const item of items) {
      // 1. 환자 찾기 또는 생성
      // 네이버는 안심번호(050)를 줄 수도 있어서 실번호 확인 필요
      const rawPhone = item.booker?.phone || item.phone;
      const name = item.booker?.name || item.name;
      
      let patientId: string | null = null;

      if (rawPhone) {
        const phone = normalizePhone(rawPhone);

        // 기존 환자 검색
        const { data: existingPatient } = await supabase
          .from('patients')
          .select('id')
          .eq('user_id', userId)
          .eq('phone', phone)
          .single();

        if (existingPatient) {
          patientId = existingPatient.id;
        } else {
          // 새 환자 생성
          const { data: newPatient } = await supabase
            .from('patients')
            .insert({
              user_id: userId,
              name: name || 'Naver Guest',
              phone: phone,
              notes: 'Imported from Naver Booking'
            })
            .select()
            .single();
          
          if (newPatient) patientId = newPatient.id;
        }
      }

      if (!patientId) continue;

      // 2. 예약 동기화
      const bookingDate = new Date(item.startDateTime || item.bookingDate);
      const mappedStatus = NAVER_STATUS_MAP[item.bookingStatus] || 'scheduled';

      const { error } = await supabase
        .from('appointments')
        .upsert({
          user_id: userId,
          patient_id: patientId,
          naver_booking_id: item.bookingId?.toString(),
          appointment_date: bookingDate.toISOString().split('T')[0],
          appointment_time: bookingDate.toTimeString().slice(0, 5),
          status: mappedStatus,
          type: item.productName || 'Naver Booking',
          notes: item.userComment || ''
        }, {
          onConflict: 'naver_booking_id'
        });

      if (!error) syncedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      synced: syncedCount,
      message: `${syncedCount} bookings synced` 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    if (process.env.NODE_ENV === 'development') {
      console.error('Sync Error:', error);
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

