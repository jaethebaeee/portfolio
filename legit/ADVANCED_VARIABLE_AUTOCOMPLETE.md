# 고급 변수 자동완성 시스템

변수 자동완성 기능을 대폭 개선하여 더욱 지능적이고 사용하기 편리한 시스템으로 만들었습니다.

## ✨ 주요 기능

### 1. 컨텍스트 인식 자동완성
- **트리거 타입 기반 필터링**: 템플릿의 트리거 타입에 따라 관련 변수만 표시
  - 예: `appointment_completed` 트리거 → 예약 관련 변수 우선 표시
  - 예: `days_after_surgery` 트리거 → 수술 관련 변수 우선 표시

### 2. 퍼지 검색 (Fuzzy Search)
- 변수 이름, 설명, 예시에서 검색
- 부분 일치 지원
- 스코어링 기반 정렬 (정확한 일치 우선)

### 3. 키보드 단축키
- **↑↓**: 변수 목록에서 이동
- **Tab**: 선택된 변수 삽입
- **Esc**: 자동완성 닫기
- **{{ 입력**: 자동완성 열기

### 4. 변수 카테고리 및 그룹화
- **환자 정보**: patient_name, patient_phone, patient_email
- **예약 정보**: appointment_date, appointment_time, appointment_type
- **수술 정보**: days_since_surgery
- **마케팅**: coupon_code, coupon_expiry, days_until_birthday
- **시스템**: phone_number, booking_link, review_link, naver_review_link

### 5. 최근 사용한 변수 추적
- localStorage에 최근 사용한 변수 저장 (최대 5개)
- 자동완성 상단에 최근 사용한 변수 표시
- 시계 아이콘으로 구분

### 6. 변수 메타데이터
각 변수에 대한 풍부한 정보 제공:
- **설명**: 변수의 용도 설명
- **예시**: 실제 사용 예시 값
- **타입**: string, number, date, link
- **필수 여부**: 필수 변수 표시
- **관련 변수**: 함께 사용하기 좋은 변수 추천
- **트리거 타입**: 어떤 트리거에서 유용한지 표시

### 7. 향상된 UI/UX
- 변수별 예시 값 표시
- 카테고리별 그룹화로 가독성 향상
- 키보드 단축키 안내 표시
- 선택된 항목 하이라이트
- 검색 결과 실시간 업데이트

## 📁 파일 구조

### 새로 생성된 파일
1. **`lib/variable-metadata.ts`**
   - 변수 메타데이터 정의
   - 카테고리별 그룹화 함수
   - 트리거 타입별 필터링 함수
   - 퍼지 검색 함수

2. **`components/advanced-variable-autocomplete.tsx`**
   - 고급 자동완성 컴포넌트
   - 키보드 단축키 처리
   - 최근 사용한 변수 추적
   - 검색 및 필터링

3. **`components/ui/command.tsx`**
   - shadcn/ui Command 컴포넌트
   - 검색 및 선택 기능

### 개선된 파일
1. **`components/template-edit-dialog.tsx`**
   - 기존 VariableAutocomplete → AdvancedVariableAutocomplete로 교체
   - 트리거 타입 전달하여 컨텍스트 인식

## 🎯 사용 방법

### 기본 사용
```tsx
<AdvancedVariableAutocomplete
  value={messageContent}
  onChange={setMessageContent}
  triggerType="appointment_completed"
  textareaId="message-0"
/>
```

### 기능별 사용법

#### 1. 변수 삽입
- `{{` 입력 시 자동완성 팝업 표시
- 키보드 화살표로 이동
- Tab 또는 클릭으로 선택

#### 2. 검색
- 팝업이 열린 상태에서 타이핑하면 검색
- 변수 이름, 설명, 예시에서 검색

#### 3. 최근 사용한 변수
- 자동으로 최근 5개 변수 저장
- 자동완성 상단에 표시

## 🔧 기술적 세부사항

### 퍼지 검색 알고리즘
```typescript
function fuzzySearchVariables(query: string): VariableMetadata[] {
  // 스코어링 시스템:
  // - 이름이 정확히 일치: +10점
  // - 이름에 포함: +5점
  // - 설명에 포함: +3점
  // - 예시에 포함: +1점
  
  // 점수 순으로 정렬하여 반환
}
```

### 최근 사용한 변수 저장
- localStorage 사용 (`template_recent_variables` 키)
- 최대 5개 저장
- 중복 제거 및 최신순 정렬

### 트리거 타입별 필터링
```typescript
// 트리거 타입에 맞는 변수만 필터링
const variables = getVariablesForTrigger('appointment_completed');
// → appointment_date, appointment_time, patient_name 등
```

## 📊 변수 메타데이터 구조

```typescript
interface VariableMetadata {
  name: string;                    // 변수 이름
  description: string;              // 설명
  category: 'patient' | ...;        // 카테고리
  example: string;                  // 예시 값
  type: 'string' | 'number' | ...; // 타입
  required?: boolean;                // 필수 여부
  triggerTypes?: string[];          // 유용한 트리거 타입
  relatedVariables?: string[];    // 관련 변수
}
```

## 🚀 향후 개선 가능 사항

1. **변수 사용 통계**
   - 어떤 변수가 가장 많이 사용되는지 추적
   - 인기 변수 우선 표시

2. **변수 검증 하이라이팅**
   - 텍스트에어리어에서 잘못된 변수 하이라이트
   - 실시간 검증 피드백

3. **변수 자동완성 히스토리**
   - 사용자가 자주 함께 사용하는 변수 조합 학습
   - 스마트 추천

4. **변수 설명 확장**
   - 더 자세한 사용 예시
   - 변수 조합 예시

5. **다국어 지원**
   - 변수 설명 다국어화
   - 예시 값 현지화

## 💡 사용 예시

### 시나리오 1: 예약 완료 템플릿 작성
1. 트리거 타입: `appointment_completed` 선택
2. `{{` 입력
3. 자동완성에 예약 관련 변수만 표시됨
4. `appointment_date` 선택
5. 자동으로 `{{appointment_date}}` 삽입

### 시나리오 2: 변수 검색
1. `{{` 입력하여 자동완성 열기
2. "생일" 입력
3. `days_until_birthday`, `coupon_code` 등 생일 관련 변수 표시

### 시나리오 3: 최근 사용한 변수
1. 여러 템플릿에서 `patient_name` 사용
2. 다음 템플릿 작성 시 `{{` 입력
3. 최근 사용한 변수 섹션에 `patient_name` 표시
4. 빠르게 재사용 가능

## 🎨 UI 개선사항

- 카테고리별 그룹화로 가독성 향상
- 변수 예시 값 표시로 이해도 향상
- 키보드 단축키 안내로 사용성 향상
- 선택된 항목 하이라이트로 명확성 향상
- 최근 사용한 변수 섹션으로 효율성 향상

이제 변수 자동완성이 훨씬 더 지능적이고 사용하기 편리해졌습니다! 🎉

