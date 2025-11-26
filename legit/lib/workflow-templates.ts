/**
 * 안과·성형외과 클리닉 특화 워크플로우 템플릿
 */

import { Node, Edge } from '@xyflow/react';
import { WorkflowNodeData } from './workflow-types';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: '안과' | '성형외과' | '피부과' | '공통';
  specialty?: string; // 세부 전문과목
  targetSurgery?: string;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  tags?: string[]; // 태그 배열
  isPublic?: boolean; // 공개 여부
  isFeatured?: boolean; // 추천 템플릿 여부
  ratingAverage?: number; // 평균 평점
  ratingCount?: number; // 평점 개수
  usageCount?: number; // 사용 횟수
}

/**
 * 기본 워크플로우 템플릿들
 */
export const workflowTemplates: WorkflowTemplate[] = [
  // --- 안과 (Ophthalmology) ---
  {
    id: 'lasik-comprehensive-care',
    name: '라식/라섹 종합 케어 (30일)',
    description: '수술 직후부터 30일까지 단계별 회복 지도와 주의사항을 상세히 안내합니다.',
    category: '안과',
    targetSurgery: 'lasik',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { type: 'trigger', label: '라식/라섹 수술 완료', triggerType: 'surgery_completed' },
      },
      // Day 0 - 수술 당일
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 150 },
        data: { type: 'delay', label: '수술 당일 저녁 (6시간 후)', delay: { type: 'hours', value: 6 } },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 250 },
        data: {
          type: 'action',
          label: '수술 당일 안약 지도',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 당일입니다.

[✅ 해야 할 일]
• 처방받으신 안약을 정확한 시간에 점안하세요
• 보호안경을 착용하고 집에서 휴식하세요

[❌ 하지 말아야 할 일]
• TV, 스마트폰, 컴퓨터 사용 자제
• 세안, 샤워 금지 (얼굴에 물 닿지 않게)
• 화장, 향수 사용 금지
• 무거운 물건 들기 금지

통증이나 이상 증상이 있으시면 즉시 연락주세요.`
        },
      },
      // Day 1 - 다음날
      {
        id: 'delay-2',
        type: 'delay',
        position: { x: 250, y: 350 },
        data: { type: 'delay', label: '수술 다음날 (D+1)', delay: { type: 'days', value: 1 } },
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 250, y: 450 },
        data: {
          type: 'action',
          label: 'D+1 검진 및 주의사항',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 후 첫날입니다.

[✅ 해야 할 일]
• 예약된 검진 시간에 방문해주세요
• 안약을 규칙적으로 점안하세요

[❌ 하지 말아야 할 일]
• 운전 금지 (시력 회복 전까지)
• 눈 비비기, 문지르기 금지
• 찬바람, 먼지 많은 곳 피하기
• 격한 운동, 사우나 금지

오늘 검진에서 회복 상태를 확인합니다.`
        },
      },
      // Day 3 - 염증 최고조
      {
        id: 'delay-3',
        type: 'delay',
        position: { x: 250, y: 550 },
        data: { type: 'delay', label: 'D+3 염증 관리', delay: { type: 'days', value: 2 } },
      },
      {
        id: 'action-3',
        type: 'action',
        position: { x: 250, y: 650 },
        data: {
          type: 'action',
          label: '염증 최고조기 관리',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 3일차입니다. 염증이 가장 심한 시기입니다.

[✅ 해야 할 일]
• 냉찜질로 염증 완화 (1회 10분, 1일 3-4회)
• 안약을 시간 엄수해서 점안
• 충분한 수면 취하기

[❌ 하지 말아야 할 일]
• 화장품, 샴푸 사용 금지
• 헤어드라이어 뜨거운 바람 피하기
• 흡연, 음주 절대 금지
• 커피, 자극적인 음식 피하기

불편함이 심하시면 진통제 복용 후 연락주세요.`
        },
      },
      // Day 7 - 일상 복귀 시작
      {
        id: 'delay-4',
        type: 'delay',
        position: { x: 250, y: 750 },
        data: { type: 'delay', label: 'D+7 일상 복귀', delay: { type: 'days', value: 4 } },
      },
      {
        id: 'action-4',
        type: 'action',
        position: { x: 250, y: 850 },
        data: {
          type: 'action',
          label: '일상생활 재개 지도',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 1주일이 지났습니다.

[✅ 이제 할 수 있는 일]
• 가벼운 샤워 가능 (머리 감을 때 눈 꼭 감고 물 피하기)
• 가벼운 독서나 업무 가능
• 부드러운 화장품 사용 가능

[⚠️ 여전히 조심해야 할 일]
• 수영장, 사우나, 목욕탕 금지 (최소 1개월)
• 콘택트렌즈 착용 금지 (최소 1개월)
• 격한 운동 자제
• 눈 부위 마사지 금지

다음 검진 예약을 확인해주세요.`
        },
      },
      // Day 30 - 최종 회복
      {
        id: 'delay-5',
        type: 'delay',
        position: { x: 250, y: 950 },
        data: { type: 'delay', label: 'D+30 최종 회복', delay: { type: 'days', value: 23 } },
      },
      {
        id: 'action-5',
        type: 'action',
        position: { x: 250, y: 1050 },
        data: {
          type: 'action',
          label: '최종 회복 안내',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 1개월이 지났습니다!

[✅ 이제 정상 생활 가능]
• 모든 일상 활동 가능
• 수영, 사우나 가능
• 콘택트렌즈 착용 가능

[📋 정기 검진 권장]
• 3개월, 6개월, 1년 후 검진 권장
• 시력 변화 있으면 즉시 내원

수술 결과에 만족하셨기를 바랍니다. 궁금한 점 있으시면 언제든 연락주세요!`
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'delay-1' },
      { id: 'e2-3', source: 'delay-1', target: 'action-1' },
      { id: 'e3-4', source: 'action-1', target: 'delay-2' },
      { id: 'e4-5', source: 'delay-2', target: 'action-2' },
      { id: 'e5-6', source: 'action-2', target: 'delay-3' },
      { id: 'e6-7', source: 'delay-3', target: 'action-3' },
      { id: 'e7-8', source: 'action-3', target: 'delay-4' },
      { id: 'e8-9', source: 'delay-4', target: 'action-4' },
      { id: 'e9-10', source: 'action-4', target: 'delay-5' },
      { id: 'e10-11', source: 'delay-5', target: 'action-5' },
    ],
  },
  {
    id: 'cataract-comprehensive-care',
    name: '백내장 수술 종합 케어 (30일)',
    description: '백내장 수술 후 감염 예방, 시력 회복, 정기 검진까지 단계별 상세 케어를 제공합니다.',
    category: '안과',
    targetSurgery: 'cataract',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { type: 'trigger', label: '백내장 수술 완료', triggerType: 'surgery_completed' },
      },
      // Day 0 - 수술 당일
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 150 },
        data: { type: 'delay', label: '수술 당일 저녁', delay: { type: 'hours', value: 6 } },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 250 },
        data: {
          type: 'action',
          label: '수술 당일 보호 및 안약',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 백내장 수술 당일입니다.

[✅ 즉시 해야 할 일]
• 보호안대를 착용하고 휴식하세요
• 처방받으신 안약을 정확히 점안하세요
• 통증 있으면 진통제 복용하세요

[❌ 절대 금지사항]
• 보호안대 벗기 금지
• 눈 비비기, 만지기 금지
• 세수, 샤워 금지
• 무거운 물건 들기 금지

수술 부위에 이상 증상(출혈, 심한 통증)이 있으면 즉시 연락주세요.`
        },
      },
      // Day 1 - 첫 검진
      {
        id: 'delay-2',
        type: 'delay',
        position: { x: 250, y: 350 },
        data: { type: 'delay', label: 'D+1 첫 검진', delay: { type: 'days', value: 1 } },
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 250, y: 450 },
        data: {
          type: 'action',
          label: '첫 검진 및 일상 지도',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 후 첫날입니다.

[✅ 검진 당일 준비사항]
• 예약 시간 10분 전 도착
• 보호안대 착용하고 내원
• 동반 보호자 동행 권장

[🏠 집에서 할 수 있는 일]
• 가벼운 독서나 TV 시청 가능
• 안약 규칙적으로 점안
• 충분한 수면 취하기

[🚫 여전히 금지사항]
• 운전 절대 금지
• 무거운 집안일 금지
• 목욕, 사우나 금지

오늘 검진에서 수술 상태를 확인합니다.`
        },
      },
      // Day 3 - 염증 감시
      {
        id: 'delay-3',
        type: 'delay',
        position: { x: 250, y: 550 },
        data: { type: 'delay', label: 'D+3 염증 모니터링', delay: { type: 'days', value: 2 } },
      },
      {
        id: 'action-3',
        type: 'action',
        position: { x: 250, y: 650 },
        data: {
          type: 'action',
          label: '염증 징후 모니터링',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 3일차입니다.

[⚠️ 즉시 확인해야 할 증상]
• 눈 충혈이 심해지는 경우
• 시력 갑자기 떨어지는 경우
• 심한 통증이나 압통
• 시야에 검은 점이나 번개 같은 빛

[✅ 계속 유지할 습관]
• 안약 정확한 시간에 점안
• 보호안대 밤에 착용
• 외출 시 선글라스 착용

[❌ 피해야 할 상황]
• 먼지 많은 곳 외출
• 화장품, 샴푸 사용
• 흡연 장소 근처

이상 증상이 있으시면 즉시 연락주세요.`
        },
      },
      // Day 7 - 1주 검진
      {
        id: 'delay-4',
        type: 'delay',
        position: { x: 250, y: 750 },
        data: { type: 'delay', label: 'D+7 정기 검진', delay: { type: 'days', value: 4 } },
      },
      {
        id: 'action-4',
        type: 'action',
        position: { x: 250, y: 850 },
        data: {
          type: 'action',
          label: '1주일 검진 안내',
          actionType: 'send_sms',
          message_template: '{{patient_name}}님, 수술 1주일 경과 검진 예약일을 확인해주세요. 시력 회복 상태를 확인합니다.'
        },
      },
      // Day 14 - 2주 후 관리
      {
        id: 'delay-5',
        type: 'delay',
        position: { x: 250, y: 950 },
        data: { type: 'delay', label: 'D+14 회복 점검', delay: { type: 'days', value: 7 } },
      },
      {
        id: 'action-5',
        type: 'action',
        position: { x: 250, y: 1050 },
        data: {
          type: 'action',
          label: '2주 회복 상태 점검',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 2주가 지났습니다.

[✅ 회복 진행 상황]
• 대부분의 통증과 불편함 호전
• 시력 점차 안정화
• 일상생활 대부분 가능

[💡 생활 지도]
• 가벼운 운동 가능 (걷기, 스트레칭)
• 세수할 때 눈 감고 조심히 하기
• TV, 컴퓨터 장시간 사용 피하기

[📅 다음 일정]
• 1개월 검진 예약 확인
• 시력 불편함 있으면 조기 내원

시력 회복이 잘 진행되고 있으신가요?`
        },
      },
      // Day 30 - 최종 회복
      {
        id: 'delay-6',
        type: 'delay',
        position: { x: 250, y: 1150 },
        data: { type: 'delay', label: 'D+30 최종 평가', delay: { type: 'days', value: 16 } },
      },
      {
        id: 'action-6',
        type: 'action',
        position: { x: 250, y: 1250 },
        data: {
          type: 'action',
          label: '최종 회복 및 검진',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 1개월이 되었습니다!

[✅ 이제 가능한 일들]
• 모든 일상 활동 정상화
• 운전 가능 (시력 안정 시)
• 운동, 사우나 제한 해제

[📋 장기 관리]
• 3개월, 6개월 정기 검진
• 백내장 진행 시력에 따라 추가 수술 고려
• 안약 장기 복용 필요 시 안내

[🎯 최종 목표]
수술 전보다 더 좋은 시력 회복!

수술 결과에 만족하셨기를 바랍니다. 궁금한 점 언제든 연락주세요.`
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'delay-1' },
      { id: 'e2-3', source: 'delay-1', target: 'action-1' },
      { id: 'e3-4', source: 'action-1', target: 'delay-2' },
      { id: 'e4-5', source: 'delay-2', target: 'action-2' },
      { id: 'e5-6', source: 'action-2', target: 'delay-3' },
      { id: 'e6-7', source: 'delay-3', target: 'action-3' },
      { id: 'e7-8', source: 'action-3', target: 'delay-4' },
      { id: 'e8-9', source: 'delay-4', target: 'action-4' },
      { id: 'e9-10', source: 'action-4', target: 'delay-5' },
      { id: 'e10-11', source: 'delay-5', target: 'action-5' },
      { id: 'e11-12', source: 'delay-5', target: 'action-6' },
      { id: 'e12-13', source: 'delay-6', target: 'action-6' },
    ],
  },

  // --- 성형외과 (Plastic Surgery) ---
  {
    id: 'rhinoplasty-comprehensive-care',
    name: '코성형 종합 회복 케어 (60일)',
    description: '코성형 후 붓기 관리부터 최종 형태 완성까지 60일간 단계별 회복 지도를 제공합니다.',
    category: '성형외과',
    targetSurgery: 'rhinoplasty',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { type: 'trigger', label: '코성형 수술 완료', triggerType: 'surgery_completed' },
      },
      // Day 0 - 수술 당일
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 150 },
        data: { type: 'delay', label: '수술 당일 저녁', delay: { type: 'hours', value: 6 } },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 250 },
        data: {
          type: 'action',
          label: '수술 당일 냉찜질 및 자세',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 코성형 수술 당일입니다.

[🧊 즉시 해야 할 일 - 냉찜질]
• 얼음팩으로 코 부위 냉찜질 시작
• 1회 10분, 1시간 간격으로 반복
• 수술 후 3일간 냉찜질 유지

[🛏️ 수면 자세]
• 머리를 심장보다 높게 유지 (베개 2-3개 사용)
• 옆으로 누워 자지 말고 등을 대고 자세요

[❌ 절대 금지사항]
• 코 만지기, 문지르기 금지
• 세수, 샤워 금지 (얼굴에 물 닿지 않게)
• 코 풀기, 재채기 세게 하기 금지
• 무거운 물건 들기 금지

통증이 심하시면 진통제 복용 후 연락주세요.`
        },
      },
      // Day 1 - 첫날 관리
      {
        id: 'delay-2',
        type: 'delay',
        position: { x: 250, y: 350 },
        data: { type: 'delay', label: 'D+1 첫 검진', delay: { type: 'days', value: 1 } },
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 250, y: 450 },
        data: {
          type: 'action',
          label: '첫 검진 및 붓기 관리',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 후 첫날입니다.

[✅ 검진 준비사항]
• 부목과 테이프 잘 고정되어 있는지 확인
• 통증 조절을 위한 진통제 복용
• 동반 보호자와 함께 내원

[🧊 붓기 관리 계속]
• 냉찜질 1일 4-5회 유지
• 코 높이 유지하며 휴식

[🚫 주의사항]
• 부목 젖히지 말고 그대로 유지
• 외출 자제, 집에서 휴식
• 짜게 먹지 말고 싱겔게 먹기

오늘 검진에서 회복 상태를 확인합니다.`
        },
      },
      // Day 3 - 냉→온 찜질 전환
      {
        id: 'delay-3',
        type: 'delay',
        position: { x: 250, y: 550 },
        data: { type: 'delay', label: 'D+3 온찜질 전환', delay: { type: 'days', value: 2 } },
      },
      {
        id: 'action-3',
        type: 'action',
        position: { x: 250, y: 650 },
        data: {
          type: 'action',
          label: '냉찜질에서 온찜질로 전환',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 3일차입니다.

[🔥 이제 온찜질 시작]
• 미지근한 물수건으로 온찜질
• 1회 10분, 1일 3회
• 혈액순환 돕고 붓기 감소

[💊 약물 관리]
• 처방받으신 약 규칙적으로 복용
• 항생제, 소염제 빠뜨리지 말기

[⚠️ 모니터링 할 증상]
• 출혈이 멎지 않는 경우
• 심한 통증이나 부기
• 고열이 나는 경우

이상 증상이 있으시면 즉시 연락주세요.`
        },
      },
      // Day 7 - 실밥 제거
      {
        id: 'delay-4',
        type: 'delay',
        position: { x: 250, y: 750 },
        data: { type: 'delay', label: 'D+7 실밥 제거', delay: { type: 'days', value: 4 } },
      },
      {
        id: 'action-4',
        type: 'action',
        position: { x: 250, y: 850 },
        data: {
          type: 'action',
          label: '실밥 제거 및 부목 확인',
          actionType: 'send_sms',
          message_template: '{{patient_name}}님, 내일 실밥 제거와 부목 교체 예정입니다. 예약 시간을 확인하시고 늦지 않게 방문해주세요.'
        },
      },
      // Day 14 - 2주 검진
      {
        id: 'delay-5',
        type: 'delay',
        position: { x: 250, y: 950 },
        data: { type: 'delay', label: 'D+14 중간 검진', delay: { type: 'days', value: 7 } },
      },
      {
        id: 'action-5',
        type: 'action',
        position: { x: 250, y: 1050 },
        data: {
          type: 'action',
          label: '2주 검진 및 회복 평가',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 2주가 지났습니다.

[📊 회복 진행 상황]
• 실밥 제거 후 상처 회복 중
• 붓기 서서히 감소
• 코 모양 점차 자연스러워짐

[💡 생활 지도]
• 가벼운 세안 가능 (물만 사용)
• 마스크 착용으로 자외선 차단
• 코 만지지 말고 그대로 유지

[📅 다음 일정]
• 1개월 검진 예약 확인
• 3개월, 6개월 추적 검진 계획

코 상태가 어떻게 느껴지시나요?`
        },
      },
      // Day 30 - 1개월 평가
      {
        id: 'delay-6',
        type: 'delay',
        position: { x: 250, y: 1150 },
        data: { type: 'delay', label: 'D+30 형태 평가', delay: { type: 'days', value: 16 } },
      },
      {
        id: 'action-6',
        type: 'action',
        position: { x: 250, y: 1250 },
        data: {
          type: 'action',
          label: '1개월 최종 형태 평가',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 1개월이 되었습니다!

[✅ 회복 마무리 단계]
• 붓기 대부분 사라짐
• 코 형태 안정화 진행 중
• 일상생활 거의 정상화

[🎯 최종 목표 달성]
• 6개월까지 형태 완성
• 1년까지 최종 안정화

[📋 장기 관리]
• 3개월, 6개월 추적 검진
• 생활 습관 유지 (충격 피하기)
• 정기 사진 촬영으로 변화 추적

만족스러운 결과를 위해 앞으로도 잘 관리해주세요!`
        },
      },
      // Day 60 - 최종 회복
      {
        id: 'delay-7',
        type: 'delay',
        position: { x: 250, y: 1350 },
        data: { type: 'delay', label: 'D+60 최종 회복', delay: { type: 'days', value: 30 } },
      },
      {
        id: 'action-7',
        type: 'action',
        position: { x: 250, y: 1450 },
        data: {
          type: 'action',
          label: '2개월 최종 회복 확인',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 2개월이 지났습니다!

[🎉 회복 완료 단계]
• 코 형태 최종 안정화
• 모든 일상 활동 가능
• 운동, 사우나 제한 해제

[📷 사진 촬영 권장]
• 수술 전후 비교 사진 촬영
• 만족도 평가 및 기록

[💬 피드백 요청]
수술 결과에 만족하셨나요? 개선되었으면 하는 점이 있으신가요?

수술 전 모습과 비교해보시고, 궁금한 점 있으시면 언제든 연락주세요!`
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'delay-1' },
      { id: 'e2-3', source: 'delay-1', target: 'action-1' },
      { id: 'e3-4', source: 'action-1', target: 'delay-2' },
      { id: 'e4-5', source: 'delay-2', target: 'action-2' },
      { id: 'e5-6', source: 'action-2', target: 'delay-3' },
      { id: 'e6-7', source: 'delay-3', target: 'action-3' },
      { id: 'e7-8', source: 'action-3', target: 'delay-4' },
      { id: 'e8-9', source: 'delay-4', target: 'action-4' },
      { id: 'e9-10', source: 'action-4', target: 'delay-5' },
      { id: 'e10-11', source: 'delay-5', target: 'action-5' },
      { id: 'e11-12', source: 'delay-5', target: 'delay-6' },
      { id: 'e12-13', source: 'delay-6', target: 'action-6' },
      { id: 'e13-14', source: 'action-6', target: 'delay-7' },
      { id: 'e14-15', source: 'delay-7', target: 'action-7' },
    ],
  },
  {
    id: 'blepharoplasty-care',
    name: '눈성형(쌍꺼풀) 관리',
    description: '쌍꺼풀 수술 후 붓기 관리 및 주의사항을 안내합니다.',
    category: '성형외과',
    targetSurgery: 'blepharoplasty_cos',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { type: 'trigger', label: '눈성형 수술 완료', triggerType: 'surgery_completed' },
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 150 },
        data: { type: 'delay', label: '다음날 (D+1)', delay: { type: 'days', value: 1 } },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 250 },
        data: { type: 'action', label: '소독 및 냉찜질 안내', actionType: 'send_kakao', message_template: '처방해드린 안연고를 하루 3회 발라주시고, 냉찜질을 수시로 해주세요.' },
      },
      {
        id: 'delay-2',
        type: 'delay',
        position: { x: 250, y: 350 },
        data: { type: 'delay', label: '수술 5일차', delay: { type: 'days', value: 4 } },
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 250, y: 450 },
        data: { type: 'action', label: '실밥 제거 안내', actionType: 'send_sms', message_template: '실밥 제거를 위해 내원해주셔야 합니다.' },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'delay-1' },
      { id: 'e2-3', source: 'delay-1', target: 'action-1' },
      { id: 'e3-4', source: 'action-1', target: 'delay-2' },
      { id: 'e4-5', source: 'delay-2', target: 'action-2' },
    ],
  },

  // --- 공통 (Common) ---
  {
    id: 'elderly-pre-visit-reminders',
    name: '고령 환자 예약 사전 리마인더',
    description: '예약 1주일 전부터 당일까지 단계별로 상세한 방문 준비 안내를 제공합니다.',
    category: '공통',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          type: 'trigger',
          label: '예약 완료',
          triggerType: 'appointment_created',
        },
      },
      // 1주일 전 - 기본 준비사항
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 150 },
        data: {
          type: 'condition',
          label: '고령 환자 확인',
          condition: {
            variable: 'age',
            operator: '>=',
            value: 65,
          },
        },
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 100, y: 250 },
        data: { type: 'delay', label: '1주일 전', delay: { type: 'days', value: -7 } },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 100, y: 350 },
        data: {
          type: 'action',
          label: '1주일 전 기본 안내',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, {{appointment_date}} 진료 예약이 1주일 남았습니다.

[📅 예약 정보]
• 날짜: {{appointment_date}}
• 시간: {{appointment_time}}
• 진료과: {{department}}

[✅ 미리 준비할 것들]
• 건강보험증 지참
• 이전 진료 기록 (있으시면)
• 현재 복용 중인 약 목록
• 보호자 동행 여부 확인

궁금한 점 있으시면 언제든 연락주세요.`
        },
      },
      // 3일 전 - 구체적인 준비사항
      {
        id: 'delay-2',
        type: 'delay',
        position: { x: 100, y: 450 },
        data: { type: 'delay', label: '3일 전', delay: { type: 'days', value: 4 } },
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 100, y: 550 },
        data: {
          type: 'action',
          label: '3일 전 세부 준비사항',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 진료가 3일 남았습니다.

[🏥 병원 방문 준비]
• 도착 예정 시간: 진료 30분 전
• 교통편: 버스/지하철/자가용 확인
• 주차장 위치: {{clinic_parking_info}}

[👨‍👩‍👧‍👦 동행자 안내]
• 고령이시면 보호자 동행 권장
• 이동 보조 필요 시 미리 말씀해주세요

[📋 진료 준비]
• 공복 여부 확인 (필요 시)
• 특이 증상 미리 메모
• 질문사항 정리

편안한 마음으로 방문해주세요!`
        },
      },
      // 1일 전 - 당일 확인
      {
        id: 'delay-3',
        type: 'delay',
        position: { x: 100, y: 650 },
        data: { type: 'delay', label: '1일 전', delay: { type: 'days', value: 2 } },
      },
      {
        id: 'action-3',
        type: 'action',
        position: { x: 100, y: 750 },
        data: {
          type: 'action',
          label: '전날 최종 확인',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 내일 진료예약입니다.

[⏰ 내일 일정]
• 예약 시간: {{appointment_time}}
• 도착 권장 시간: 30분 전
• 진료 예상 소요시간: 30-60분

[📞 연락처 확인]
• 병원: {{clinic_phone}}
• 응급 시: {{emergency_phone}}

[🌤️ 날씨 확인]
• 우산/우천복 준비 (비 예보 시)

편안한 밤 보내시고, 내일 뵙겠습니다!`
        },
      },
      // 당일 아침 - 마지막 리마인더
      {
        id: 'delay-4',
        type: 'delay',
        position: { x: 100, y: 850 },
        data: { type: 'delay', label: '당일 아침', delay: { type: 'hours', value: 8 } },
      },
      {
        id: 'action-4',
        type: 'action',
        position: { x: 100, y: 950 },
        data: {
          type: 'action',
          label: '당일 최종 리마인더',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 오늘 진료 시간입니다!

[📍 병원 위치]
{{clinic_address}}
{{clinic_directions}}

[🕐 오늘 일정]
• 도착: {{arrival_time}}
• 진료: {{appointment_time}}
• 대기 시간 고려: 15분 여유

[☎️ 도움이 필요하신가요?]
택시 호출, 이동 보조, 통역 필요 시 말씀해주세요.

안전하게 오시고, 건강한 하루 되세요!`
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'condition-1' },
      { id: 'e2-3', source: 'condition-1', target: 'delay-1', sourceHandle: 'true' },
      { id: 'e3-4', source: 'delay-1', target: 'action-1' },
      { id: 'e4-5', source: 'action-1', target: 'delay-2' },
      { id: 'e5-6', source: 'delay-2', target: 'action-2' },
      { id: 'e6-7', source: 'action-2', target: 'delay-3' },
      { id: 'e7-8', source: 'delay-3', target: 'action-3' },
      { id: 'e8-9', source: 'action-3', target: 'delay-4' },
      { id: 'e9-10', source: 'delay-4', target: 'action-4' },
    ],
  },
  {
    id: 'appointment-reminder',
    name: '일반 예약 완료 리마인더',
    description: '예약이 완료되면 카톡과 SMS로 기본 리마인더를 자동 발송합니다',
    category: '공통',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 100 },
        data: {
          type: 'trigger',
          label: '예약 완료',
          triggerType: 'appointment_created',
        },
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 200 },
        data: { type: 'delay', label: '10분 후', delay: { type: 'minutes', value: 10 } },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 350 },
        data: {
          type: 'action',
          label: '예약 확정 알림톡',
          actionType: 'send_kakao',
          message_template: '{{patient_name}}님, {{appointment_date}} 예약이 확정되었습니다.'
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'delay-1' },
      { id: 'e2-3', source: 'delay-1', target: 'action-1' },
    ],
  },
  {
    id: 'birthday-coupon',
    name: '생일 할인 쿠폰 발송',
    description: '생일 3일 전 자동으로 할인 쿠폰을 카카오톡으로 발송합니다',
    category: '공통',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 100 },
        data: {
          type: 'trigger',
          label: '생일 3일 전',
          triggerType: 'before_birthday',
        },
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 250 },
        data: {
          type: 'condition',
          label: '최근 방문 여부',
          condition: {
            variable: 'months_since_last_visit',
            operator: '<',
            value: 6,
          },
        },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 100, y: 400 },
        data: {
          type: 'action',
          label: '할인 쿠폰 발송',
          actionType: 'send_coupon',
          message_template: '{{patient_name}}님, 생일을 축하드립니다! 생일 기념 20% 할인 쿠폰을 드립니다.'
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'condition-1' },
      { id: 'e2-3', source: 'condition-1', target: 'action-1', sourceHandle: 'true' },
    ],
  },
  {
    id: 'review-request',
    name: '후기 요청 워크플로우',
    description: '수술 후 일정 기간이 지나면 자동으로 후기 요청 메시지를 발송합니다',
    category: '공통',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 100 },
        data: {
          type: 'trigger',
          label: '수술 후 3일',
          triggerType: 'post_surgery_day',
        },
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 250 },
        data: {
          type: 'condition',
          label: '만족도 확인',
          condition: {
            variable: 'satisfaction_score',
            operator: '>=',
            value: 4,
          },
        },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 100, y: 400 },
        data: {
          type: 'action',
          label: '후기 요청',
          actionType: 'request_review',
          message_template: '{{patient_name}}님, 수술 결과에 만족하셨다면 소중한 후기를 부탁드립니다.'
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'condition-1' },
      { id: 'e2-3', source: 'condition-1', target: 'action-1', sourceHandle: 'true' },
    ],
  },
  {
    id: 'no-show-recovery',
    name: '노쇼(No-Show) 회복',
    description: '예약 취소/노쇼 발생 시 자동으로 재예약 유도 메시지를 발송합니다.',
    category: '공통',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { type: 'trigger', label: '예약 취소/노쇼 감지', triggerType: 'manual' }, // appointment_cancelled trigger not yet implemented fully, using manual/webhook placeholder
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 150 },
        data: { type: 'delay', label: '1시간 후', delay: { type: 'hours', value: 1 } },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 250 },
        data: { type: 'action', label: '재예약 유도 메시지', actionType: 'send_kakao', message_template: '{{patient_name}}님, 예약이 취소되었습니다. 원하시는 시간에 다시 예약해드릴까요?' },
      },
      {
        id: 'delay-2',
        type: 'delay',
        position: { x: 250, y: 350 },
        data: { type: 'delay', label: '3일 후 (미응답 시)', delay: { type: 'days', value: 3 } },
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 250, y: 450 },
        data: { type: 'action', label: '특별 혜택 제안', actionType: 'send_sms', message_template: '이번 주 내로 재예약하시면 상담비를 면제해드립니다.' },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'delay-1' },
      { id: 'e2-3', source: 'delay-1', target: 'action-1' },
      { id: 'e3-4', source: 'action-1', target: 'delay-2' },
      { id: 'e4-5', source: 'delay-2', target: 'action-2' },
    ],
  },
  {
    id: 'cancellation-re-engagement',
    name: '예약 취소 재참여 워크플로우',
    description: '예약 취소 시 4단계 재참여 메시지를 발송합니다 (Day 1, 3, 7, 14)',
    category: '공통',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { type: 'trigger', label: '예약 취소 감지', triggerType: 'appointment_cancelled' },
      },
      {
        id: 'survey-1',
        type: 'action',
        position: { x: 250, y: 150 },
        data: { 
          type: 'action', 
          label: '취소 사유 수집', 
          actionType: 'survey_cancellation_reason',
          message_template: '{{patient_name}}님, 예약이 취소되었습니다. 더 나은 서비스를 위해 취소 사유를 알려주시겠어요?',
          surveyType: 'cancellation_reason'
        },
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 250 },
        data: { type: 'delay', label: '1일 후', delay: { type: 'days', value: 1 } },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 350 },
        data: { 
          type: 'action', 
          label: 'Day 1: "We missed you" 메시지', 
          actionType: 'send_kakao', 
          message_template: '{{patient_name}}님, 어제 예약이 취소되어 아쉬웠습니다. 혹시 다른 날짜로 재예약 가능하신가요? [재예약하기] 링크를 보내드릴까요?' 
        },
      },
      {
        id: 'delay-2',
        type: 'delay',
        position: { x: 250, y: 450 },
        data: { type: 'delay', label: '3일 후', delay: { type: 'days', value: 3 } },
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 250, y: 550 },
        data: { 
          type: 'action', 
          label: 'Day 3: 재예약 링크 제공', 
          actionType: 'send_kakao', 
          message_template: '{{patient_name}}님, 재예약을 원하시나요? 아래 링크에서 편리하게 예약하실 수 있습니다. [예약하기] https://booking.example.com/{{patient_id}}' 
        },
      },
      {
        id: 'delay-3',
        type: 'delay',
        position: { x: 250, y: 650 },
        data: { type: 'delay', label: '7일 후', delay: { type: 'days', value: 7 } },
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 750 },
        data: {
          type: 'condition',
          label: '재예약 여부 확인',
          condition: {
            variable: 'has_rebooked',
            operator: 'equals',
            value: 'false',
          },
        },
      },
      {
        id: 'action-3',
        type: 'action',
        position: { x: 100, y: 900 },
        data: { 
          type: 'action', 
          label: 'Day 7: 특별 혜택 제안 (컴플라이언트)', 
          actionType: 'send_kakao', 
          message_template: '{{patient_name}}님, 이번 주 내로 재예약하시면 상담비를 면제해드립니다. (컴플라이언트 환자에게만 발송)' 
        },
      },
      {
        id: 'delay-4',
        type: 'delay',
        position: { x: 400, y: 900 },
        data: { type: 'delay', label: '14일 후', delay: { type: 'days', value: 14 } },
      },
      {
        id: 'action-4',
        type: 'action',
        position: { x: 400, y: 1000 },
        data: { 
          type: 'action', 
          label: 'Day 14: 최종 리마인더', 
          actionType: 'send_sms', 
          message_template: '{{patient_name}}님, 재예약을 고려 중이시라면 언제든지 연락주세요. 담당자가 직접 상담해드리겠습니다.' 
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'survey-1' },
      { id: 'e2-3', source: 'survey-1', target: 'delay-1' },
      { id: 'e3-4', source: 'delay-1', target: 'action-1' },
      { id: 'e4-5', source: 'action-1', target: 'delay-2' },
      { id: 'e5-6', source: 'delay-2', target: 'action-2' },
      { id: 'e6-7', source: 'action-2', target: 'delay-3' },
      { id: 'e7-8', source: 'delay-3', target: 'condition-1' },
      { id: 'e8-9', source: 'condition-1', target: 'action-3', sourceHandle: 'true' },
      { id: 'e9-10', source: 'action-3', target: 'delay-4' },
      { id: 'e10-11', source: 'delay-4', target: 'action-4' },
    ],
  },
  {
    id: 'no-show-re-engagement',
    name: '노쇼 재참여 워크플로우',
    description: '노쇼 발생 시 4단계 재참여 메시지를 발송합니다 (Day 1, 3, 7, 14)',
    category: '공통',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { type: 'trigger', label: '노쇼 감지', triggerType: 'appointment_no_show' },
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 150 },
        data: { type: 'delay', label: '1일 후', delay: { type: 'days', value: 1 } },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 250 },
        data: { 
          type: 'action', 
          label: 'Day 1: "We missed you" 메시지', 
          actionType: 'send_kakao', 
          message_template: '{{patient_name}}님, 어제 예약 시간에 뵙지 못해 아쉬웠습니다. 혹시 다른 날짜로 재예약 가능하신가요?' 
        },
      },
      {
        id: 'delay-2',
        type: 'delay',
        position: { x: 250, y: 350 },
        data: { type: 'delay', label: '3일 후', delay: { type: 'days', value: 3 } },
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 250, y: 450 },
        data: { 
          type: 'action', 
          label: 'Day 3: 재예약 링크 제공', 
          actionType: 'send_kakao', 
          message_template: '{{patient_name}}님, 재예약을 원하시나요? 아래 링크에서 편리하게 예약하실 수 있습니다. [예약하기]' 
        },
      },
      {
        id: 'delay-3',
        type: 'delay',
        position: { x: 250, y: 550 },
        data: { type: 'delay', label: '7일 후', delay: { type: 'days', value: 7 } },
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 650 },
        data: {
          type: 'condition',
          label: '재예약 여부 확인',
          condition: {
            variable: 'has_rebooked',
            operator: 'equals',
            value: 'false',
          },
        },
      },
      {
        id: 'action-3',
        type: 'action',
        position: { x: 100, y: 800 },
        data: { 
          type: 'action', 
          label: 'Day 7: 특별 혜택 제안 (컴플라이언트)', 
          actionType: 'send_kakao', 
          message_template: '{{patient_name}}님, 이번 주 내로 재예약하시면 상담비를 면제해드립니다.' 
        },
      },
      {
        id: 'delay-4',
        type: 'delay',
        position: { x: 400, y: 800 },
        data: { type: 'delay', label: '14일 후', delay: { type: 'days', value: 14 } },
      },
      {
        id: 'action-4',
        type: 'action',
        position: { x: 400, y: 900 },
        data: { 
          type: 'action', 
          label: 'Day 14: 최종 리마인더', 
          actionType: 'send_sms', 
          message_template: '{{patient_name}}님, 재예약을 고려 중이시라면 언제든지 연락주세요. 담당자가 직접 상담해드리겠습니다.' 
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'delay-1' },
      { id: 'e2-3', source: 'delay-1', target: 'action-1' },
      { id: 'e3-4', source: 'action-1', target: 'delay-2' },
      { id: 'e4-5', source: 'delay-2', target: 'action-2' },
      { id: 'e5-6', source: 'action-2', target: 'delay-3' },
      { id: 'e6-7', source: 'delay-3', target: 'condition-1' },
      { id: 'e7-8', source: 'condition-1', target: 'action-3', sourceHandle: 'true' },
      { id: 'e8-9', source: 'action-3', target: 'delay-4' },
      { id: 'e9-10', source: 'delay-4', target: 'action-4' },
    ],
  },
  {
    id: 'consultation-followup',
    name: '상담 후 미예약 고객 케어',
    description: '상담은 받았으나 수술 예약을 하지 않은 고객을 관리합니다.',
    category: '공통',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { type: 'trigger', label: '상담 완료', triggerType: 'consultation_completed' },
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 150 },
        data: { type: 'delay', label: '3일 후', delay: { type: 'days', value: 3 } },
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 250 },
        data: {
          type: 'condition',
          label: '수술 예약 여부',
          condition: {
            variable: 'has_surgery_appointment',
            operator: 'equals',
            value: 'false',
          },
        },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 100, y: 400 },
        data: { type: 'action', label: '고민 해결 정보 발송', actionType: 'send_kakao', message_template: '{{patient_name}}님, 상담 시 고민하셨던 부분에 대한 추가 정보를 보내드립니다.' },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'delay-1' },
      { id: 'e2-3', source: 'delay-1', target: 'condition-1' },
      { id: 'e3-4', source: 'condition-1', target: 'action-1', sourceHandle: 'true' },
    ],
  },

  // --- 안과 추가: 녹내장 (Glaucoma) ---
  {
    id: 'glaucoma-comprehensive-care',
    name: '녹내장 수술 종합 케어 (90일)',
    description: '녹내장 수술 후 안압 관리, 시야 회복, 정기 검진까지 장기 케어를 제공합니다.',
    category: '안과',
    targetSurgery: 'glaucoma',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { type: 'trigger', label: '녹내장 수술 완료', triggerType: 'surgery_completed' },
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 150 },
        data: { type: 'delay', label: '수술 당일 저녁', delay: { type: 'hours', value: 6 } },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 250 },
        data: {
          type: 'action',
          label: '수술 당일 안압 관리',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 녹내장 수술 당일입니다.

[✅ 즉시 해야 할 일]
• 보호안대 착용 유지
• 처방받으신 안약 정확히 점안
• 안압 측정 준비 (다음날 검진)

[❌ 절대 금지사항]
• 눈 비비기, 문지르기 금지
• 무거운 물건 들기 금지
• 고개 숙이기 금지
• 세안, 샤워 금지

[⚠️ 즉시 연락해야 할 증상]
• 심한 통증이나 두통
• 시야가 갑자기 어두워짐
• 메스꺼움, 구토

이상 증상이 있으시면 즉시 연락주세요.`
        },
      },
      {
        id: 'delay-2',
        type: 'delay',
        position: { x: 250, y: 350 },
        data: { type: 'delay', label: 'D+1 첫 검진', delay: { type: 'days', value: 1 } },
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 250, y: 450 },
        data: {
          type: 'action',
          label: '첫 검진 및 안압 확인',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 후 첫날입니다.

[📊 오늘 검진에서 확인할 사항]
• 안압 측정 (목표: 정상 범위)
• 전방 깊이 확인
• 시야 회복 상태

[💊 약물 관리]
• 안약 규칙적으로 점안
• 안압 조절 약물 복용
• 항생제, 소염제 복용

[🏠 생활 지도]
• 가벼운 활동만 가능
• 운전 절대 금지
• 충분한 휴식

오늘 검진에서 안압을 확인합니다.`
        },
      },
      {
        id: 'delay-3',
        type: 'delay',
        position: { x: 250, y: 550 },
        data: { type: 'delay', label: 'D+7 안압 모니터링', delay: { type: 'days', value: 6 } },
      },
      {
        id: 'action-3',
        type: 'action',
        position: { x: 250, y: 650 },
        data: {
          type: 'action',
          label: '1주일 안압 모니터링',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 1주일이 지났습니다.

[📈 안압 관리 중요]
• 안압이 정상 범위 유지되는지 확인
• 안약 점안 시간 엄수
• 정기 안압 측정 필요

[⚠️ 주의해야 할 증상]
• 눈 통증이나 불편감
• 시야 변화
• 두통이나 메스꺼움

[📅 다음 검진]
• 2주일 후 안압 재확인 예정
• 필요시 안약 조정

안압 관리가 매우 중요합니다. 규칙적으로 안약을 점안해주세요.`
        },
      },
      {
        id: 'delay-4',
        type: 'delay',
        position: { x: 250, y: 750 },
        data: { type: 'delay', label: 'D+30 장기 관리', delay: { type: 'days', value: 23 } },
      },
      {
        id: 'action-4',
        type: 'action',
        position: { x: 250, y: 850 },
        data: {
          type: 'action',
          label: '1개월 장기 관리 안내',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 1개월이 지났습니다.

[✅ 장기 관리 사항]
• 안압 정기 측정 (월 1회 권장)
• 안약 장기 복용 필요 시 안내
• 시야 검사 정기 실시

[📋 생활 습관]
• 규칙적인 운동 (가벼운 운동)
• 충분한 수면
• 스트레스 관리

[🎯 최종 목표]
녹내장 진행 억제 및 시야 보존

정기 검진을 통해 안압을 관리해주세요.`
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'delay-1' },
      { id: 'e2-3', source: 'delay-1', target: 'action-1' },
      { id: 'e3-4', source: 'action-1', target: 'delay-2' },
      { id: 'e4-5', source: 'delay-2', target: 'action-2' },
      { id: 'e5-6', source: 'action-2', target: 'delay-3' },
      { id: 'e6-7', source: 'delay-3', target: 'action-3' },
      { id: 'e7-8', source: 'action-3', target: 'delay-4' },
      { id: 'e8-9', source: 'delay-4', target: 'action-4' },
    ],
  },

  // --- 성형외과 추가: 리프팅 (Facelift) ---
  {
    id: 'facelift-comprehensive-care',
    name: '리프팅 수술 종합 케어 (90일)',
    description: '리프팅 수술 후 붓기 관리, 실밥 제거, 최종 형태 완성까지 단계별 케어를 제공합니다.',
    category: '성형외과',
    targetSurgery: 'facelift',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { type: 'trigger', label: '리프팅 수술 완료', triggerType: 'surgery_completed' },
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 150 },
        data: { type: 'delay', label: '수술 당일 저녁', delay: { type: 'hours', value: 6 } },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 250 },
        data: {
          type: 'action',
          label: '수술 당일 자세 및 냉찜질',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 리프팅 수술 당일입니다.

[🧊 즉시 해야 할 일 - 냉찜질]
• 얼음팩으로 얼굴 전체 냉찜질
• 1회 15분, 1시간 간격으로 반복
• 수술 후 3일간 지속

[🛏️ 수면 자세]
• 머리를 심장보다 높게 (베개 2-3개)
• 등을 대고 누워 자세요
• 옆으로 누워 자지 말기

[❌ 절대 금지사항]
• 얼굴 만지기, 문지르기 금지
• 세수, 샤워 금지
• 고개 숙이기 금지
• 무거운 물건 들기 금지

통증이 심하시면 진통제 복용 후 연락주세요.`
        },
      },
      {
        id: 'delay-2',
        type: 'delay',
        position: { x: 250, y: 350 },
        data: { type: 'delay', label: 'D+1 첫 검진', delay: { type: 'days', value: 1 } },
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 250, y: 450 },
        data: {
          type: 'action',
          label: '첫 검진 및 붓기 관리',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 후 첫날입니다.

[✅ 검진 준비사항]
• 붕대와 드레싱 상태 확인
• 통증 조절을 위한 진통제 복용
• 동반 보호자와 함께 내원

[🧊 붓기 관리 계속]
• 냉찜질 1일 5-6회 유지
• 고개 높이 유지하며 휴식
• 얼굴 움직임 최소화

[🚫 주의사항]
• 드레싱 젖히지 말고 그대로 유지
• 외출 자제, 집에서 휴식
• 짜게 먹지 말고 싱겔게 먹기

오늘 검진에서 회복 상태를 확인합니다.`
        },
      },
      {
        id: 'delay-3',
        type: 'delay',
        position: { x: 250, y: 550 },
        data: { type: 'delay', label: 'D+7 실밥 제거', delay: { type: 'days', value: 6 } },
      },
      {
        id: 'action-3',
        type: 'action',
        position: { x: 250, y: 650 },
        data: {
          type: 'action',
          label: '실밥 제거 안내',
          actionType: 'send_sms',
          message_template: '{{patient_name}}님, 내일 실밥 제거 예정입니다. 예약 시간을 확인하시고 늦지 않게 방문해주세요.'
        },
      },
      {
        id: 'delay-4',
        type: 'delay',
        position: { x: 250, y: 750 },
        data: { type: 'delay', label: 'D+14 중간 검진', delay: { type: 'days', value: 7 } },
      },
      {
        id: 'action-4',
        type: 'action',
        position: { x: 250, y: 850 },
        data: {
          type: 'action',
          label: '2주 검진 및 회복 평가',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 2주가 지났습니다.

[📊 회복 진행 상황]
• 실밥 제거 후 상처 회복 중
• 붓기 서서히 감소
• 얼굴 형태 점차 자연스러워짐

[💡 생활 지도]
• 가벼운 세안 가능 (물만 사용)
• 부드러운 화장품 사용 가능
• 마사지나 스크럽 금지

[📅 다음 일정]
• 1개월 검진 예약 확인
• 3개월, 6개월 추적 검진 계획

회복이 잘 진행되고 있으신가요?`
        },
      },
      {
        id: 'delay-5',
        type: 'delay',
        position: { x: 250, y: 950 },
        data: { type: 'delay', label: 'D+30 형태 평가', delay: { type: 'days', value: 16 } },
      },
      {
        id: 'action-5',
        type: 'action',
        position: { x: 250, y: 1050 },
        data: {
          type: 'action',
          label: '1개월 최종 형태 평가',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 수술 1개월이 되었습니다!

[✅ 회복 마무리 단계]
• 붓기 대부분 사라짐
• 얼굴 형태 안정화 진행 중
• 일상생활 거의 정상화

[🎯 최종 목표 달성]
• 3개월까지 형태 완성
• 6개월까지 최종 안정화

[📋 장기 관리]
• 3개월, 6개월 추적 검진
• 생활 습관 유지 (충격 피하기)
• 정기 사진 촬영으로 변화 추적

만족스러운 결과를 위해 앞으로도 잘 관리해주세요!`
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'delay-1' },
      { id: 'e2-3', source: 'delay-1', target: 'action-1' },
      { id: 'e3-4', source: 'action-1', target: 'delay-2' },
      { id: 'e4-5', source: 'delay-2', target: 'action-2' },
      { id: 'e5-6', source: 'action-2', target: 'delay-3' },
      { id: 'e6-7', source: 'delay-3', target: 'action-3' },
      { id: 'e7-8', source: 'action-3', target: 'delay-4' },
      { id: 'e8-9', source: 'delay-4', target: 'action-4' },
      { id: 'e9-10', source: 'action-4', target: 'delay-5' },
      { id: 'e10-11', source: 'delay-5', target: 'action-5' },
    ],
  },

  // --- 피부과 (Dermatology) ---
  {
    id: 'acne-treatment-care',
    name: '여드름 치료 케어 (30일)',
    description: '여드름 치료 후 피부 관리, 재발 방지, 정기 검진까지 단계별 케어를 제공합니다.',
    category: '피부과',
    targetSurgery: 'acne',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { type: 'trigger', label: '여드름 치료 시작', triggerType: 'treatment_started' },
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 150 },
        data: { type: 'delay', label: '치료 당일 저녁', delay: { type: 'hours', value: 6 } },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 250 },
        data: {
          type: 'action',
          label: '치료 당일 피부 관리',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 여드름 치료를 시작하셨습니다.

[✅ 즉시 해야 할 일]
• 처방받으신 약물 규칙적으로 복용/도포
• 부드러운 세안제로 세안
• 보습제 충분히 발라주기

[❌ 절대 금지사항]
• 여드름 짜기 금지
• 각질 제거 제품 사용 금지
• 자외선 차단제 필수 사용
• 화장품 과도한 사용 금지

[⚠️ 주의사항]
• 초기에는 일시적으로 악화될 수 있음
• 피부 건조함이 있을 수 있음
• 자외선에 민감해질 수 있음

규칙적으로 약물을 사용해주세요.`
        },
      },
      {
        id: 'delay-2',
        type: 'delay',
        position: { x: 250, y: 350 },
        data: { type: 'delay', label: 'D+3 초기 반응 확인', delay: { type: 'days', value: 3 } },
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 250, y: 450 },
        data: {
          type: 'action',
          label: '초기 반응 모니터링',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 치료 3일차입니다.

[📊 초기 반응 확인]
• 피부 상태 변화 관찰
• 건조함이나 자극 여부 확인
• 여드름 악화 여부 확인

[💡 피부 관리]
• 보습제 충분히 발라주기
• 자외선 차단제 매일 사용
• 부드러운 세안제 사용

[⚠️ 즉시 연락해야 할 증상]
• 심한 자극이나 알레르기 반응
• 피부가 심하게 건조해짐
• 통증이나 화끈거림

이상 증상이 있으시면 즉시 연락주세요.`
        },
      },
      {
        id: 'delay-3',
        type: 'delay',
        position: { x: 250, y: 550 },
        data: { type: 'delay', label: 'D+7 1주일 검진', delay: { type: 'days', value: 4 } },
      },
      {
        id: 'action-3',
        type: 'action',
        position: { x: 250, y: 650 },
        data: {
          type: 'action',
          label: '1주일 검진 안내',
          actionType: 'send_sms',
          message_template: '{{patient_name}}님, 내일 1주일 경과 검진 예약일입니다. 치료 반응을 확인합니다.'
        },
      },
      {
        id: 'delay-4',
        type: 'delay',
        position: { x: 250, y: 750 },
        data: { type: 'delay', label: 'D+14 회복 점검', delay: { type: 'days', value: 7 } },
      },
      {
        id: 'action-4',
        type: 'action',
        position: { x: 250, y: 850 },
        data: {
          type: 'action',
          label: '2주 회복 상태 점검',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 치료 2주가 지났습니다.

[✅ 회복 진행 상황]
• 여드름 개선 시작
• 피부 상태 안정화
• 약물 사용에 익숙해짐

[💡 계속 유지할 습관]
• 규칙적인 약물 사용
• 자외선 차단 필수
• 충분한 보습

[📅 다음 일정]
• 1개월 검진 예약 확인
• 필요시 약물 조정

치료가 잘 진행되고 있으신가요?`
        },
      },
      {
        id: 'delay-5',
        type: 'delay',
        position: { x: 250, y: 950 },
        data: { type: 'delay', label: 'D+30 최종 평가', delay: { type: 'days', value: 16 } },
      },
      {
        id: 'action-5',
        type: 'action',
        position: { x: 250, y: 1050 },
        data: {
          type: 'action',
          label: '1개월 최종 평가',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 치료 1개월이 지났습니다!

[✅ 치료 효과 확인]
• 여드름 개선 정도 평가
• 피부 상태 최종 확인
• 약물 조정 필요 여부

[📋 장기 관리]
• 지속적인 피부 관리 필요
• 재발 방지를 위한 관리
• 정기 검진 권장

[🎯 최종 목표]
건강하고 깨끗한 피부 유지

치료 결과에 만족하셨나요? 궁금한 점 있으시면 언제든 연락주세요!`
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'delay-1' },
      { id: 'e2-3', source: 'delay-1', target: 'action-1' },
      { id: 'e3-4', source: 'action-1', target: 'delay-2' },
      { id: 'e4-5', source: 'delay-2', target: 'action-2' },
      { id: 'e5-6', source: 'action-2', target: 'delay-3' },
      { id: 'e6-7', source: 'delay-3', target: 'action-3' },
      { id: 'e7-8', source: 'action-3', target: 'delay-4' },
      { id: 'e8-9', source: 'delay-4', target: 'action-4' },
      { id: 'e9-10', source: 'action-4', target: 'delay-5' },
      { id: 'e10-11', source: 'delay-5', target: 'action-5' },
    ],
  },
  {
    id: 'laser-treatment-care',
    name: '레이저 치료 케어 (14일)',
    description: '레이저 치료 후 피부 관리, 자외선 차단, 재시술 안내까지 단계별 케어를 제공합니다.',
    category: '피부과',
    targetSurgery: 'laser',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { type: 'trigger', label: '레이저 치료 완료', triggerType: 'treatment_completed' },
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 250, y: 150 },
        data: { type: 'delay', label: '치료 당일 저녁', delay: { type: 'hours', value: 6 } },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 250, y: 250 },
        data: {
          type: 'action',
          label: '치료 당일 피부 관리',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 레이저 치료를 받으셨습니다.

[✅ 즉시 해야 할 일]
• 냉찜질로 붓기 완화 (1회 10분, 1일 3-4회)
• 처방받으신 연고 도포
• 충분한 보습제 발라주기

[❌ 절대 금지사항]
• 세안 금지 (24시간)
• 화장품 사용 금지
• 자외선 노출 절대 금지
• 사우나, 목욕탕 금지

[⚠️ 주의사항]
• 피부가 붉고 따가울 수 있음
• 가벼운 부종이 있을 수 있음
• 색소 침착 주의

자외선 차단이 매우 중요합니다!`
        },
      },
      {
        id: 'delay-2',
        type: 'delay',
        position: { x: 250, y: 350 },
        data: { type: 'delay', label: 'D+1 첫 관리', delay: { type: 'days', value: 1 } },
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 250, y: 450 },
        data: {
          type: 'action',
          label: '첫날 피부 관리',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 레이저 치료 다음날입니다.

[✅ 이제 할 수 있는 일]
• 부드러운 세안제로 가볍게 세안
• 처방받으신 연고 계속 도포
• 보습제 충분히 발라주기

[🌞 자외선 차단 필수]
• 자외선 차단제 매일 사용 (SPF 50+)
• 모자, 선글라스 착용
• 외출 시 자외선 피하기

[🚫 여전히 금지사항]
• 각질 제거 제품 사용 금지
• 사우나, 목욕탕 금지
• 격한 운동 자제

피부가 회복되는 동안 자외선을 피해주세요.`
        },
      },
      {
        id: 'delay-3',
        type: 'delay',
        position: { x: 250, y: 550 },
        data: { type: 'delay', label: 'D+3 회복 확인', delay: { type: 'days', value: 2 } },
      },
      {
        id: 'action-3',
        type: 'action',
        position: { x: 250, y: 650 },
        data: {
          type: 'action',
          label: '3일차 회복 확인',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 레이저 치료 3일차입니다.

[📊 회복 진행 상황]
• 붓기와 붉은 기 대부분 사라짐
• 피부 상태 안정화
• 색소 침착 주의 필요

[💡 계속 유지할 습관]
• 자외선 차단제 매일 사용
• 충분한 보습
• 부드러운 세안

[⚠️ 즉시 연락해야 할 증상]
• 심한 통증이나 화끈거림
• 색소 침착 발생
• 감염 징후

이상 증상이 있으시면 즉시 연락주세요.`
        },
      },
      {
        id: 'delay-4',
        type: 'delay',
        position: { x: 250, y: 750 },
        data: { type: 'delay', label: 'D+7 1주일 검진', delay: { type: 'days', value: 4 } },
      },
      {
        id: 'action-4',
        type: 'action',
        position: { x: 250, y: 850 },
        data: {
          type: 'action',
          label: '1주일 검진 안내',
          actionType: 'send_sms',
          message_template: '{{patient_name}}님, 내일 1주일 경과 검진 예약일입니다. 치료 반응을 확인합니다.'
        },
      },
      {
        id: 'delay-5',
        type: 'delay',
        position: { x: 250, y: 950 },
        data: { type: 'delay', label: 'D+14 최종 관리', delay: { type: 'days', value: 7 } },
      },
      {
        id: 'action-5',
        type: 'action',
        position: { x: 250, y: 1050 },
        data: {
          type: 'action',
          label: '2주 최종 관리 안내',
          actionType: 'send_kakao',
          message_template: `{{patient_name}}님, 레이저 치료 2주가 지났습니다!

[✅ 회복 완료 단계]
• 피부 상태 안정화
• 일상생활 정상화
• 화장품 사용 가능

[📋 장기 관리]
• 자외선 차단 지속 필수
• 정기적인 피부 관리
• 재시술 필요 시 안내

[🎯 최종 목표]
만족스러운 치료 결과 유지

치료 결과에 만족하셨나요? 재시술이 필요하시면 언제든 연락주세요!`
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'delay-1' },
      { id: 'e2-3', source: 'delay-1', target: 'action-1' },
      { id: 'e3-4', source: 'action-1', target: 'delay-2' },
      { id: 'e4-5', source: 'delay-2', target: 'action-2' },
      { id: 'e5-6', source: 'action-2', target: 'delay-3' },
      { id: 'e6-7', source: 'delay-3', target: 'action-3' },
      { id: 'e7-8', source: 'action-3', target: 'delay-4' },
      { id: 'e8-9', source: 'delay-4', target: 'action-4' },
      { id: 'e9-10', source: 'action-4', target: 'delay-5' },
      { id: 'e10-11', source: 'delay-5', target: 'action-5' },
    ],
  },
  {
    id: 'telemedicine-pre-consultation',
    name: '화상 상담 사전 안내',
    description: '화상 상담 예약 시 환자에게 사전 안내 메시지를 발송합니다',
    category: '화상 상담',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { type: 'trigger', label: '화상 상담 예약 생성', triggerType: 'appointment_created' },
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 150 },
        data: {
          type: 'condition',
          label: '화상 상담 여부 확인',
          condition: {
            variable: 'is_telemedicine',
            operator: 'equals',
            value: 'true',
          },
        },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 100, y: 300 },
        data: { 
          type: 'action', 
          label: '상담 안내 메시지 발송', 
          actionType: 'send_kakao', 
          message_template: '{{patient_name}}님, 화상 상담이 예약되었습니다.\n\n📅 일시: {{appointment_date}} {{appointment_time}}\n🔗 참여 링크: {{meeting_url}}\n\n상담 10분 전에 링크를 클릭하여 접속해주세요.' 
        },
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 100, y: 400 },
        data: { type: 'delay', label: '상담 1일 전', delay: { type: 'days', value: 1 } },
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 100, y: 500 },
        data: { 
          type: 'action', 
          label: '리마인더 발송', 
          actionType: 'send_kakao', 
          message_template: '{{patient_name}}님, 내일 {{appointment_time}} 화상 상담이 예정되어 있습니다.\n\n🔗 참여 링크: {{meeting_url}}\n\n준비사항:\n- 안정적인 인터넷 연결 확인\n- 조용한 장소 준비\n- 신분증 준비 (필요시)' 
        },
      },
      {
        id: 'delay-2',
        type: 'delay',
        position: { x: 100, y: 600 },
        data: { type: 'delay', label: '상담 30분 전', delay: { type: 'minutes', value: 30 } },
      },
      {
        id: 'action-3',
        type: 'action',
        position: { x: 100, y: 700 },
        data: { 
          type: 'action', 
          label: '최종 리마인더', 
          actionType: 'send_sms', 
          message_template: '{{patient_name}}님, 30분 후 화상 상담이 시작됩니다.\n\n🔗 참여 링크: {{meeting_url}}\n\n지금 접속하여 대기실에서 대기해주세요.' 
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'condition-1' },
      { id: 'e2-3', source: 'condition-1', target: 'action-1', sourceHandle: 'true' },
      { id: 'e3-4', source: 'action-1', target: 'delay-1' },
      { id: 'e4-5', source: 'delay-1', target: 'action-2' },
      { id: 'e5-6', source: 'action-2', target: 'delay-2' },
      { id: 'e6-7', source: 'delay-2', target: 'action-3' },
    ],
  },
  {
    id: 'telemedicine-post-consultation',
    name: '화상 상담 후 케어',
    description: '화상 상담 완료 후 자동으로 후속 조치를 진행합니다',
    category: '화상 상담',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { type: 'trigger', label: '화상 상담 완료', triggerType: 'appointment_completed' },
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 250, y: 150 },
        data: {
          type: 'condition',
          label: '화상 상담 여부 확인',
          condition: {
            variable: 'is_telemedicine',
            operator: 'equals',
            value: 'true',
          },
        },
      },
      {
        id: 'action-1',
        type: 'action',
        position: { x: 100, y: 300 },
        data: { 
          type: 'action', 
          label: '감사 메시지 발송', 
          actionType: 'send_kakao', 
          message_template: '{{patient_name}}님, 화상 상담에 참여해주셔서 감사합니다.\n\n상담 내용 요약 및 다음 단계 안내는 곧 발송해드리겠습니다.' 
        },
      },
      {
        id: 'delay-1',
        type: 'delay',
        position: { x: 100, y: 400 },
        data: { type: 'delay', label: '1시간 후', delay: { type: 'hours', value: 1 } },
      },
      {
        id: 'action-2',
        type: 'action',
        position: { x: 100, y: 500 },
        data: { 
          type: 'action', 
          label: '상담 후기 요청', 
          actionType: 'send_kakao', 
          message_template: '{{patient_name}}님, 오늘 상담은 어떠셨나요?\n\n간단한 후기를 남겨주시면 더 나은 서비스를 제공하는데 도움이 됩니다.\n\n[후기 남기기] 링크' 
        },
      },
      {
        id: 'delay-2',
        type: 'delay',
        position: { x: 100, y: 600 },
        data: { type: 'delay', label: '3일 후', delay: { type: 'days', value: 3 } },
      },
      {
        id: 'condition-2',
        type: 'condition',
        position: { x: 100, y: 700 },
        data: {
          type: 'condition',
          label: '수술 예약 여부',
          condition: {
            variable: 'has_surgery_appointment',
            operator: 'equals',
            value: 'false',
          },
        },
      },
      {
        id: 'action-3',
        type: 'action',
        position: { x: -100, y: 850 },
        data: { 
          type: 'action', 
          label: '재상담 제안', 
          actionType: 'send_kakao', 
          message_template: '{{patient_name}}님, 추가로 궁금한 점이 있으시면 언제든지 재상담 예약 가능합니다.\n\n[재상담 예약하기] 링크' 
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'trigger-1', target: 'condition-1' },
      { id: 'e2-3', source: 'condition-1', target: 'action-1', sourceHandle: 'true' },
      { id: 'e3-4', source: 'action-1', target: 'delay-1' },
      { id: 'e4-5', source: 'delay-1', target: 'action-2' },
      { id: 'e5-6', source: 'action-2', target: 'delay-2' },
      { id: 'e6-7', source: 'delay-2', target: 'condition-2' },
      { id: 'e7-8', source: 'condition-2', target: 'action-3', sourceHandle: 'true' },
    ],
  },
];
