/**
 * CSV 환자 데이터 가져오기 API
 * 
 * POST /api/patients/import
 * - 여러 환자 데이터를 한 번에 등록
 * - 중복 전화번호 처리 (건너뛰기/업데이트)
 * - RLS 정책 준수
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { CreatePatientInput } from '@/lib/patients';

interface ImportRequestBody {
  patients: CreatePatientInput[];
  updateDuplicates: boolean; // true면 중복 시 업데이트, false면 건너뛰기
}

interface ImportResult {
  success: number;
  failed: number;
  skipped: number;
  updated: number;
  errors: Array<{
    phone: string;
    error: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }
    
    // Supabase 클라이언트
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase가 설정되지 않았습니다' },
        { status: 500 }
      );
    }
    
    // 요청 데이터 파싱
    const body: ImportRequestBody = await request.json();
    const { patients, updateDuplicates } = body;
    
    if (!Array.isArray(patients) || patients.length === 0) {
      return NextResponse.json(
        { error: '환자 데이터가 필요합니다' },
        { status: 400 }
      );
    }
    
    // 결과 추적
    const result: ImportResult = {
      success: 0,
      failed: 0,
      skipped: 0,
      updated: 0,
      errors: [],
    };
    
    // 기존 환자 전화번호 조회 (중복 체크용)
    const existingPatientsResult = await supabase
      .from('patients')
      .select('id, phone')
      .eq('user_id', userId);
    
    const existingPatientsMap = new Map<string, string>();
    if (existingPatientsResult.data) {
      existingPatientsResult.data.forEach(patient => {
        existingPatientsMap.set(patient.phone, patient.id);
      });
    }
    
    // 각 환자 데이터 처리
    for (const patientData of patients) {
      try {
        const existingPatientId = existingPatientsMap.get(patientData.phone);
        
        if (existingPatientId) {
          // 중복 환자
          if (updateDuplicates) {
            // 업데이트
            const { error: updateError } = await supabase
              .from('patients')
              .update({
                ...patientData,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingPatientId)
              .eq('user_id', userId);
            
            if (updateError) {
              result.failed++;
              result.errors.push({
                phone: patientData.phone,
                error: `업데이트 실패: ${updateError.message}`,
              });
            } else {
              result.updated++;
            }
          } else {
            // 건너뛰기
            result.skipped++;
          }
        } else {
          // 새 환자 등록
          const { error: insertError } = await supabase
            .from('patients')
            .insert({
              user_id: userId,
              ...patientData,
            });
          
          if (insertError) {
            result.failed++;
            result.errors.push({
              phone: patientData.phone,
              error: `등록 실패: ${insertError.message}`,
            });
          } else {
            result.success++;
          }
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          phone: patientData.phone,
          error: error instanceof Error ? error.message : '알 수 없는 오류',
        });
      }
    }
    
    // 최종 결과 반환
    return NextResponse.json({
      message: '가져오기 완료',
      result,
    });
    
  } catch (error) {
    console.error('CSV 가져오기 오류:', error);
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

