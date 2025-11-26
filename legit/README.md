# 🏥 DoctorsFlow (닥터스플로우)

**한국 병원(안과·성형외과)을 위한 올인원 마케팅 자동화 & CRM 솔루션**

> **Phase 1 Status: Production Ready** ✅
>
> 이 프로젝트는 한국 의료 환경에 최적화된 "해피콜 자동화", "네이버 예약 연동", "스마트 CRM" 기능을 제공합니다.

## ✨ Key Features (핵심 기능)

### 1. 🤖 Visual Workflow Automation (자동화)
*   **Visual Builder**: n8n 스타일의 드래그앤드롭 빌더로 복잡한 메시지 시나리오 설계.
*   **Daily Execution Engine**: 매일 아침(KST 10:00) 자동으로 실행되어 환자 상태(수술 후 1일차, 3일차 등)에 맞는 메시지 발송.
*   **Smart Conditions**: 나이, 성별, 수술 종류(백내장, 라식 등)에 따른 정교한 분기 처리.

### 2. 📉 Smart Failover Messaging (메시징)
*   **카카오톡 우선 발송**: 알림톡/친구톡을 먼저 시도하여 비용 절감 및 도달률 향상.
*   **SMS 자동 전환**: 카카오톡 발송 실패 시(차단/미가입) 자동으로 문자(LMS/SMS)로 전환 발송. **100% 도달 보장.**

### 3. 📅 Naver Booking Sync (예약 연동)
*   **Chrome Extension**: 공식 API가 없는 네이버 예약을 크롬 확장프로그램으로 연동.
*   **실시간 동기화**: 예약 생성/취소/변경 사항이 자동으로 DoctorsFlow DB에 반영됨.

### 4. 💼 Consultation CRM (상담 관리)
*   **Lead Tracking**: 상담 경로(네이버, 지인, 광고 등) 추적 및 성공률 분석.
*   **Voice-to-Text**: 상담 내용을 말로 하면 자동으로 텍스트 변환 및 저장.
*   **Executive Dashboard**: 병원장/관리자를 위한 핵심 KPI (매출, 내원율, 수술 전환율) 대시보드.

### 5. 🔐 Security & Operations (운영)
*   **Kakao Login**: 의사/직원이 카카오톡 아이디로 1초 만에 로그인.
*   **Role-Based Access**: RLS(Row Level Security) 적용으로 데이터 보안 철저.
*   **Patient Photo Gallery**: 수술 전후 사진을 안전하게 클라우드(Supabase Storage)에 보관.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 14 (App Router)
*   **Database**: Supabase (PostgreSQL)
*   **Auth**: Clerk + Kakao Login
*   **UI Library**: Shadcn UI + Tailwind CSS
*   **Workflow UI**: React Flow
*   **Messaging**: NHN Cloud (Kakao/SMS) / Coolsms
*   **Deployment**: Vercel

---

## 🚀 Deployment (배포 방법)

상세한 배포 가이드는 [`DEPLOYMENT.md`](./DEPLOYMENT.md)를 참고하세요.

1.  Supabase 프로젝트 생성 및 Migration 실행
2.  Vercel에 연동 및 환경 변수 설정 (`.env.local` 참조)
3.  카카오 개발자 센터 & 메시징 API 키 발급
4.  병원 PC에 Chrome Extension 설치 (네이버 예약 연동용)

---

## 📂 Documentation

*   **[DEPLOYMENT.md](./DEPLOYMENT.md)**: 배포 및 초기 설정 가이드
*   **[WORKFLOW_AUTOMATION_FEATURES.md](./WORKFLOW_AUTOMATION_FEATURES.md)**: 자동화 기능 상세 명세
*   **[KAKAO_LOGIN_SETUP.md](./KAKAO_LOGIN_SETUP.md)**: 카카오 로그인 설정법

---

## 📞 Support
문의: support@doctorsflow.com
