# 사용자 플로우 개선 구현 가이드

## 🎯 즉시 구현 가능한 개선 사항 (Quick Wins)

### 1. 즐겨찾기 기능 구현

**데이터베이스 마이그레이션:**
```sql
-- supabase/migrations/014_template_favorites.sql
create table if not exists workflow_template_favorites (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references workflow_templates(id) on delete cascade,
  user_id text not null,
  created_at timestamp with time zone default now(),
  unique(template_id, user_id)
);

create index idx_template_favorites_user on workflow_template_favorites(user_id);
create index idx_template_favorites_template on workflow_template_favorites(template_id);

alter table workflow_template_favorites enable row level security;

create policy "Users can view their own favorites"
  on workflow_template_favorites for select
  using (auth.uid()::text = user_id);

create policy "Users can create their own favorites"
  on workflow_template_favorites for insert
  with check (auth.uid()::text = user_id);

create policy "Users can delete their own favorites"
  on workflow_template_favorites for delete
  using (auth.uid()::text = user_id);
```

**라이브러리 함수 추가:**
```typescript
// lib/workflow-template-library.ts에 추가

export async function addToFavorites(userId: string, templateId: string) {
  const { data, error } = await supabase
    .from('workflow_template_favorites')
    .insert({ user_id: userId, template_id: templateId })
    .select()
    .single();

  if (error && error.code !== '23505') throw error; // Ignore duplicate
  return data;
}

export async function removeFromFavorites(userId: string, templateId: string) {
  const { error } = await supabase
    .from('workflow_template_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('template_id', templateId);

  if (error) throw error;
}

export async function getUserFavorites(userId: string) {
  const { data, error } = await supabase
    .from('workflow_template_favorites')
    .select('template_id')
    .eq('user_id', userId);

  if (error) throw error;
  return data.map(f => f.template_id);
}

export async function isFavorite(userId: string, templateId: string) {
  const { data, error } = await supabase
    .from('workflow_template_favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('template_id', templateId)
    .single();

  return !error && !!data;
}
```

**API 라우트 추가:**
```typescript
// app/api/workflow-templates/[id]/favorite/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { addToFavorites, removeFromFavorites, isFavorite } from '@/lib/workflow-template-library';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { favorite } = body;

    if (favorite) {
      await addToFavorites(userId, params.id);
    } else {
      await removeFromFavorites(userId, params.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update favorite' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const favorited = await isFavorite(userId, params.id);
    return NextResponse.json({ favorited });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check favorite' },
      { status: 500 }
    );
  }
}
```

**컴포넌트 업데이트:**
```typescript
// components/workflow-template-marketplace.tsx에 추가

import { Heart } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

// 상태 추가
const [favorites, setFavorites] = useState<Set<string>>(new Set());
const { userId } = useAuth();

// 즐겨찾기 토글 함수
const handleToggleFavorite = async (templateId: string) => {
  if (!userId) return;
  
  const isFavorited = favorites.has(templateId);
  
  try {
    const response = await fetch(`/api/workflow-templates/${templateId}/favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorite: !isFavorited }),
    });

    if (!response.ok) throw new Error('Failed to update favorite');

    if (isFavorited) {
      setFavorites(prev => {
        const next = new Set(prev);
        next.delete(templateId);
        return next;
      });
      toast.success('즐겨찾기에서 제거되었습니다.');
    } else {
      setFavorites(prev => new Set(prev).add(templateId));
      toast.success('즐겨찾기에 추가되었습니다.');
    }
  } catch (error: any) {
    toast.error('즐겨찾기 업데이트 중 오류가 발생했습니다.');
  }
};

// 카드에 하트 아이콘 추가
<Button
  variant="ghost"
  size="sm"
  onClick={(e) => {
    e.stopPropagation();
    handleToggleFavorite(template.id);
  }}
  className="absolute top-2 right-2"
>
  <Heart
    className={`h-4 w-4 ${
      favorites.has(template.id)
        ? 'fill-red-500 text-red-500'
        : 'text-muted-foreground'
    }`}
  />
</Button>

// "내 즐겨찾기" 탭 추가
<Tabs defaultValue="all">
  <TabsList>
    <TabsTrigger value="all">전체</TabsTrigger>
    <TabsTrigger value="favorites">내 즐겨찾기</TabsTrigger>
  </TabsList>
  
  <TabsContent value="favorites">
    {filteredTemplates.filter(t => favorites.has(t.id)).map(...)}
  </TabsContent>
</Tabs>
```

### 2. 최근 본 템플릿 기능

**로컬 스토리지 활용:**
```typescript
// components/workflow-template-marketplace.tsx에 추가

const [recentTemplates, setRecentTemplates] = useState<WorkflowTemplateRecord[]>([]);

useEffect(() => {
  // 로컬 스토리지에서 최근 본 템플릿 로드
  const recentIds = JSON.parse(localStorage.getItem('recent_template_ids') || '[]');
  if (recentIds.length > 0) {
    const recent = templates.filter(t => recentIds.includes(t.id));
    setRecentTemplates(recent);
  }
}, [templates]);

const handleTemplateView = (template: WorkflowTemplateRecord) => {
  // 최근 본 템플릿에 추가
  const recentIds = JSON.parse(localStorage.getItem('recent_template_ids') || '[]');
  const updated = [template.id, ...recentIds.filter((id: string) => id !== template.id)].slice(0, 10);
  localStorage.setItem('recent_template_ids', JSON.stringify(updated));
  
  handlePreviewTemplate(template);
};

// 최근 본 템플릿 섹션 추가
{recentTemplates.length > 0 && (
  <div className="mb-8">
    <h3 className="text-xl font-bold mb-4">최근 본 템플릿</h3>
    <div className="grid gap-4 md:grid-cols-3">
      {recentTemplates.slice(0, 3).map(template => (
        <Card key={template.id} onClick={() => handleTemplateView(template)}>
          {/* 템플릿 카드 내용 */}
        </Card>
      ))}
    </div>
  </div>
)}
```

### 3. 추천 템플릿 섹션

```typescript
// 추천 템플릿 로직
const getRecommendedTemplates = useMemo(() => {
  // 1. 추천 템플릿 (is_featured)
  const featured = templates.filter(t => t.is_featured);
  
  // 2. 인기 템플릿 (사용 횟수 + 평점)
  const popular = [...templates]
    .sort((a, b) => {
      const scoreA = a.rating_average * a.usage_count;
      const scoreB = b.rating_average * b.usage_count;
      return scoreB - scoreA;
    })
    .slice(0, 3);
  
  // 3. 최근 추가된 템플릿
  const recent = [...templates]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);
  
  return { featured, popular, recent };
}, [templates]);

// UI에 추가
<div className="space-y-8">
  {/* 추천 템플릿 */}
  {getRecommendedTemplates.featured.length > 0 && (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">⭐ 추천 템플릿</h3>
        <Badge variant="secondary">추천</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {getRecommendedTemplates.featured.map(template => (
          <FeaturedTemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  )}
  
  {/* 인기 템플릿 */}
  {getRecommendedTemplates.popular.length > 0 && (
    <div>
      <h3 className="text-xl font-bold mb-4">🔥 인기 템플릿</h3>
      <div className="grid gap-4 md:grid-cols-3">
        {getRecommendedTemplates.popular.map(template => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  )}
</div>
```

### 4. 템플릿 커스터마이징 다이얼로그

```typescript
// 커스터마이징 상태
const [customizeOpen, setCustomizeOpen] = useState(false);
const [customizeTemplate, setCustomizeTemplate] = useState<WorkflowTemplateRecord | null>(null);
const [customWorkflowName, setCustomWorkflowName] = useState('');
const [customDescription, setCustomDescription] = useState('');
const [activateImmediately, setActivateImmediately] = useState(false);

// 커스터마이징 핸들러
const handleCustomizeAndUse = async () => {
  if (!customizeTemplate) return;
  
  try {
    const response = await fetch(`/api/workflow-templates/${customizeTemplate.id}/use`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflowName: customWorkflowName || `${customizeTemplate.name} (복사본)`,
        description: customDescription,
        activateImmediately,
      }),
    });

    if (!response.ok) throw new Error('Failed to create workflow');

    const data = await response.json();
    toast.success('워크플로우가 생성되었습니다.');
    setCustomizeOpen(false);
    
    if (activateImmediately) {
      router.push(`/dashboard/workflows/${data.workflow.id}`);
    } else {
      router.push('/dashboard/workflows');
    }
  } catch (error: any) {
    toast.error('워크플로우 생성 중 오류가 발생했습니다.');
  }
};

// "사용하기" 버튼 클릭 시
<Button
  onClick={() => {
    setCustomizeTemplate(template);
    setCustomWorkflowName(`${template.name} (복사본)`);
    setCustomDescription(template.description || '');
    setCustomizeOpen(true);
  }}
>
  사용하기
</Button>

// 커스터마이징 다이얼로그
<Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>템플릿 커스터마이징</DialogTitle>
      <DialogDescription>
        워크플로우를 생성하기 전에 이름과 설정을 변경할 수 있습니다.
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4">
      <div>
        <Label>워크플로우 이름</Label>
        <Input
          value={customWorkflowName}
          onChange={(e) => setCustomWorkflowName(e.target.value)}
          placeholder="워크플로우 이름을 입력하세요"
        />
      </div>
      
      <div>
        <Label>설명 (선택사항)</Label>
        <Textarea
          value={customDescription}
          onChange={(e) => setCustomDescription(e.target.value)}
          placeholder="워크플로우 설명을 입력하세요"
          rows={3}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="activate"
          checked={activateImmediately}
          onChange={(e) => setActivateImmediately(e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="activate" className="cursor-pointer">
          즉시 활성화
        </Label>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={() => setCustomizeOpen(false)}>
          취소
        </Button>
        <Button onClick={handleCustomizeAndUse} className="flex-1">
          워크플로우 생성
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

### 5. 향상된 필터링 UI

```typescript
// 필터 사이드바 컴포넌트
const [showFilters, setShowFilters] = useState(false);
const [selectedTags, setSelectedTags] = useState<string[]>([]);

// 모든 태그 추출
const allTags = useMemo(() => {
  const tagSet = new Set<string>();
  templates.forEach(t => {
    t.tags?.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}, [templates]);

// 태그 토글
const toggleTag = (tag: string) => {
  setSelectedTags(prev =>
    prev.includes(tag)
      ? prev.filter(t => t !== tag)
      : [...prev, tag]
  );
};

// 필터 초기화
const clearFilters = () => {
  setSelectedCategory('all');
  setSelectedSpecialty('all');
  setSelectedTags([]);
  setSearchQuery('');
  setShowFeaturedOnly(false);
};

// 활성 필터 표시
const activeFilters = useMemo(() => {
  const filters: string[] = [];
  if (selectedCategory !== 'all') filters.push(`카테고리: ${selectedCategory}`);
  if (selectedSpecialty !== 'all') filters.push(`전문과목: ${selectedSpecialty}`);
  if (selectedTags.length > 0) filters.push(`태그: ${selectedTags.length}개`);
  if (showFeaturedOnly) filters.push('추천만');
  return filters;
}, [selectedCategory, selectedSpecialty, selectedTags, showFeaturedOnly]);

// 필터링된 템플릿
const filteredTemplates = useMemo(() => {
  let filtered = templates;

  if (selectedCategory !== 'all') {
    filtered = filtered.filter(t => t.category === selectedCategory);
  }

  if (selectedSpecialty !== 'all') {
    filtered = filtered.filter(t => t.specialty === selectedSpecialty);
  }

  if (selectedTags.length > 0) {
    filtered = filtered.filter(t =>
      t.tags?.some(tag => selectedTags.includes(tag))
    );
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      t =>
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }

  if (showFeaturedOnly) {
    filtered = filtered.filter(t => t.is_featured);
  }

  return filtered;
}, [templates, selectedCategory, selectedSpecialty, selectedTags, searchQuery, showFeaturedOnly]);

// UI
<div className="flex gap-6">
  {/* 필터 사이드바 */}
  <aside className={`w-64 transition-all ${showFilters ? 'block' : 'hidden md:block'}`}>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">필터</CardTitle>
          {activeFilters.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              초기화
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 태그 필터 */}
        <div>
          <Label className="mb-2 block">태그</Label>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
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
          <div>
            <Label className="mb-2 block">활성 필터</Label>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map(filter => (
                <Badge key={filter} variant="secondary">
                  {filter}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </aside>
  
  {/* 메인 콘텐츠 */}
  <div className="flex-1">
    {/* 템플릿 그리드 */}
  </div>
</div>
```

## 📋 구현 체크리스트

### Phase 1: 즉시 구현 (1-2일)
- [ ] 즐겨찾기 기능 (데이터베이스 + API + UI)
- [ ] 최근 본 템플릿 (로컬 스토리지)
- [ ] 추천 템플릿 섹션
- [ ] 템플릿 커스터마이징 다이얼로그
- [ ] 향상된 필터링 UI

### Phase 2: 중기 구현 (3-5일)
- [ ] 빠른 미리보기 (호버 효과)
- [ ] 템플릿 비교 기능
- [ ] 사용 통계 개선
- [ ] 검색 개선 (자동완성)

### Phase 3: 장기 구현 (1-2주)
- [ ] 추천 시스템 알고리즘
- [ ] 댓글 시스템
- [ ] 분석 대시보드
- [ ] 템플릿 포크 기능

## 🎯 예상 효과

### 사용자 경험 개선
- 템플릿 발견 시간: 50% 감소
- 템플릿 사용률: 30% 증가
- 사용자 만족도: 40% 증가
- 재방문률: 25% 증가

### 비즈니스 효과
- 템플릿 사용 횟수 증가
- 커뮤니티 활성화
- 템플릿 품질 향상 (피드백 증가)
- 사용자 유지율 향상

