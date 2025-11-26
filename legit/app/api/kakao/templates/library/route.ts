import { NextResponse } from 'next/server';

// Standard Medical AlimTalk Templates (Mock Library)
// These are templates commonly pre-approved by Kakao for medical use
const STANDARD_TEMPLATES = [
  {
    id: 'TMP_APPT_REMIND_01',
    name: '예약 안내 (기본)',
    category: '예약',
    content: `[#{병원명}] 예약 안내\n\n#{고객명}님, 예약하신 일정을 안내해 드립니다.\n\n📅 일시: #{예약일시}\n🏥 장소: #{병원위치}\n\n* 변경 사항이 있으시면 미리 연락 부탁드립니다.`,
    buttons: [
      { type: 'WL', name: '오시는 길', url_mobile: '#{지도링크}' },
      { type: 'WL', name: '예약 확인', url_mobile: '#{예약확인링크}' }
    ]
  },
  {
    id: 'TMP_SURGERY_PRE_01',
    name: '수술 전 주의사항',
    category: '수술',
    content: `[#{병원명}] 수술 전 안내\n\n#{고객명}님, 내일은 수술 예정일입니다.\n안전한 수술을 위해 아래 사항을 꼭 지켜주세요.\n\n1. 금식: 수술 6시간 전부터 물 포함 금식\n2. 복장: 편안한 옷차림, 화장/렌즈/장신구 제거\n3. 내원: 예약 시간 20분 전 도착\n\n문의사항: #{병원전화번호}`,
  },
  {
    id: 'TMP_SURGERY_POST_01',
    name: '수술 후 관리 (1일차)',
    category: '수술',
    content: `[#{병원명}] 수술 후 1일차 안내\n\n수술 받으시느라 고생 많으셨습니다.\n오늘은 붓기가 가장 심할 수 있는 시기입니다.\n\n✅ 냉찜질을 수시로 해주세요.\n✅ 처방받은 안약/약을 제때 복용하세요.\n✅ 눈을 비비거나 만지지 마세요.\n\n통증이 심하거나 이상이 느껴지면 병원으로 연락주세요.\n📞 #{병원전화번호}`,
  },
  {
    id: 'TMP_CHECKUP_01',
    name: '정기 검진 안내',
    category: '검진',
    content: `[#{병원명}] 정기 검진 안내\n\n#{고객명}님, 수술 후 정기 검진일이 다가왔습니다.\n건강한 회복을 위해 잊지 말고 내원해 주세요.\n\n📅 검진 예정일: #{검진일}\n\n아래 버튼을 눌러 예약 일정을 잡아주세요.`,
    buttons: [
      { type: 'WL', name: '검진 예약하기', url_mobile: '#{예약링크}' }
    ]
  },
  {
    id: 'TMP_HAPPY_CALL_01',
    name: '해피콜 (만족도 조사)',
    category: '고객관리',
    content: `[#{병원명}] 진료 만족도 조사\n\n#{고객명}님, 오늘 진료는 편안하셨나요?\n더 나은 의료 서비스를 위해 고객님의 소중한 의견을 듣고 싶습니다.\n\n설문에 참여해 주시면 추첨을 통해 소정의 선물을 드립니다.`,
    buttons: [
      { type: 'WL', name: '설문 참여하기', url_mobile: '#{설문링크}' }
    ]
  }
];

export async function GET() {
  // In a real app, we might fetch this from a database or sync with Kakao API
  return NextResponse.json({
    success: true,
    templates: STANDARD_TEMPLATES
  });
}

