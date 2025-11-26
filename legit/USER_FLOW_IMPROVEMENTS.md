# 워크플로우 템플릿 마켓플레이스 사용자 플로우 개선 제안

## 현재 사용자 플로우 분석

### 현재 플로우
1. 마켓플레이스 접근
2. 검색/필터링
3. 템플릿 카드 클릭 → 미리보기 다이얼로그
4. "사용하기" 버튼 → 워크플로우 생성 → 편집 페이지로 이동

### 발견된 문제점
- 템플릿 발견이 어려움 (처음 사용자)
- 템플릿 비교가 불가능
- 사용 전 커스터마이징 불가
- 즐겨찾기/북마크 없음
- 최근 본 템플릿 히스토리 없음
- 템플릿 사용 통계 부족
- 빠른 미리보기 부족

## 🎯 개선 제안

### 1. 템플릿 발견성 개선 ⭐⭐⭐

#### 문제
- 처음 사용자가 어떤 템플릿을 선택해야 할지 모름
- 인기 템플릿이 명확하지 않음

#### 개선안
```typescript
// 추천 섹션 추가
- "추천 템플릿" 섹션 (상단 배너)
- "인기 템플릿" 섹션 (사용 횟수 기반)
- "최근 추가된 템플릿" 섹션
- "당신을 위한 추천" (사용 이력 기반)
- "비슷한 템플릿" 추천
```

**구현 예시:**
```tsx
// 추천 템플릿 섹션
<div className="mb-8">
  <h3 className="text-xl font-bold mb-4">추천 템플릿</h3>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {featuredTemplates.map(template => (
      <FeaturedTemplateCard key={template.id} template={template} />
    ))}
  </div>
</div>
```

### 2. 빠른 미리보기 개선 ⭐⭐⭐

#### 문제
- 미리보기를 보려면 다이얼로그를 열어야 함
- 템플릿 구조를 빠르게 파악하기 어려움

#### 개선안
```typescript
// 호버 시 미리보기
- 카드 호버 시 노드 구조 미리보기
- 카드 내 상세 정보 확장
- 썸네일 이미지 (워크플로우 구조 시각화)
- 노드 개수, 연결 수, 예상 실행 시간 표시
```

**구현 예시:**
```tsx
// 카드 호버 시 확장
<Card 
  className="group"
  onMouseEnter={() => setHoveredTemplate(template.id)}
>
  {hoveredTemplate === template.id && (
    <div className="absolute z-10 bg-background border rounded-lg shadow-xl p-4">
      <WorkflowPreview nodes={template.visual_data?.nodes} />
    </div>
  )}
</Card>
```

### 3. 템플릿 비교 기능 ⭐⭐

#### 문제
- 여러 템플릿을 비교하기 어려움
- 어떤 템플릿이 더 나은지 판단 불가

#### 개선안
```typescript
// 비교 모드 추가
- 체크박스로 템플릿 선택 (최대 3개)
- "비교하기" 버튼
- 비교 테이블 (노드 수, 평점, 사용 횟수, 특징)
- 시각적 비교 (워크플로우 구조 나란히)
```

**구현 예시:**
```tsx
// 비교 모드
const [compareMode, setCompareMode] = useState(false);
const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

// 비교 테이블
{compareMode && selectedForCompare.length > 0 && (
  <TemplateComparisonTable 
    templateIds={selectedForCompare}
    templates={templates}
  />
)}
```

### 4. 템플릿 즐겨찾기/북마크 ⭐⭐⭐

#### 문제
- 좋은 템플릿을 나중에 찾기 어려움
- 자주 사용하는 템플릿 접근 불편

#### 개선안
```typescript
// 즐겨찾기 기능
- 하트 아이콘으로 즐겨찾기 추가/제거
- "내 즐겨찾기" 탭 추가
- 즐겨찾기한 템플릿 우선 표시
- 즐겨찾기 목록 페이지
```

**데이터베이스 추가:**
```sql
create table workflow_template_favorites (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references workflow_templates(id) on delete cascade,
  user_id text not null,
  created_at timestamp with time zone default now(),
  unique(template_id, user_id)
);
```

### 5. 템플릿 커스터마이징 (사용 전 수정) ⭐⭐⭐

#### 문제
- 템플릿을 사용하면 바로 워크플로우가 생성됨
- 사용 전에 템플릿을 수정하고 싶을 때 불편

#### 개선안
```typescript
// 커스터마이징 플로우
1. "사용하기" 클릭
2. "템플릿 커스터마이징" 옵션 제공
3. 템플릿 이름, 설명 수정
4. 노드/엣지 수정 (선택사항)
5. 워크플로우 생성
```

**구현 예시:**
```tsx
// 커스터마이징 다이얼로그
<Dialog open={customizeOpen}>
  <DialogContent>
    <DialogTitle>템플릿 커스터마이징</DialogTitle>
    <div>
      <Label>워크플로우 이름</Label>
      <Input value={workflowName} onChange={...} />
      
      <Label>설명</Label>
      <Textarea value={description} onChange={...} />
      
      <Button onClick={handleCustomizeAndCreate}>
        커스터마이징 후 생성
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

### 6. 최근 본 템플릿 히스토리 ⭐⭐

#### 문제
- 방금 본 템플릿을 다시 찾기 어려움
- 브라우징 히스토리 없음

#### 개선안
```typescript
// 히스토리 기능
- 로컬 스토리지에 최근 본 템플릿 저장
- "최근 본 템플릿" 섹션 추가
- 히스토리 클리어 기능
- 최근 본 템플릿에서 빠른 접근
```

**구현 예시:**
```tsx
// 최근 본 템플릿
const [recentTemplates, setRecentTemplates] = useState<string[]>([]);

useEffect(() => {
  const recent = localStorage.getItem('recent_templates');
  if (recent) setRecentTemplates(JSON.parse(recent));
}, []);

const handleTemplateView = (templateId: string) => {
  const updated = [templateId, ...recentTemplates.filter(id => id !== templateId)].slice(0, 10);
  setRecentTemplates(updated);
  localStorage.setItem('recent_templates', JSON.stringify(updated));
};
```

### 7. 향상된 필터링 UI ⭐⭐

#### 문제
- 필터가 한 줄에 있어서 복잡해 보임
- 태그 필터가 없음
- 다중 선택 불가

#### 개선안
```typescript
// 개선된 필터 UI
- 필터 사이드바 (접을 수 있음)
- 태그 필터 (다중 선택)
- 전문과목 필터 (다중 선택)
- 날짜 범위 필터
- 필터 초기화 버튼
- 활성 필터 표시 (칩 형태)
```

**구현 예시:**
```tsx
// 필터 사이드바
<aside className="w-64 border-r">
  <div className="p-4">
    <h3 className="font-semibold mb-4">필터</h3>
    
    {/* 태그 필터 */}
    <div className="mb-4">
      <Label>태그</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map(tag => (
          <Badge 
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            onClick={() => toggleTag(tag)}
            className="cursor-pointer"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
    
    {/* 활성 필터 표시 */}
    {activeFilters.length > 0 && (
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(filter => (
            <Badge key={filter} variant="secondary">
              {filter} ×
            </Badge>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          모두 지우기
        </Button>
      </div>
    )}
  </div>
</aside>
```

### 8. 템플릿 사용 통계 표시 ⭐⭐

#### 문제
- 템플릿이 얼마나 사용되었는지 불명확
- 성공률이나 만족도 정보 부족

#### 개선안
```typescript
// 통계 정보 추가
- 사용 횟수 (더 눈에 띄게)
- 성공률 (워크플로우 실행 성공률)
- 평균 만족도
- 최근 사용 일자
- 사용자 수
- 성장 추이 (그래프)
```

**구현 예시:**
```tsx
// 통계 카드
<div className="flex items-center gap-4 text-sm">
  <div className="flex items-center gap-1">
    <Users className="h-4 w-4" />
    <span>{template.usage_count}명 사용</span>
  </div>
  <div className="flex items-center gap-1">
    <TrendingUp className="h-4 w-4" />
    <span>지난 주 +{template.weekly_growth}%</span>
  </div>
  <div className="flex items-center gap-1">
    <CheckCircle className="h-4 w-4 text-green-500" />
    <span>{template.success_rate}% 성공률</span>
  </div>
</div>
```

### 9. 템플릿 추천 시스템 ⭐⭐⭐

#### 문제
- 개인화된 추천 없음
- 사용자의 전문과목/선호도 반영 안 됨

#### 개선안
```typescript
// 추천 알고리즘
- 사용 이력 기반 추천
- 전문과목 기반 추천
- 비슷한 템플릿 추천
- 협업 필터링 (다른 사용자들이 좋아한 템플릿)
- A/B 테스트를 통한 추천 개선
```

**구현 예시:**
```tsx
// 추천 섹션
const getRecommendedTemplates = async (userId: string) => {
  // 1. 사용자의 전문과목 기반
  // 2. 사용 이력 기반
  // 3. 비슷한 사용자들이 좋아한 템플릿
  // 4. 인기 템플릿과 조합
};

<div className="mb-8">
  <h3 className="text-xl font-bold mb-4">당신을 위한 추천</h3>
  <div className="grid grid-cols-3 gap-4">
    {recommendedTemplates.map(template => (
      <RecommendedTemplateCard key={template.id} template={template} />
    ))}
  </div>
</div>
```

### 10. 템플릿 사용 전 확인 단계 ⭐⭐

#### 문제
- 템플릿을 사용하면 바로 생성되어 실수 가능
- 사용 전에 한 번 더 확인할 기회 없음

#### 개선안
```typescript
// 확인 다이얼로그
- "사용하기" 클릭 시 확인 다이얼로그
- 템플릿 요약 정보 표시
- 워크플로우 이름 입력
- 즉시 활성화 여부 선택
- 확인 후 생성
```

**구현 예시:**
```tsx
// 확인 다이얼로그
<Dialog open={confirmOpen}>
  <DialogContent>
    <DialogTitle>템플릿 사용 확인</DialogTitle>
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold">{template.name}</h4>
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </div>
      
      <div>
        <Label>워크플로우 이름</Label>
        <Input 
          value={workflowName} 
          onChange={(e) => setWorkflowName(e.target.value)}
          placeholder={`${template.name} (복사본)`}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          id="activate"
          checked={activateImmediately}
          onChange={(e) => setActivateImmediately(e.target.checked)}
        />
        <Label htmlFor="activate">즉시 활성화</Label>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setConfirmOpen(false)}>
          취소
        </Button>
        <Button onClick={handleConfirmUse}>
          생성하기
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

### 11. 템플릿 포크/수정 기능 ⭐⭐

#### 문제
- 템플릿을 기반으로 수정하고 싶을 때 불편
- 원본 템플릿과의 연결이 끊김

#### 개선안
```typescript
// 포크 기능
- "포크하기" 버튼 추가
- 원본 템플릿 정보 유지
- 수정된 템플릿을 새 템플릿으로 저장
- 원본 템플릿 업데이트 알림
```

**구현 예시:**
```tsx
// 포크 다이얼로그
<Dialog open={forkOpen}>
  <DialogContent>
    <DialogTitle>템플릿 포크</DialogTitle>
    <p className="text-sm text-muted-foreground">
      이 템플릿을 기반으로 새 템플릿을 만들 수 있습니다.
    </p>
    <div className="space-y-4">
      <div>
        <Label>새 템플릿 이름</Label>
        <Input value={forkName} onChange={...} />
      </div>
      <div>
        <Label>설명</Label>
        <Textarea value={forkDescription} onChange={...} />
      </div>
      <Button onClick={handleForkTemplate}>
        포크하기
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

### 12. 템플릿 버전 관리 ⭐

#### 문제
- 템플릿 업데이트 시 이전 버전 정보 없음
- 변경 사항 추적 불가

#### 개선안
```typescript
// 버전 관리
- 템플릿 버전 표시
- 변경 이력 보기
- 이전 버전으로 되돌리기
- 버전 비교
```

### 13. 템플릿 댓글/토론 ⭐⭐

#### 문제
- 템플릿에 대한 피드백이나 질문 불가
- 사용자 간 소통 부족

#### 개선안
```typescript
// 댓글 시스템
- 템플릿별 댓글 섹션
- 질문/답변 기능
- 좋아요/도움됨 표시
- 작성자 답변 표시
```

### 14. 템플릿 사용 가이드/튜토리얼 ⭐⭐⭐

#### 문제
- 처음 사용자가 템플릿 사용법을 모름
- 각 템플릿의 사용 시나리오 불명확

#### 개선안
```typescript
// 가이드 시스템
- 템플릿별 사용 가이드
- 단계별 튜토리얼
- 비디오 가이드 (선택사항)
- FAQ 섹션
- 사용 예시
```

**구현 예시:**
```tsx
// 가이드 탭
<Tabs defaultValue="preview">
  <TabsList>
    <TabsTrigger value="preview">미리보기</TabsTrigger>
    <TabsTrigger value="guide">사용 가이드</TabsTrigger>
    <TabsTrigger value="examples">사용 예시</TabsTrigger>
  </TabsList>
  
  <TabsContent value="guide">
    <div className="space-y-4">
      <h4 className="font-semibold">이 템플릿 사용 방법</h4>
      <ol className="list-decimal list-inside space-y-2">
        <li>템플릿을 사용하여 워크플로우를 생성합니다</li>
        <li>환자 정보를 확인하고 필요시 수정합니다</li>
        <li>워크플로우를 활성화합니다</li>
      </ol>
    </div>
  </TabsContent>
</Tabs>
```

### 15. 검색 개선 ⭐⭐

#### 문제
- 검색이 단순 문자열 매칭만 함
- 오타 허용 없음
- 관련 템플릿 찾기 어려움

#### 개선안
```typescript
// 향상된 검색
- 퍼지 검색 (오타 허용)
- 동의어 검색
- 태그 기반 검색
- 검색 제안 (자동완성)
- 최근 검색어
- 인기 검색어
```

### 16. 템플릿 목록 뷰 옵션 ⭐

#### 문제
- 그리드 뷰만 있음
- 목록 뷰나 컴팩트 뷰 없음

#### 개선안
```typescript
// 뷰 옵션
- 그리드 뷰 (현재)
- 목록 뷰 (더 많은 정보)
- 컴팩트 뷰 (한 화면에 더 많이)
- 뷰 설정 저장
```

### 17. 템플릿 공유 링크 ⭐⭐

#### 문제
- 템플릿을 다른 사람에게 공유하기 어려움
- 공유 링크 없음

#### 개선안
```typescript
// 공유 기능
- 공유 링크 생성
- 소셜 미디어 공유
- 이메일 공유
- QR 코드 생성
- 공유 통계
```

### 18. 템플릿 사용 분석 대시보드 ⭐

#### 문제
- 내가 사용한 템플릿 통계 없음
- 어떤 템플릿이 효과적인지 모름

#### 개선안
```typescript
// 분석 대시보드
- 내가 사용한 템플릿 목록
- 템플릿별 성과 지표
- 가장 효과적인 템플릿
- 사용 추이 그래프
```

## 📊 우선순위 매트릭스

| 개선 사항 | 사용자 가치 | 구현 난이도 | 우선순위 |
|----------|------------|------------|---------|
| 템플릿 발견성 개선 | 높음 | 낮음 | ⭐⭐⭐ |
| 빠른 미리보기 개선 | 높음 | 중간 | ⭐⭐⭐ |
| 템플릿 커스터마이징 | 높음 | 중간 | ⭐⭐⭐ |
| 즐겨찾기 기능 | 높음 | 낮음 | ⭐⭐⭐ |
| 템플릿 추천 시스템 | 높음 | 높음 | ⭐⭐⭐ |
| 템플릿 비교 기능 | 중간 | 중간 | ⭐⭐ |
| 최근 본 템플릿 | 중간 | 낮음 | ⭐⭐ |
| 향상된 필터링 | 중간 | 중간 | ⭐⭐ |
| 사용 통계 표시 | 중간 | 낮음 | ⭐⭐ |
| 확인 단계 추가 | 중간 | 낮음 | ⭐⭐ |
| 포크 기능 | 중간 | 중간 | ⭐⭐ |
| 댓글 시스템 | 중간 | 높음 | ⭐⭐ |
| 사용 가이드 | 높음 | 중간 | ⭐⭐⭐ |
| 검색 개선 | 중간 | 중간 | ⭐⭐ |
| 뷰 옵션 | 낮음 | 낮음 | ⭐ |
| 공유 링크 | 중간 | 낮음 | ⭐⭐ |
| 분석 대시보드 | 중간 | 높음 | ⭐ |

## 🚀 추천 구현 순서

### Phase 1: 즉시 개선 (높은 가치, 낮은 난이도)
1. **템플릿 발견성 개선** - 추천 섹션 추가
2. **즐겨찾기 기능** - 하트 아이콘 추가
3. **최근 본 템플릿** - 로컬 스토리지 활용
4. **사용 통계 표시** - 기존 데이터 활용
5. **확인 단계 추가** - 다이얼로그 개선

### Phase 2: 중기 개선 (높은 가치, 중간 난이도)
6. **빠른 미리보기** - 호버 효과 추가
7. **템플릿 커스터마이징** - 사용 전 수정 기능
8. **향상된 필터링** - 사이드바 필터
9. **템플릿 비교** - 비교 모드 추가
10. **사용 가이드** - 가이드 탭 추가

### Phase 3: 장기 개선 (높은 가치, 높은 난이도)
11. **템플릿 추천 시스템** - 알고리즘 구현
12. **댓글 시스템** - 커뮤니티 기능
13. **분석 대시보드** - 통계 시각화
14. **검색 개선** - 퍼지 검색, 자동완성

## 💡 구현 예시 코드

각 개선 사항에 대한 구체적인 구현 예시는 위의 각 섹션에 포함되어 있습니다.

## 📝 결론

현재 구현은 기본 기능은 완료되었지만, 사용자 경험을 크게 개선할 수 있는 여지가 많습니다. 특히 템플릿 발견성, 빠른 미리보기, 커스터마이징 기능이 가장 중요한 개선 사항입니다.

