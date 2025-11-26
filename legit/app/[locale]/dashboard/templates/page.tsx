"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, MessageSquare, Phone, Calendar, Gift, Users, Star, Eye, Stethoscope, Sparkles, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { TemplateBuilder } from "@/components/template-builder";
import { TemplateEditDialog } from "@/components/template-edit-dialog";
import { TemplatePreviewDialog } from "@/components/template-preview-dialog";
import { MarketingTemplate, defaultTemplates, eyeClinicTemplates, specialtyConfigs } from "@/lib/template-types";
import { validateTemplateForSave } from "@/lib/template-validation";
import { toast } from "sonner";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<MarketingTemplate[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('안과');
  const [editingTemplate, setEditingTemplate] = useState<MarketingTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<MarketingTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

  const saveTemplates = useCallback((newTemplates: MarketingTemplate[]) => {
    localStorage.setItem("marketing_templates", JSON.stringify(newTemplates));
  }, []);

  const initializeSpecialtyTemplates = useCallback((specialty: string) => {
    let specialtyTemplates: Omit<MarketingTemplate, 'id' | 'createdAt' | 'updatedAt'>[];

    switch (specialty) {
      case '안과':
        specialtyTemplates = eyeClinicTemplates;
        break;
      default:
        specialtyTemplates = defaultTemplates;
    }

    const initialized: MarketingTemplate[] = specialtyTemplates.map((t, idx) => ({
      ...t,
      id: `template-${specialty}-${idx + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    setTemplates(initialized);
    saveTemplates(initialized);
  }, [saveTemplates]);

  useEffect(() => {
    // 로컬 스토리지에서 템플릿 로드 또는 기본 템플릿 사용
    const savedTemplates = localStorage.getItem("marketing_templates");
    const savedSpecialty = localStorage.getItem("selected_specialty") || '안과';

    setSelectedSpecialty(savedSpecialty);

    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates);
        setTemplates(parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        })));
      } catch {
        // 파싱 실패 시 선택된 진료과목의 템플릿 사용
        initializeSpecialtyTemplates(savedSpecialty);
      }
    } else {
      initializeSpecialtyTemplates(savedSpecialty);
    }
  }, [initializeSpecialtyTemplates]);

  const handleSpecialtyChange = useCallback((specialty: string) => {
    setSelectedSpecialty(specialty);
    localStorage.setItem("selected_specialty", specialty);
    initializeSpecialtyTemplates(specialty);
    setCurrentPage(0); // 진료과목 변경 시 페이지 리셋
    toast.success(`${specialtyConfigs[specialty]?.name || specialty} 템플릿으로 전환되었습니다.`);
  }, [initializeSpecialtyTemplates]);

  const handleUpdate = (newTemplates: MarketingTemplate[]) => {
    const updated = newTemplates.map((t) => ({
      ...t,
      updatedAt: new Date(),
    }));
    setTemplates(updated);
    saveTemplates(updated);
  };

  const handleEdit = (template: MarketingTemplate) => {
    setEditingTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleSaveTemplate = (updatedTemplate: MarketingTemplate) => {
    // 템플릿 검증
    const validation = validateTemplateForSave(updatedTemplate);
    
    if (!validation.isValid) {
      toast.error("템플릿 저장 실패", {
        description: validation.errors.join(", "),
      });
      return;
    }

    // 경고가 있으면 표시
    if (validation.warnings.length > 0) {
      toast.warning("경고", {
        description: validation.warnings.join(", "),
      });
    }

    const newTemplates = templates.map((t) =>
      t.id === updatedTemplate.id ? updatedTemplate : t
    );
    setTemplates(newTemplates);
    saveTemplates(newTemplates);
    toast.success("템플릿이 저장되었습니다.");
  };

  const handlePreview = (template: MarketingTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const handleDuplicate = (template: MarketingTemplate) => {
    const duplicated: MarketingTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (복사본)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const newTemplates = [...templates, duplicated];
    setTemplates(newTemplates);
    saveTemplates(newTemplates);
    toast.success("템플릿이 복사되었습니다.");
  };

  const getTemplateIcon = (triggerType: string) => {
    switch (triggerType) {
      case "appointment_completed":
        return <Calendar className="h-5 w-5" />;
      case "days_after_surgery":
        return <MessageSquare className="h-5 w-5" />;
      case "days_before_birthday":
        return <Gift className="h-5 w-5" />;
      case "months_since_last_visit":
        return <Users className="h-5 w-5" />;
      case "review_request":
      case "review_reminder":
        return <Star className="h-5 w-5" />;
      case "consultation_completed":
        return <Calendar className="h-5 w-5" />;
      case "surgery_booked":
      case "surgery_date":
      case "surgery_completed":
        return <Stethoscope className="h-5 w-5" />;
      case "followup_due":
        return <Calendar className="h-5 w-5" />;
      case "second_eye_eligible":
      case "family_referral":
        return <Users className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTriggerTypeLabel = (triggerType: string): string => {
    switch (triggerType) {
      case 'appointment_completed':
        return '예약 완료';
      case 'review_request':
        return '후기 요청';
      case 'surgery_completed':
        return '수술 완료';
      case 'consultation_completed':
        return '상담 완료';
      case 'surgery_booked':
        return '수술 예약';
      case 'surgery_date':
        return '수술 날짜';
      case 'days_after_surgery':
        return '수술 후';
      case 'days_before_birthday':
        return '생일 전';
      case 'months_since_last_visit':
        return '미방문';
      case 'followup_due':
        return '검진 예정';
      case 'second_eye_eligible':
        return '두 번째 눈';
      case 'family_referral':
        return '가족 추천';
      case 'review_reminder':
        return '후기 리마인더';
      default:
        return triggerType;
    }
  };

  // 추천 템플릿 필터링 함수 (높은 가치, 낮은 난이도) - useMemo로 최적화
  const recommendedTemplates = useMemo(() => {
    // 높은 가치: 자주 사용되고 효과적인 트리거
    const highValueTriggers: string[] = [
      'appointment_completed',
      'review_request',
      'surgery_completed',
      'consultation_completed',
      'surgery_booked',
    ];

    // 낮은 난이도: 간단한 트리거 (값이 없거나 단순한 구조)
    const lowDifficultyTriggers: string[] = [
      'appointment_completed',
      'review_request',
      'consultation_completed',
      'surgery_booked',
      'surgery_completed',
    ];

    return templates.filter((template) => {
      const isHighValue = highValueTriggers.includes(template.trigger.type);
      const isLowDifficulty = lowDifficultyTriggers.includes(template.trigger.type) && 
                               (!template.trigger.value || template.trigger.value <= 7);
      
      return isHighValue && isLowDifficulty;
    }).slice(0, 6); // 최대 6개만 표시
  }, [templates]);

  const enabledCount = useMemo(() => templates.filter((t) => t.enabled).length, [templates]);
  const [currentPage, setCurrentPage] = useState(0);
  const templatesPerPage = 3;

  const totalPages = useMemo(() => Math.ceil(recommendedTemplates.length / templatesPerPage), [recommendedTemplates.length, templatesPerPage]);
  
  const paginatedTemplates = useMemo(() => {
    return recommendedTemplates.slice(
      currentPage * templatesPerPage,
      (currentPage + 1) * templatesPerPage
    );
  }, [recommendedTemplates, currentPage, templatesPerPage]);

  // 이미 추가된 템플릿 ID Set을 미리 계산하여 성능 최적화
  const addedTemplateIds = useMemo(() => {
    return new Set(templates.map((t) => t.id));
  }, [templates]);

  // 템플릿이 변경되면 페이지를 리셋하고 범위를 확인
  useEffect(() => {
    const newTotalPages = Math.ceil(recommendedTemplates.length / templatesPerPage);
    setCurrentPage((prev) => {
      if (newTotalPages > 0 && prev >= newTotalPages) {
        return 0;
      }
      return prev;
    });
  }, [recommendedTemplates.length, templatesPerPage]);

  const handleAddRecommendedTemplate = useCallback((template: MarketingTemplate) => {
    // 이미 존재하는 템플릿인지 확인 (ID와 이름 모두 확인)
    const existsById = addedTemplateIds.has(template.id);
    const existsByName = templates.some((t) => t.name === template.name && t.trigger.type === template.trigger.type);
    
    if (existsById || existsByName) {
      toast.info("이미 추가된 템플릿입니다.");
      return;
    }

    // 템플릿 추가
    const newTemplate: MarketingTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newTemplates = [...templates, newTemplate];
    setTemplates(newTemplates);
    saveTemplates(newTemplates);
    toast.success("템플릿이 추가되었습니다.");
  }, [templates, addedTemplateIds]);

  const handleQuickPreview = useCallback((template: MarketingTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewDialogOpen(true);
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            템플릿
          </h1>
          <p className="text-muted-foreground text-lg">
            마케팅 메시지 템플릿을 생성하고 관리하세요
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          새 템플릿 추가
        </Button>
      </div>

      {/* 진료과목 선택 */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            진료과목 선택
          </CardTitle>
          <CardDescription>
            귀하의 진료과목에 맞는 전문 템플릿을 자동으로 로드합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(specialtyConfigs).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleSpecialtyChange(key)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  selectedSpecialty === key
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  selectedSpecialty === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Eye className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">{config.name}</div>
                  <div className="text-sm text-muted-foreground">{config.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {config.commonProcedures.slice(0, 2).join(', ')} 등
                  </div>
                </div>
                {selectedSpecialty === key && (
                  <Badge variant="secondary" className="ml-auto">
                    선택됨
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {selectedSpecialty && specialtyConfigs[selectedSpecialty] && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold mb-2">{specialtyConfigs[selectedSpecialty].name} 자동 캠페인</h4>
              <div className="flex flex-wrap gap-2">
                {specialtyConfigs[selectedSpecialty].autoCampaigns.map((campaign, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {campaign}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 통계 카드 */}
      <div className="grid gap-5 md:grid-cols-5">
        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">전체 템플릿</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-slate-500/10 flex items-center justify-center group-hover:bg-slate-500/20 transition-colors">
              <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground mt-2">활성: {enabledCount}개</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">카카오톡 템플릿</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
              <MessageSquare className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {templates.filter((t) =>
                t.messages.some((m) => m.channel === "kakao" || m.channel === "both")
              ).length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">카톡 발송 가능</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">SMS 템플릿</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {templates.filter((t) =>
                t.messages.some((m) => m.channel === "sms" || m.channel === "both")
              ).length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">SMS 발송 가능</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">이번 달 발송</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-2">통계 준비 중</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">전문 템플릿</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {specialtyConfigs[selectedSpecialty]?.name || selectedSpecialty} 전문
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 추천 템플릿 섹션 */}
      {recommendedTemplates.length > 0 && (
        <Card className="relative overflow-hidden shadow-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50 animate-pulse"></div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          {/* Top accent line with animation */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          
          {/* Decorative corner elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
          
          <CardHeader className="relative z-10 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 group/header">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl animate-pulse"></div>
                  <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 shadow-lg group-hover/header:scale-110 group-hover/header:rotate-3 transition-all duration-300">
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    추천 템플릿
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 shadow-sm hover:bg-emerald-500/30 transition-all duration-200 group/badge">
                        <TrendingUp className="h-3 w-3 mr-1 group-hover/badge:animate-bounce" />
                        높은 가치
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30 shadow-sm hover:bg-blue-500/30 transition-all duration-200">
                        낮은 난이도
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-base">
                    빠르게 시작할 수 있는 효과적인 템플릿을 추천합니다
                  </CardDescription>
                </div>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    aria-label="이전 페이지"
                    className="h-9 w-9 p-0 rounded-lg border-primary/20 hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95 group"
                  >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    <span className="sr-only">이전 페이지</span>
                  </Button>
                  <div className="flex items-center gap-1 px-3">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ease-out ${
                          currentPage === idx
                            ? 'w-8 bg-primary shadow-md shadow-primary/50'
                            : 'w-2 bg-primary/30 hover:bg-primary/50 hover:w-3'
                        }`}
                        aria-label={`페이지 ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    aria-label="다음 페이지"
                    className="h-9 w-9 p-0 rounded-lg border-primary/20 hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95 group"
                  >
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    <span className="sr-only">다음 페이지</span>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            {paginatedTemplates.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground animate-in fade-in duration-500">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
                  <FileText className="h-16 w-16 mx-auto relative opacity-50 animate-pulse" />
                </div>
                <p className="text-xl font-semibold mb-2">추천 템플릿이 없습니다</p>
                <p className="text-sm">템플릿을 추가하면 추천 목록에 표시됩니다</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedTemplates.map((template, index) => {
                  const isAlreadyAdded = addedTemplateIds.has(template.id);
                  return (
                  <Card
                    key={template.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${template.name} 템플릿 미리보기`}
                    className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleQuickPreview(template)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleQuickPreview(template);
                      }
                    }}
                  >
                    {/* Hover glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    
                    {/* Top accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
                    
                    {/* Corner decoration */}
                    <div className="absolute top-2 right-2 w-16 h-16 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="relative mt-1">
                              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md group-hover:blur-lg transition-all duration-500"></div>
                              <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 flex items-center justify-center border-2 border-primary/20 group-hover:scale-110 group-hover:bg-primary/30 group-hover:border-primary/40 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-xl group-hover:shadow-primary/20">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative z-10">
                                  {getTemplateIcon(template.trigger.type)}
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight">
                                {template.name}
                              </CardTitle>
                              <CardDescription className="text-sm mt-2 line-clamp-2 text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 leading-relaxed">
                                {template.description}
                              </CardDescription>
                            </div>
                          </div>
                          {isAlreadyAdded && (
                            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 shadow-sm shrink-0 animate-in zoom-in duration-300">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></div>
                              추가됨
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 space-y-4">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs font-medium bg-muted/50 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-200 group/badge">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 group-hover/badge:scale-125 transition-transform"></div>
                            {getTriggerTypeLabel(template.trigger.type)}
                          </Badge>
                          {template.messages.some((m) => m.channel === 'kakao' || m.channel === 'both') && (
                            <Badge variant="outline" className="text-xs font-medium bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20 hover:border-yellow-500/40 transition-all duration-200 group/badge">
                              <MessageSquare className="h-3 w-3 mr-1 group-hover/badge:scale-110 transition-transform" />
                              카카오톡
                            </Badge>
                          )}
                          {template.messages.some((m) => m.channel === 'sms' || m.channel === 'both') && (
                            <Badge variant="outline" className="text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all duration-200 group/badge">
                              <Phone className="h-3 w-3 mr-1 group-hover/badge:scale-110 transition-transform" />
                              SMS
                            </Badge>
                          )}
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/50">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground group/effect">
                            <div className="relative">
                              <TrendingUp className="h-3.5 w-3.5 text-emerald-500 group-hover/effect:scale-110 group-hover/effect:text-emerald-400 transition-all duration-200" />
                              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md opacity-0 group-hover/effect:opacity-100 transition-opacity duration-200"></div>
                            </div>
                            <span className="font-medium group-hover/effect:text-emerald-600 dark:group-hover/effect:text-emerald-400 transition-colors">높은 효과 예상</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickPreview(template);
                              }}
                              aria-label={`${template.name} 미리보기`}
                              className="h-8 px-3 text-xs hover:bg-primary/10 hover:text-primary transition-all hover:scale-105 active:scale-95 group/btn"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5 group-hover/btn:scale-110 transition-transform" />
                              미리보기
                            </Button>
                            {!isAlreadyAdded && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddRecommendedTemplate(template);
                                }}
                                aria-label={`${template.name} 템플릿 추가`}
                                className="h-8 px-4 text-xs bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:scale-105 active:scale-95 group/btn"
                              >
                                <Plus className="h-3.5 w-3.5 mr-1.5 group-hover/btn:rotate-90 transition-transform duration-300" />
                                추가
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                  );
                })}
              </div>
            )}
            
            {/* Page indicator */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center justify-center gap-3 pt-6 border-t border-border/50">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/50">
                    <span className="font-semibold text-foreground">
                      {currentPage + 1}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">
                      {totalPages}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-border"></div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>
                      총 <span className="font-semibold text-foreground">{recommendedTemplates.length}</span>개 템플릿
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 템플릿 목록 */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            템플릿 목록
          </CardTitle>
          <CardDescription>
            드래그하여 순서를 변경하고, 각 템플릿을 편집하거나 삭제할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              템플릿이 없습니다. 새 템플릿을 추가해보세요.
            </div>
          ) : (
            <TemplateBuilder
              templates={templates}
              onUpdate={handleUpdate}
              onEdit={handleEdit}
              onPreview={handlePreview}
              onDuplicate={handleDuplicate}
            />
          )}
        </CardContent>
      </Card>

      {/* 템플릿 설명 */}
      <Card className="shadow-md border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            {specialtyConfigs[selectedSpecialty]?.name || selectedSpecialty} 템플릿 가이드
          </CardTitle>
          <CardDescription>
            {specialtyConfigs[selectedSpecialty]?.description || '진료과목에 특화된 자동화 캠페인 가이드'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedSpecialty === '안과' ? (
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  백내장 수술 환자 관리
                </h3>
                <p className="text-sm text-muted-foreground ml-10">
                  수술 예약부터 퇴원 후 관리까지 완전 자동화된 환자 케어 시스템입니다.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  수술 후 후기 자동 수집
                </h3>
                <p className="text-sm text-muted-foreground ml-10">
                  수술 1주일 후 자동으로 후기를 요청하고 혜택을 제공합니다.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <Gift className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                  </div>
                  두 번째 눈 수술 제안
                </h3>
                <p className="text-sm text-muted-foreground ml-10">
                  첫 번째 눈 수술 후 2개월 뒤 자동으로 두 번째 눈 치료를 제안합니다.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  가족 검진 추천
                </h3>
                <p className="text-sm text-muted-foreground ml-10">
                  수술 환자의 가족들에게도 백내장 검진을 추천하여 추가 환자를 확보합니다.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  정기 검진 리마인드
                </h3>
                <p className="text-sm text-muted-foreground ml-10">
                  수술 6개월 후 정기 검진을 상기시키고 추가 서비스를 제안합니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  예약 완료 리마인더
                </h3>
                <p className="text-sm text-muted-foreground ml-10">
                  예약이 완료되면 자동으로 카카오톡과 SMS로 리마인더를 발송합니다.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  치료 후 후기 요청
                </h3>
                <p className="text-sm text-muted-foreground ml-10">
                  치료 완료 후 자동으로 후기 요청 문자를 발송합니다.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  재방문 유도
                </h3>
                <p className="text-sm text-muted-foreground ml-10">
                  장기 미방문 환자에게 재방문 유도 문자를 발송합니다.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 템플릿 편집 다이얼로그 */}
      <TemplateEditDialog
        template={editingTemplate}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveTemplate}
      />

      {/* 템플릿 미리보기 다이얼로그 */}
      <TemplatePreviewDialog
        template={previewTemplate}
        open={isPreviewDialogOpen}
        onOpenChange={setIsPreviewDialogOpen}
      />
    </div>
  );
}
