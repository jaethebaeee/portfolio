"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Eye,
  Plus,
  Star,
  Download,
  Upload,
  Search,
  Users,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { WorkflowTemplateRecord } from "@/lib/workflow-template-library";
import { exportTemplateAsJSON } from "@/lib/workflow-template-library";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface WorkflowTemplateMarketplaceProps {
  onSelectTemplate?: (template: WorkflowTemplateRecord) => void;
  onCreateWorkflow?: (template: WorkflowTemplateRecord) => void;
}

export function WorkflowTemplateMarketplace({
  onSelectTemplate,
  onCreateWorkflow,
}: WorkflowTemplateMarketplaceProps) {
  const router = useRouter();
  const { userId } = useAuth();
  
  const [templates, setTemplates] = useState<WorkflowTemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplateRecord | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  
  // Favorites
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rating" | "usage" | "recent">("recent");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  
  // Rating
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  
  // Customize
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [customizeTemplate, setCustomizeTemplate] = useState<WorkflowTemplateRecord | null>(null);
  const [customWorkflowName, setCustomWorkflowName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [activateImmediately, setActivateImmediately] = useState(false);

  // Load templates and favorites
  useEffect(() => {
    loadTemplates();
    if (userId) {
      loadFavorites();
    }
  }, [selectedCategory, selectedSpecialty, sortBy, showFeaturedOnly, searchQuery, userId]);

  // Load favorites
  const loadFavorites = async () => {
    if (!userId || templates.length === 0) return;
    try {
      // 모든 템플릿의 즐겨찾기 상태 확인
      const favoritePromises = templates.map(async (template) => {
        try {
          const response = await fetch(`/api/workflow-templates/${template.id}/favorite`);
          if (!response.ok) return null;
          const data = await response.json();
          return data.favorited ? template.id : null;
        } catch {
          return null;
        }
      });
      
      const favoriteResults = await Promise.all(favoritePromises);
      const favoriteIds = new Set(favoriteResults.filter((id): id is string => id !== null));
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) {
      toast.error('로그인이 필요합니다.');
      return;
    }

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
      console.error('Error toggling favorite:', error);
      toast.error('즐겨찾기 업데이트 중 오류가 발생했습니다.');
    }
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedSpecialty !== "all") params.append("specialty", selectedSpecialty);
      if (showFeaturedOnly) params.append("featured", "true");
      params.append("sortBy", sortBy);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/workflow-templates?${params.toString()}`);
      const data = await response.json();
      const loadedTemplates = data.templates || [];
      setTemplates(loadedTemplates);
      
      // 템플릿 로드 후 즐겨찾기 로드
      if (userId && loadedTemplates.length > 0) {
        loadFavoritesForTemplates(loadedTemplates);
      }
    } catch (error: any) {
      console.error("Error loading templates:", error);
      toast.error("템플릿을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 템플릿 목록에 대한 즐겨찾기 로드
  const loadFavoritesForTemplates = async (templateList: WorkflowTemplateRecord[]) => {
    if (!userId) return;
    try {
      const favoritePromises = templateList.map(async (template) => {
        try {
          const response = await fetch(`/api/workflow-templates/${template.id}/favorite`);
          if (!response.ok) return null;
          const data = await response.json();
          return data.favorited ? template.id : null;
        } catch {
          return null;
        }
      });
      
      const favoriteResults = await Promise.all(favoritePromises);
      const favoriteIds = new Set(favoriteResults.filter((id): id is string => id !== null));
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // 추천 템플릿 계산
  const recommendedTemplates = useMemo(() => {
    const featured = templates.filter(t => t.is_featured);
    
    const popular = [...templates]
      .filter(t => t.rating_count > 0 || t.usage_count > 0)
      .sort((a, b) => {
        // 평점과 사용 횟수를 조합한 점수 계산
        const scoreA = (a.rating_average * a.rating_count) + (a.usage_count * 0.1);
        const scoreB = (b.rating_average * b.rating_count) + (b.usage_count * 0.1);
        return scoreB - scoreA;
      })
      .slice(0, 6);
    
    const recent = [...templates]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6);
    
    return { featured, popular, recent };
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // 즐겨찾기 탭 필터
    if (activeTab === 'favorites') {
      filtered = filtered.filter(t => favorites.has(t.id));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [templates, searchQuery, activeTab, favorites]);

  const handlePreviewTemplate = (template: WorkflowTemplateRecord) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleUseTemplate = (template: WorkflowTemplateRecord) => {
    setCustomizeTemplate(template);
    setCustomWorkflowName(`${template.name} (복사본)`);
    setCustomDescription(template.description || '');
    setActivateImmediately(false);
    setCustomizeOpen(true);
  };

  const handleCustomizeAndUse = async () => {
    if (!customizeTemplate) return;

    try {
      const response = await fetch(`/api/workflow-templates/${customizeTemplate.id}/use`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowName: customWorkflowName || `${customizeTemplate.name} (복사본)`,
          description: customDescription || undefined,
          activateImmediately,
        }),
      });

      if (!response.ok) throw new Error("Failed to create workflow");

      const data = await response.json();
      toast.success("워크플로우가 생성되었습니다.");
      setCustomizeOpen(false);

      if (onCreateWorkflow) {
        onCreateWorkflow(customizeTemplate);
      } else if (activateImmediately) {
        router.push(`/dashboard/workflows/${data.workflow.id}`);
      } else {
        router.push('/dashboard/workflows');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '워크플로우 생성 중 오류가 발생했습니다.';
      console.error("Error using template:", error);
      toast.error(errorMessage);
    }
  };

  const handleShareTemplate = async (template: WorkflowTemplateRecord, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/workflow-templates/${template.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic }),
      });

      if (!response.ok) throw new Error("Failed to share template");

      toast.success(isPublic ? "템플릿이 공개되었습니다." : "템플릿 공개가 취소되었습니다.");
      loadTemplates();
      setShareDialogOpen(false);
    } catch (error: any) {
      console.error("Error sharing template:", error);
      toast.error("템플릿 공개 중 오류가 발생했습니다.");
    }
  };

  const handleRateTemplate = async (template: WorkflowTemplateRecord) => {
    try {
      const response = await fetch(`/api/workflow-templates/${template.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: ratingComment || undefined }),
      });

      if (!response.ok) throw new Error("Failed to rate template");

      toast.success("평점이 등록되었습니다.");
      setRatingDialogOpen(false);
      setRating(5);
      setRatingComment("");
      loadTemplates();
    } catch (error: any) {
      console.error("Error rating template:", error);
      toast.error("평점 등록 중 오류가 발생했습니다.");
    }
  };

  const handleExportTemplate = (template: WorkflowTemplateRecord) => {
    try {
      const json = exportTemplateAsJSON(template);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template.name.replace(/\s+/g, "_")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("템플릿이 내보내졌습니다.");
    } catch (error: any) {
      console.error("Error exporting template:", error);
      toast.error("템플릿 내보내기 중 오류가 발생했습니다.");
    }
  };

  const handleImportTemplate = async (file: File) => {
    try {
      const text = await file.text();
      const response = await fetch("/api/workflow-templates/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: text, isPublic: false }),
      });

      if (!response.ok) throw new Error("Failed to import template");

      toast.success("템플릿이 가져와졌습니다.");
      setImportDialogOpen(false);
      loadTemplates();
    } catch (error: any) {
      console.error("Error importing template:", error);
      toast.error("템플릿 가져오기 중 오류가 발생했습니다.");
    }
  };

  const categoryColors: Record<string, string> = {
    안과: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    성형외과: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    피부과: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    공통: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">워크플로우 템플릿 마켓플레이스</h2>
          <p className="text-muted-foreground">
            전문가들이 만든 워크플로우 템플릿을 탐색하고 공유하세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                가져오기
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>템플릿 가져오기</DialogTitle>
                <DialogDescription>
                  JSON 파일에서 워크플로우 템플릿을 가져옵니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Label htmlFor="import-file">JSON 파일 선택</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportTemplate(file);
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Recommended Templates Section */}
      {activeTab === 'all' && !searchQuery && (
        <div className="space-y-8">
          {/* 추천 템플릿 */}
          {recommendedTemplates.featured.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <h3 className="text-xl font-bold">추천 템플릿</h3>
                </div>
                <Badge variant="secondary">추천</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendedTemplates.featured.slice(0, 3).map((template) => (
                  <Card
                    key={template.id}
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer border-t-4 border-t-yellow-500 hover:border-t-yellow-600 group relative"
                    onClick={() => handlePreviewTemplate(template)}
                  >
                    {userId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-10 h-8 w-8"
                        onClick={(e) => handleToggleFavorite(template.id, e)}
                      >
                        <Heart
                          className={`h-4 w-4 transition-colors ${
                            favorites.has(template.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-muted-foreground hover:text-red-500'
                          }`}
                        />
                      </Button>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1 pr-8">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                            {template.name}
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          </CardTitle>
                          <CardDescription className="text-sm line-clamp-2 h-10">
                            {template.description}
                          </CardDescription>
                        </div>
                        <Badge className={categoryColors[template.category]}>
                          {template.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {template.rating_count > 0 && (
                            <div className="flex items-center gap-1">
                              {renderStars(Math.round(template.rating_average))}
                              <span className="ml-1">
                                {template.rating_average.toFixed(1)} ({template.rating_count})
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {template.usage_count}회 사용
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseTemplate(template);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          사용하기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 인기 템플릿 */}
          {recommendedTemplates.popular.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-orange-500" />
                <h3 className="text-xl font-bold">인기 템플릿</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendedTemplates.popular.slice(0, 6).map((template) => (
                  <Card
                    key={template.id}
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer border-t-4 border-t-transparent hover:border-t-primary group relative"
                    onClick={() => handlePreviewTemplate(template)}
                  >
                    {userId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-10 h-8 w-8"
                        onClick={(e) => handleToggleFavorite(template.id, e)}
                      >
                        <Heart
                          className={`h-4 w-4 transition-colors ${
                            favorites.has(template.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-muted-foreground hover:text-red-500'
                          }`}
                        />
                      </Button>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1 pr-8">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {template.name}
                          </CardTitle>
                          <CardDescription className="text-sm line-clamp-2 h-10">
                            {template.description}
                          </CardDescription>
                        </div>
                        <Badge className={categoryColors[template.category]}>
                          {template.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {template.rating_count > 0 && (
                            <div className="flex items-center gap-1">
                              {renderStars(Math.round(template.rating_average))}
                              <span className="ml-1">
                                {template.rating_average.toFixed(1)} ({template.rating_count})
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {template.usage_count}회 사용
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseTemplate(template);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          사용하기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 최근 추가된 템플릿 */}
          {recommendedTemplates.recent.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Plus className="h-5 w-5 text-blue-500" />
                <h3 className="text-xl font-bold">최근 추가된 템플릿</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendedTemplates.recent.slice(0, 6).map((template) => (
                  <Card
                    key={template.id}
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer border-t-4 border-t-transparent hover:border-t-primary group relative"
                    onClick={() => handlePreviewTemplate(template)}
                  >
                    {userId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-10 h-8 w-8"
                        onClick={(e) => handleToggleFavorite(template.id, e)}
                      >
                        <Heart
                          className={`h-4 w-4 transition-colors ${
                            favorites.has(template.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-muted-foreground hover:text-red-500'
                          }`}
                        />
                      </Button>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1 pr-8">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {template.name}
                          </CardTitle>
                          <CardDescription className="text-sm line-clamp-2 h-10">
                            {template.description}
                          </CardDescription>
                        </div>
                        <Badge className={categoryColors[template.category]}>
                          {template.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {template.rating_count > 0 && (
                            <div className="flex items-center gap-1">
                              {renderStars(Math.round(template.rating_average))}
                              <span className="ml-1">
                                {template.rating_average.toFixed(1)} ({template.rating_count})
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {template.usage_count}회 사용
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUseTemplate(template);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          사용하기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "favorites")}>
        <TabsList>
          <TabsTrigger value="all">전체 템플릿</TabsTrigger>
          <TabsTrigger value="favorites">
            내 즐겨찾기
            {favorites.size > 0 && (
              <Badge variant="secondary" className="ml-2">
                {favorites.size}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>검색</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="템플릿 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="안과">안과</SelectItem>
                  <SelectItem value="성형외과">성형외과</SelectItem>
                  <SelectItem value="피부과">피부과</SelectItem>
                  <SelectItem value="공통">공통</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>정렬</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">최신순</SelectItem>
                  <SelectItem value="rating">평점순</SelectItem>
                  <SelectItem value="usage">사용순</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>옵션</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={showFeaturedOnly}
                  onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  추천만 보기
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {loading ? (
        <div className="text-center py-12">로딩 중...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {activeTab === 'favorites' ? (
            <div className="space-y-4">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p>즐겨찾기한 템플릿이 없습니다.</p>
              <Button variant="outline" onClick={() => setActiveTab('all')}>
                템플릿 탐색하기
              </Button>
            </div>
          ) : (
            '템플릿을 찾을 수 없습니다.'
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer border-t-4 border-t-transparent hover:border-t-primary group relative"
            >
              {/* 즐겨찾기 버튼 */}
              {userId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 h-8 w-8"
                  onClick={(e) => handleToggleFavorite(template.id, e)}
                >
                  <Heart
                    className={`h-4 w-4 transition-colors ${
                      favorites.has(template.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-muted-foreground hover:text-red-500'
                    }`}
                  />
                </Button>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 pr-8">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2 h-10">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Badge className={categoryColors[template.category]}>
                    {template.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {template.rating_count > 0 && (
                      <div className="flex items-center gap-1">
                        {renderStars(Math.round(template.rating_average))}
                        <span className="ml-1">
                          {template.rating_average.toFixed(1)} ({template.rating_count})
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {template.usage_count}회 사용
                    </div>
                  </div>

                  {/* Tags */}
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreviewTemplate(template)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      미리보기
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      사용하기
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExportTemplate(template)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate?.name}
              <Badge className={categoryColors[selectedTemplate?.category || "공통"]}>
                {selectedTemplate?.category}
              </Badge>
            </DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Template Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">템플릿 정보</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">카테고리:</span> {selectedTemplate?.category}
                    </div>
                    {selectedTemplate?.specialty && (
                      <div>
                        <span className="font-medium">전문과목:</span> {selectedTemplate.specialty}
                      </div>
                    )}
                    {selectedTemplate?.rating_count > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">평점:</span>
                        {renderStars(Math.round(selectedTemplate.rating_average))}
                        <span>{selectedTemplate.rating_average.toFixed(1)}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">사용 횟수:</span> {selectedTemplate?.usage_count}회
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">워크플로우 구조</h4>
                  <div className="space-y-1 text-sm">
                    {selectedTemplate?.visual_data?.nodes && (
                      <div>
                        노드 수: {selectedTemplate.visual_data.nodes.length}개
                      </div>
                    )}
                    {selectedTemplate?.visual_data?.edges && (
                      <div>
                        연결 수: {selectedTemplate.visual_data.edges.length}개
                      </div>
                    )}
                    {selectedTemplate?.steps && (
                      <div>스텝 수: {selectedTemplate.steps.length}개</div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => selectedTemplate && handleUseTemplate(selectedTemplate)}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  이 템플릿으로 워크플로우 생성
                </Button>
                <Button
                  variant="outline"
                  onClick={() => selectedTemplate && handleExportTemplate(selectedTemplate)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  내보내기
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedTemplate) {
                      setRatingDialogOpen(true);
                    }
                  }}
                >
                  <Star className="h-4 w-4 mr-2" />
                  평점 주기
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customize Dialog */}
      <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>템플릿 커스터마이징</DialogTitle>
            <DialogDescription>
              워크플로우를 생성하기 전에 이름과 설정을 변경할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Template Preview */}
            {customizeTemplate && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={categoryColors[customizeTemplate.category]}>
                    {customizeTemplate.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    원본: {customizeTemplate.name}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {customizeTemplate.description}
                </p>
              </div>
            )}
            
            <div>
              <Label htmlFor="workflow-name">워크플로우 이름 *</Label>
              <Input
                id="workflow-name"
                value={customWorkflowName}
                onChange={(e) => setCustomWorkflowName(e.target.value)}
                placeholder="워크플로우 이름을 입력하세요"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                템플릿 이름을 기반으로 자동 생성되지만 변경할 수 있습니다.
              </p>
            </div>
            
            <div>
              <Label htmlFor="workflow-description">설명 (선택사항)</Label>
              <Textarea
                id="workflow-description"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="워크플로우 설명을 입력하세요"
                rows={3}
                className="mt-2"
              />
            </div>
            
            <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
              <input
                type="checkbox"
                id="activate-immediately"
                checked={activateImmediately}
                onChange={(e) => setActivateImmediately(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="activate-immediately" className="cursor-pointer flex-1">
                <div className="font-medium">즉시 활성화</div>
                <div className="text-sm text-muted-foreground">
                  활성화하면 워크플로우가 바로 실행됩니다. 비활성화 상태로 생성하여 나중에 확인 후 활성화할 수 있습니다.
                </div>
              </Label>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setCustomizeOpen(false)} className="flex-1">
                취소
              </Button>
              <Button 
                onClick={handleCustomizeAndUse} 
                className="flex-1"
                disabled={!customWorkflowName.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                워크플로우 생성
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>템플릿 평점</DialogTitle>
            <DialogDescription>
              이 템플릿에 대한 평점을 남겨주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>평점</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="comment">코멘트 (선택사항)</Label>
              <Textarea
                id="comment"
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="이 템플릿에 대한 의견을 남겨주세요..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRatingDialogOpen(false)}>
                취소
              </Button>
              <Button
                onClick={() => selectedTemplate && handleRateTemplate(selectedTemplate)}
              >
                등록
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

