"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Edit2, Trash2, Phone, Mail, Calendar, User, Upload, Play, CheckSquare, Square, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Patient } from "@/lib/database.types";
import { validateKoreanPhoneNumber } from "@/lib/phone-validation";
import { CsvImportDialog } from "@/components/csv-import-dialog";
import { WorkflowSelectionDialog } from "@/components/workflow-selection-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  usePatients,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
} from "@/lib/queries/patients";
import { CSVImportDialog } from "@/components/patients/csv-import-dialog";
import { CSVImportRow } from "@/lib/csv-import";

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isWorkflowDialogOpen, setIsWorkflowDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [selectedPatientIds, setSelectedPatientIds] = useState<Set<string>>(new Set());

  // 폼 상태
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    birth_date: "",
    gender: "" as "" | "male" | "female" | "other",
    last_visit_date: "",
    last_surgery_date: "",
    notes: "",
    marketing_consent: false,
    privacy_consent: false,
  });

  // 폼 검증 상태
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // React Query hooks
  const { data: patients = [], isLoading, error } = usePatients(searchQuery);
  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const deletePatientMutation = useDeletePatient();

  // 일괄 가져오기 처리
  const handleBatchImport = async (data: any[]) => {
    let successCount = 0;
    let failCount = 0;

    // Process in chunks to avoid overwhelming the server
    const chunkSize = 5;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (row) => {
          try {
            // Basic validation
            if (!row.name || !row.phone) throw new Error("Missing required fields");
            
            // Format phone number
            const phoneVal = validateKoreanPhoneNumber(row.phone);
            if (!phoneVal.isValid) throw new Error(phoneVal.error);

            // Create patient
            await createPatientMutation.mutateAsync({
              name: row.name,
              phone: phoneVal.formatted, // Use formatted phone
              email: row.email || null,
              birth_date: row.birth_date || null,
              gender: row.gender === '남성' || row.gender === '남' ? 'male' : 
                      row.gender === '여성' || row.gender === '여' ? 'female' : 'other',
              notes: row.notes || null
            });
            successCount++;
          } catch (e) {
            console.error(`Failed to import ${row.name}:`, e);
            failCount++;
          }
        })
      );
    }
    
    if (failCount > 0) {
      toast.warning(`${successCount}명 성공, ${failCount}명 실패 (중복 또는 형식 오류)`);
    } else {
      toast.success(`${successCount}명 가져오기 완료`);
    }
  };

  // 워크플로우 일괄 실행
  const handleBatchExecuteWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch('/api/workflows/batch-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId,
          patientIds: Array.from(selectedPatientIds)
        })
      });

      if (!response.ok) throw new Error('Failed to execute workflows');
      
      const result = await response.json();
      toast.success(result.message || "워크플로우가 실행되었습니다.");
      setSelectedPatientIds(new Set()); // Clear selection
    } catch (error: any) {
      toast.error(error.message || "실행 중 오류가 발생했습니다.");
    }
  };

  // 선택 토글
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedPatientIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedPatientIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedPatientIds.size === patients.length) {
      setSelectedPatientIds(new Set());
    } else {
      setSelectedPatientIds(new Set(patients.map(p => p.id)));
    }
  };

  // 폼 검증 함수
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "이름을 입력해주세요.";
    }

    if (!formData.phone.trim()) {
      errors.phone = "전화번호를 입력해주세요.";
    } else {
      const phoneValidation = validateKoreanPhoneNumber(formData.phone);
      if (!phoneValidation.isValid) {
        errors.phone = phoneValidation.error || "올바른 전화번호 형식이 아닙니다.";
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "올바른 이메일 형식이 아닙니다.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 환자 추가
  const handleAddPatient = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await createPatientMutation.mutateAsync(formData);
      toast.success("환자가 추가되었습니다.");
      setIsAddDialogOpen(false);
      resetForm();
      setFormErrors({});
    } catch (error: any) {
      toast.error(error.message || "환자 추가 중 오류가 발생했습니다.");
    }
  };

  // 환자 수정
  const handleUpdatePatient = async () => {
    if (!editingPatient) return;

    if (!validateForm()) {
      return;
    }

    try {
      await updatePatientMutation.mutateAsync({
        id: editingPatient.id,
        data: formData,
      });
      toast.success("환자 정보가 수정되었습니다.");
      setEditingPatient(null);
      resetForm();
      setFormErrors({});
    } catch (error: any) {
      toast.error(error.message || "환자 수정 중 오류가 발생했습니다.");
    }
  };

  // 환자 삭제
  const handleDeletePatient = async () => {
    if (!patientToDelete) return;

    try {
      await deletePatientMutation.mutateAsync(patientToDelete.id);
      toast.success("환자가 삭제되었습니다.");
      setIsDeleteDialogOpen(false);
      setPatientToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "환자 삭제 중 오류가 발생했습니다.");
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      birth_date: "",
      gender: "",
      last_visit_date: "",
      last_surgery_date: "",
      notes: "",
      marketing_consent: false,
      privacy_consent: false,
    });
    setFormErrors({});
  };

  // 수정 모드 시작
  const startEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      phone: patient.phone,
      email: patient.email || "",
      birth_date: patient.birth_date || "",
      gender: patient.gender || "",
      last_visit_date: patient.last_visit_date || "",
      last_surgery_date: patient.last_surgery_date || "",
      notes: patient.notes || "",
      marketing_consent: patient.marketing_consent || false,
      privacy_consent: patient.privacy_consent || false,
    });
  };

  // 삭제 확인
  const confirmDelete = (patient: Patient) => {
    setPatientToDelete(patient);
    setIsDeleteDialogOpen(true);
  };

  // 데이터 내보내기
  const handleExport = () => {
    // 직접 다운로드 링크로 이동 (API가 파일 다운로드를 처리함)
    window.location.href = '/api/patients/export?format=csv';
    toast.success("데이터 다운로드가 시작되었습니다.");
  };

  // 에러 처리
  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
              <p className="text-destructive font-medium" role="alert">
                환자 목록을 불러오는 중 오류가 발생했습니다.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                aria-label="페이지 새로고침"
              >
                새로고침
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  // Retry fetching patients
                  window.location.reload();
                }}
                aria-label="다시 시도"
              >
                다시 시도
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              문제가 계속되면 관리자에게 문의해주세요.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            환자
          </h1>
          <p className="text-muted-foreground text-lg">
            환자 정보를 관리하고 조회하세요
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              환자 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* ... content ... */}
            <DialogHeader>
              <DialogTitle>환자 추가</DialogTitle>
              <DialogDescription>
                새로운 환자 정보를 입력하세요
              </DialogDescription>
            </DialogHeader>
            <PatientForm formData={formData} setFormData={setFormData} errors={formErrors} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                취소
              </Button>
              <Button
                onClick={handleAddPatient}
                disabled={createPatientMutation.isPending}
              >
                {createPatientMutation.isPending ? "추가 중" : "추가"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <CsvImportDialog onImport={handleBatchImport} />
        
        <WorkflowSelectionDialog 
          open={isWorkflowDialogOpen} 
          onOpenChange={setIsWorkflowDialogOpen}
          selectedCount={selectedPatientIds.size}
          onConfirm={handleBatchExecuteWorkflow}
        />
      </div>

      {/* 검색 및 필터 */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름, 전화번호, 이메일로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 transition-all duration-200 focus:ring-2"
              />
            </div>
            <div className="flex items-center gap-2">
              {selectedPatientIds.size > 0 && (
                <Button 
                  variant="default" 
                  className="animate-in fade-in zoom-in duration-200"
                  onClick={() => setIsWorkflowDialogOpen(true)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {selectedPatientIds.size}명에게 워크플로우 실행
                </Button>
              )}
              <div className="text-sm font-medium text-muted-foreground bg-muted px-4 py-2 rounded-lg">
                총 {patients.length}명
              </div>
            </div>
          </div>
          
          {/* Bulk Action Bar (Select All) */}
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={patients.length > 0 && selectedPatientIds.size === patients.length}
                onCheckedChange={toggleSelectAll}
                id="select-all"
              />
              <Label htmlFor="select-all" className="cursor-pointer">전체 선택</Label>
            </div>
            {selectedPatientIds.size > 0 && (
              <span className="ml-2 text-primary font-medium">
                ({selectedPatientIds.size}명 선택됨)
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 환자 목록 */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-live="polite" aria-label="환자 목록 로딩 중">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : patients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {searchQuery ? "검색 결과가 없습니다." : "등록된 환자가 없습니다."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" role="list" aria-label={`환자 목록, 총 ${patients.length}명`}>
          {patients.map((patient) => (
            <Card 
              key={patient.id}
              role="listitem"
              tabIndex={0}
              aria-label={`${patient.name} 환자 카드${selectedPatientIds.has(patient.id) ? ', 선택됨' : ''}`}
              className={`transition-all duration-300 group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                selectedPatientIds.has(patient.id) 
                  ? "border-primary ring-1 ring-primary bg-primary/5" 
                  : "hover:border-primary/30 hover:shadow-lg"
              }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleSelection(patient.id);
                }
              }}
            >
              {/* Selection Checkbox Overlay */}
              <div className="absolute top-4 right-4 z-10">
                <Checkbox 
                  checked={selectedPatientIds.has(patient.id)}
                  onCheckedChange={() => toggleSelection(patient.id)}
                  className="h-5 w-5 bg-white/80 data-[state=checked]:bg-primary"
                  aria-label={`${patient.name} 선택${selectedPatientIds.has(patient.id) ? ' 해제' : ''}`}
                />
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between pr-8">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors" aria-hidden="true">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      {patient.name}
                    </CardTitle>
                    {patient.gender && (
                      <CardDescription className="mt-2 ml-11">
                        {patient.gender === "male" ? "남성" : patient.gender === "female" ? "여성" : "기타"}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(patient);
                      }}
                      className="hover:bg-primary/10 hover:text-primary transition-colors min-h-[44px] min-w-[44px]"
                      aria-label={`${patient.name} 환자 정보 수정`}
                    >
                      <Edit2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(patient);
                      }}
                      className="hover:bg-destructive/10 hover:text-destructive transition-colors min-h-[44px] min-w-[44px]"
                      aria-label={`${patient.name} 환자 삭제`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span>전화번호: {patient.phone}</span>
                </div>
                {patient.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span>이메일: {patient.email}</span>
                  </div>
                )}
                {patient.birth_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span>
                      생년월일: {new Date(patient.birth_date).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                )}
                {patient.last_visit_date && (
                  <div className="text-xs text-muted-foreground">
                    마지막 방문: {new Date(patient.last_visit_date).toLocaleDateString("ko-KR")}
                  </div>
                )}
                {patient.last_surgery_date && (
                  <div className="text-xs text-muted-foreground">
                    마지막 수술: {new Date(patient.last_surgery_date).toLocaleDateString("ko-KR")}
                  </div>
                )}
                {patient.notes && (
                  <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                    {patient.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 수정 다이얼로그 */}
      {editingPatient && (
        <Dialog open={!!editingPatient} onOpenChange={() => setEditingPatient(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>환자 정보 수정</DialogTitle>
              <DialogDescription>
                환자 정보를 수정하세요
              </DialogDescription>
            </DialogHeader>
            <PatientForm formData={formData} setFormData={setFormData} errors={formErrors} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPatient(null)}>
                취소
              </Button>
              <Button
                onClick={handleUpdatePatient}
                disabled={updatePatientMutation.isPending}
              >
                {updatePatientMutation.isPending ? "저장 중" : "저장"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>환자 삭제</DialogTitle>
            <DialogDescription>
              정말로 {patientToDelete?.name}님의 정보를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePatient}
              disabled={deletePatientMutation.isPending}
            >
              {deletePatientMutation.isPending ? "삭제 중" : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 환자 폼 컴포넌트
function PatientForm({
  formData,
  setFormData,
  errors = {},
}: {
  formData: any;
  setFormData: (data: any) => void;
  errors?: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">이름 *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) {
                // Clear error when user starts typing
                const newErrors = { ...errors };
                delete newErrors.name;
                // Note: This requires passing setFormErrors or handling it differently
                // For now, we'll rely on validation on submit
              }
            }}
            placeholder="홍길동"
            required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-destructive" role="alert">
              {errors.name}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">전화번호 *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="010-1234-5678"
            maxLength={13}
            required
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.phone && (
            <p id="phone-error" className="text-sm text-destructive" role="alert">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="example@email.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive" role="alert">
              {errors.email}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">성별</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData({ ...formData, gender: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">남성</SelectItem>
              <SelectItem value="female">여성</SelectItem>
              <SelectItem value="other">기타</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birth_date">생년월일</Label>
          <Input
            id="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_visit_date">마지막 방문일</Label>
          <Input
            id="last_visit_date"
            type="date"
            value={formData.last_visit_date}
            onChange={(e) => setFormData({ ...formData, last_visit_date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_surgery_date">마지막 수술일</Label>
          <Input
            id="last_surgery_date"
            type="date"
            value={formData.last_surgery_date}
            onChange={(e) => setFormData({ ...formData, last_surgery_date: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">메모</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="추가 정보를 입력하세요..."
          rows={3}
        />
      </div>

      <div className="space-y-4 pt-2 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="privacy_consent" 
            checked={formData.privacy_consent}
            onCheckedChange={(checked) => setFormData({ ...formData, privacy_consent: checked === true })}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="privacy_consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              개인정보 수집 및 이용 동의 (필수)
            </Label>
            <p className="text-xs text-muted-foreground">
              진료 및 예약 관리를 위한 개인정보 수집에 동의합니다.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="marketing_consent" 
            checked={formData.marketing_consent}
            onCheckedChange={(checked) => setFormData({ ...formData, marketing_consent: checked === true })}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="marketing_consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              마케팅 정보 수신 동의 (선택)
            </Label>
            <p className="text-xs text-muted-foreground">
              이벤트 및 혜택 알림 문자/카카오톡 수신에 동의합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
