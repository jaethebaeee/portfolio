'use client';

/**
 * CSV 환자 데이터 가져오기 대화상자
 * 
 * 기능:
 * - 드래그앤드롭 파일 업로드
 * - 실시간 데이터 검증 및 미리보기
 * - 컬럼 매핑 자동/수동 조정
 * - 중복 환자 처리 옵션 (건너뛰기/업데이트)
 * - PIPA 준수 알림
 */

import { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Download,
  Info,
  Loader2,
} from 'lucide-react';
import { parseCSV, downloadSampleCSV, CSVImportResult, CSVImportRow } from '@/lib/csv-import';
import { cn } from '@/lib/utils';

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: CSVImportRow[], updateDuplicates: boolean, onProgress?: (current: number, total: number) => void) => Promise<void>;
  existingPhones?: Set<string>;
  onCreateAutomationCampaigns?: (campaigns: AutomationTemplate[]) => void;
}

// Automation templates for post-import setup
const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: 'lasik_post_care',
    name: '라식 수술 후 30일 케어',
    description: '수술 당일부터 30일까지 매일 개인화된 케어 메시지 자동 발송',
    type: 'post_surgery_care',
    estimatedSavings: '40시간/월',
    recommendedFor: ['lasik', 'lasek']
  },
  {
    id: 'cataract_post_care',
    name: '백내장 수술 후 관리',
    description: '수술 후 1개월간 감염 예방과 정기 검진 안내',
    type: 'post_surgery_care',
    estimatedSavings: '25시간/월',
    recommendedFor: ['cataract']
  },
  {
    id: 'rhinoplasty_recovery',
    name: '코성형 회복 관리',
    description: '수술 후 60일간 붓기 관리 및 실밥 제거 일정 안내',
    type: 'post_surgery_care',
    estimatedSavings: '35시간/월',
    recommendedFor: ['rhinoplasty']
  },
  {
    id: 'elderly_reminders',
    name: '고령 환자 예약 리마인더',
    description: '예약 1주일 전부터 당일까지 단계별 방문 준비 안내',
    type: 'pre_visit_reminder',
    estimatedSavings: '20시간/월',
    recommendedFor: ['general']
  },
  {
    id: 'follow_up_care',
    name: '진료 경과 확인',
    description: '진료 후 3일, 1주일, 1개월에 자동 경과 확인 메시지',
    type: 'follow_up',
    estimatedSavings: '15시간/월',
    recommendedFor: ['general']
  }
];

type ImportStep = 'onboarding' | 'upload' | 'mapping' | 'preview' | 'automation' | 'importing' | 'complete';

type AutomationTemplate = {
  id: string;
  name: string;
  description: string;
  type: 'post_surgery_care' | 'pre_visit_reminder' | 'follow_up';
  estimatedSavings: string;
  recommendedFor: string[];
};

export function CSVImportDialog({
  open,
  onOpenChange,
  onImport,
  onCreateAutomationCampaigns,
  existingPhones = new Set(),
}: CSVImportDialogProps) {
  // Determine initial step based on user experience
  const getInitialStep = (): ImportStep => {
    // Check if user has imported before (could be from localStorage or API)
    const hasImportedBefore = localStorage.getItem('hasCompletedPatientImport') === 'true';
    return hasImportedBefore ? 'upload' : 'onboarding';
  };

  const [step, setStep] = useState<ImportStep>(getInitialStep());
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CSVImportResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [updateDuplicates, setUpdateDuplicates] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState({ success: 0, failed: 0 });
  const [error, setError] = useState<string | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);

  // Onboarding & Automation State
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [onboardingProgress, setOnboardingProgress] = useState(0);
  const [showAutomationSetup, setShowAutomationSetup] = useState(false);
  const [selectedAutomationTemplates, setSelectedAutomationTemplates] = useState<Set<string>>(new Set());
  const [automationSettings, setAutomationSettings] = useState({
    enablePostSurgeryCare: false,
    enablePreVisitReminders: false,
    enableFollowUps: false,
    autoScheduleCampaigns: false,
    sendWelcomeMessage: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 파일 선택/드롭 핸들러
  const handleFile = useCallback(async (selectedFile: File) => {
    // 파일 형식 검증
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast.error('CSV 파일만 업로드 가능합니다', {
        description: '선택한 파일의 확장자가 .csv가 아닙니다.',
      });
      return;
    }

    // 파일 크기 검증 (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.error('파일 크기 초과', {
        description: `파일 크기가 ${(selectedFile.size / 1024 / 1024).toFixed(1)}MB입니다. 최대 10MB까지 업로드 가능합니다.`,
      });
      return;
    }
    
    setFile(selectedFile);
    setStep('mapping');

    try {
      // CSV 헤더 검출을 위한 임시 파싱
      const tempResult = await parseCSV(selectedFile, existingPhones);
      const headers = tempResult.rows.length > 0 ? Object.keys(tempResult.rows[0].data) : [];
      setDetectedHeaders(headers);

      // 기본 매핑 생성
      const defaultMapping: Record<string, string> = {};
      const fieldMappings: Record<string, string> = {
        '이름': 'name',
        'name': 'name',
        '전화번호': 'phone',
        'phone': 'phone',
        '휴대폰': 'phone',
        'mobile': 'phone',
        '이메일': 'email',
        'email': 'email',
        '생년월일': 'birth_date',
        'birth_date': 'birth_date',
        'birthday': 'birth_date',
        '성별': 'gender',
        'gender': 'gender',
        'sex': 'gender',
        '최근방문일': 'last_visit_date',
        'last_visit_date': 'last_visit_date',
        '최근수술일': 'last_surgery_date',
        'last_surgery_date': 'last_surgery_date',
        '메모': 'notes',
        'memo': 'notes',
        'notes': 'notes',
      };

      headers.forEach(header => {
        const normalizedHeader = header.toLowerCase().replace(/\s+/g, '');
        const matchedField = fieldMappings[normalizedHeader] ||
                           fieldMappings[header] ||
                           fieldMappings[header.toLowerCase()];
        if (matchedField) {
          defaultMapping[matchedField] = header;
        }
      });

      setColumnMapping(defaultMapping);
      setError(null); // 성공 시 에러 초기화
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
      setError(errorMessage);
      toast.error('CSV 파일 파싱 실패', {
        description: errorMessage,
      });
      setStep('upload');
    }
  }, [existingPhones]);

  // 매핑 확인 및 미리보기 단계로 이동
  const handleMappingComplete = useCallback(async () => {
    if (!file) return;

    setStep('preview');

    try {
      const result = await parseCSV(file, existingPhones, columnMapping);
      setParseResult(result);

      // 기본적으로 모든 유효한 행 선택
      const validRows = new Set(
        result.rows
          .filter(row => row.errors.length === 0)
          .map(row => row.rowNumber)
      );
      setSelectedRows(validRows);
      setError(null); // 성공 시 에러 초기화
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '데이터 파싱 중 오류가 발생했습니다';
      setError(errorMessage);
      toast.error('데이터 파싱 실패', {
        description: errorMessage,
      });
      setStep('mapping');
    }
  }, [file, existingPhones, columnMapping]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [handleFile]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  }, [handleFile]);
  
  // 가져오기 실행
  const handleImport = async () => {
    if (!parseResult) return;

    setStep('importing');

    const rowsToImport = parseResult.rows.filter(row =>
      selectedRows.has(row.rowNumber) && row.errors.length === 0
    );

    setImportProgress({ current: 0, total: rowsToImport.length });
    setImportResult({ success: 0, failed: 0 });

    try {
      await onImport(rowsToImport, updateDuplicates, (current, total) => {
        setImportProgress({ current, total });
        setImportResult(prev => ({
          ...prev,
          success: current,
          failed: total - current
        }));
      });

      setImportResult({ success: rowsToImport.length, failed: 0 });
      
      // 자동화 설정이 활성화되어 있으면 automation 단계로 이동
      if (onCreateAutomationCampaigns && showAutomationSetup) {
        setStep('automation');
      } else {
        setStep('complete');
      }
      
      setError(null); // 성공 시 에러 초기화
      toast.success('환자 데이터 가져오기 완료', {
        description: `${rowsToImport.length}명의 환자 정보가 성공적으로 등록되었습니다.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '데이터 가져오기 중 오류가 발생했습니다';
      setError(errorMessage);
      toast.error('환자 데이터 가져오기 실패', {
        description: errorMessage,
      });
      setStep('preview');
    }
  };
  
  // 대화상자 닫기 및 초기화
  const handleClose = () => {
    setStep(getInitialStep());
    setFile(null);
    setParseResult(null);
    setSelectedRows(new Set());
    setUpdateDuplicates(false);
    setImportProgress({ current: 0, total: 0 });
    setImportResult({ success: 0, failed: 0 });
    setError(null);
    setColumnMapping({});
    setDetectedHeaders([]);
    setShowAutomationSetup(false);
    setSelectedAutomationTemplates(new Set());
    setAutomationSettings({
      enablePostSurgeryCare: false,
      enablePreVisitReminders: false,
      enableFollowUps: false,
      autoScheduleCampaigns: false,
      sendWelcomeMessage: false
    });
    onOpenChange(false);
  };
  
  // 행 선택/해제
  const toggleRow = (rowNumber: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowNumber)) {
      newSelected.delete(rowNumber);
    } else {
      newSelected.add(rowNumber);
    }
    setSelectedRows(newSelected);
  };
  
  const toggleAllValid = () => {
    if (!parseResult) return;
    
    const validRows = parseResult.rows.filter(row => row.errors.length === 0);
    
    if (selectedRows.size === validRows.length) {
      // 모두 선택되어 있으면 전체 해제
      setSelectedRows(new Set());
    } else {
      // 아니면 모두 선택
      setSelectedRows(new Set(validRows.map(row => row.rowNumber)));
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            CSV 환자 데이터 가져오기
          </DialogTitle>
          <DialogDescription>
            CSV 파일로 여러 환자 정보를 한 번에 등록할 수 있습니다
          </DialogDescription>
        </DialogHeader>
        
        {/* 온보딩 단계 */}
        {step === 'onboarding' && (
          <div className="flex-1 flex flex-col gap-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">환자 데이터 가져오기 시작하기</h3>
                <p className="text-muted-foreground">
                  CSV 파일로 환자 정보를 가져오고 자동화된 케어를 설정해보세요
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">진행률</span>
                <span className="text-sm text-muted-foreground">{onboardingProgress}%</span>
              </div>
              <Progress value={onboardingProgress} className="w-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={`cursor-pointer transition-all ${onboardingProgress >= 33 ? 'border-primary bg-primary/5' : ''}`}>
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <h4 className="font-medium mb-1">CSV 준비</h4>
                  <p className="text-xs text-muted-foreground">템플릿 다운로드 및 데이터 준비</p>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer transition-all ${onboardingProgress >= 66 ? 'border-primary bg-primary/5' : ''}`}>
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-green-600 font-semibold">2</span>
                  </div>
                  <h4 className="font-medium mb-1">데이터 검증</h4>
                  <p className="text-xs text-muted-foreground">컬럼 매핑 및 유효성 검사</p>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer transition-all ${onboardingProgress >= 100 ? 'border-primary bg-primary/5' : ''}`}>
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-600 font-semibold">3</span>
                  </div>
                  <h4 className="font-medium mb-1">자동화 설정</h4>
                  <p className="text-xs text-muted-foreground">케어 메시지 자동화 구성</p>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>팁:</strong> 처음 사용하시는 경우 샘플 템플릿을 다운로드해서 테스트해보세요.
                실제 환자 데이터는 개인정보 보호법(PIPA)을 준수하여 동의를 받아야 합니다.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep('upload')}
                className="flex-1 px-6 py-2.5 h-10 bg-primary hover:bg-primary/90 transition-all duration-200"
              >
                시작하기
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsFirstTime(false)}
                className="px-6 py-2.5 h-10 hover:bg-muted transition-all duration-200"
              >
                건너뛰기
              </Button>
            </div>
          </div>
        )}

        {/* 업로드 단계 */}
        {step === 'upload' && (
          <div className="flex-1 flex flex-col gap-4">
            {/* 오류 표시 */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>오류:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            {/* PIPA 준수 안내 */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>개인정보보호법(PIPA) 준수:</strong> 환자 데이터를 가져오기 전에
                환자로부터 개인정보 수집 및 이용에 대한 동의를 받았는지 확인하세요.
              </AlertDescription>
            </Alert>
            
            {/* 드래그앤드롭 영역 */}
            <div
              className={cn(
                "flex-1 border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center gap-4 transition-all duration-200 cursor-pointer hover:bg-primary/5",
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className={cn(
                "h-16 w-16 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="text-center">
                <p className="text-lg font-medium">
                  CSV 파일을 드래그하거나 클릭하여 선택
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  최대 파일 크기: 10MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
            
            {/* 샘플 다운로드 */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors duration-200">
              <div>
                <p className="font-medium">샘플 템플릿이 필요하신가요?</p>
                <p className="text-sm text-muted-foreground">
                  올바른 형식의 CSV 템플릿을 다운로드하세요
                </p>
              </div>
              <Button
                variant="outline"
                onClick={downloadSampleCSV}
                className="px-4 py-2 h-9 bg-background hover:bg-muted transition-all duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                템플릿 다운로드
              </Button>
            </div>
            
            {/* 지원되는 컬럼 안내 */}
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">지원되는 컬럼:</p>
              <div className="grid grid-cols-2 gap-2">
                <div>• 이름 (필수)</div>
                <div>• 전화번호 (필수)</div>
                <div>• 이메일</div>
                <div>• 생년월일</div>
                <div>• 성별</div>
                <div>• 최근 방문일</div>
                <div>• 최근 수술일</div>
                <div>• 메모</div>
              </div>
            </div>
          </div>
        )}

        {/* 컬럼 매핑 단계 */}
        {step === 'mapping' && (
          <div className="flex-1 flex flex-col gap-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                CSV 파일의 컬럼을 시스템 필드에 매핑하세요. 필수 필드인 이름과 전화번호는 반드시 매핑해야 합니다.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">컬럼 매핑</h3>
              <div className="grid gap-4">
                {[
                  { key: 'name', label: '이름', required: true },
                  { key: 'phone', label: '전화번호', required: true },
                  { key: 'email', label: '이메일', required: false },
                  { key: 'birth_date', label: '생년월일', required: false },
                  { key: 'gender', label: '성별', required: false },
                  { key: 'last_visit_date', label: '최근 방문일', required: false },
                  { key: 'last_surgery_date', label: '최근 수술일', required: false },
                  { key: 'notes', label: '메모', required: false },
                ].map(({ key, label, required }) => (
                  <div key={key} className="flex items-center gap-4">
                    <label className="w-32 text-sm font-medium">
                      {label}
                      {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <select
                      className="flex-1 px-3 py-2 border rounded-md text-sm bg-background hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                      value={columnMapping[key] || ''}
                      onChange={(e) => setColumnMapping(prev => ({
                        ...prev,
                        [key]: e.target.value
                      }))}
                    >
                      <option value="">선택하지 않음</option>
                      {detectedHeaders.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* 검출된 헤더 미리보기 */}
            {detectedHeaders.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">CSV 파일에서 검출된 컬럼:</h4>
                <div className="flex flex-wrap gap-2">
                  {detectedHeaders.map(header => (
                    <Badge key={header} variant="outline">{header}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 미리보기 단계 */}
        {step === 'preview' && parseResult && (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* 요약 정보 */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">전체</p>
                <p className="text-2xl font-bold">{parseResult.total}</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">유효</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {parseResult.valid}
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">오류</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {parseResult.invalid}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">중복</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {parseResult.duplicates}
                </p>
              </div>
            </div>
            
            {/* 중복 처리 옵션 */}
            {parseResult.duplicates > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>
                      {parseResult.duplicates}개의 중복된 전화번호가 발견되었습니다
                    </span>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="update-duplicates"
                        checked={updateDuplicates}
                        onCheckedChange={(checked) => setUpdateDuplicates(checked as boolean)}
                      />
                      <label htmlFor="update-duplicates" className="text-sm font-medium cursor-pointer">
                        기존 데이터 업데이트
                      </label>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {/* 데이터 미리보기 */}
            <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden">
              <TabsList>
                <TabsTrigger value="all">
                  전체 ({parseResult.total})
                </TabsTrigger>
                <TabsTrigger value="valid">
                  유효 ({parseResult.valid})
                </TabsTrigger>
                <TabsTrigger value="errors">
                  오류 ({parseResult.invalid})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="flex-1 overflow-hidden mt-2">
                <PreviewTable 
                  rows={parseResult.rows} 
                  selectedRows={selectedRows}
                  onToggleRow={toggleRow}
                  onToggleAll={toggleAllValid}
                />
              </TabsContent>
              
              <TabsContent value="valid" className="flex-1 overflow-hidden mt-2">
                <PreviewTable 
                  rows={parseResult.rows.filter(r => r.errors.length === 0)} 
                  selectedRows={selectedRows}
                  onToggleRow={toggleRow}
                  onToggleAll={toggleAllValid}
                />
              </TabsContent>
              
              <TabsContent value="errors" className="flex-1 overflow-hidden mt-2">
                <PreviewTable 
                  rows={parseResult.rows.filter(r => r.errors.length > 0)} 
                  selectedRows={selectedRows}
                  onToggleRow={toggleRow}
                  onToggleAll={toggleAllValid}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {/* 가져오는 중 */}
        {step === 'importing' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="text-center w-full max-w-md">
              <p className="text-lg font-medium">환자 데이터를 가져오는 중...</p>
              <p className="text-sm text-muted-foreground mt-1">
                {importProgress.current} / {importProgress.total} 완료
              </p>
              <div className="mt-4 w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: importProgress.total > 0 ? `${(importProgress.current / importProgress.total) * 100}%` : '0%'
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>성공: {importResult.success}</span>
                <span>실패: {importResult.failed}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* 자동화 설정 단계 */}
        {step === 'automation' && onCreateAutomationCampaigns && (
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">자동화 케어 설정</h3>
              <p className="text-sm text-muted-foreground">
                가져온 환자들에게 자동으로 케어 메시지를 발송할 수 있습니다. 원하는 템플릿을 선택하세요.
              </p>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                선택한 템플릿은 가져온 환자들에게 자동으로 적용됩니다. 나중에 워크플로우 설정에서 수정할 수 있습니다.
              </AlertDescription>
            </Alert>

            <ScrollArea className="flex-1 border rounded-lg p-4">
              <div className="space-y-4">
                {AUTOMATION_TEMPLATES.map((template) => {
                  const isSelected = selectedAutomationTemplates.has(template.id);
                  return (
                    <Card
                      key={template.id}
                      className={cn(
                        "cursor-pointer transition-all hover:border-primary/50",
                        isSelected && "border-primary bg-primary/5"
                      )}
                      onClick={() => {
                        const newSelected = new Set(selectedAutomationTemplates);
                        if (isSelected) {
                          newSelected.delete(template.id);
                        } else {
                          newSelected.add(template.id);
                        }
                        setSelectedAutomationTemplates(newSelected);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const newSelected = new Set(selectedAutomationTemplates);
                              if (checked) {
                                newSelected.add(template.id);
                              } else {
                                newSelected.delete(template.id);
                              }
                              setSelectedAutomationTemplates(newSelected);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{template.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {template.estimatedSavings}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {template.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {template.recommendedFor.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag === 'lasik' && '라식'}
                                  {tag === 'lasek' && '라섹'}
                                  {tag === 'cataract' && '백내장'}
                                  {tag === 'rhinoplasty' && '코성형'}
                                  {tag === 'general' && '일반'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>

            {selectedAutomationTemplates.size === 0 && (
              <Alert>
                <AlertDescription className="text-sm text-muted-foreground">
                  템플릿을 선택하지 않으면 자동화 설정 없이 완료됩니다. 나중에 워크플로우에서 설정할 수 있습니다.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* 완료 */}
        {step === 'complete' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <div className="text-center">
              <p className="text-lg font-medium">가져오기 완료!</p>
              <p className="text-sm text-muted-foreground mt-1">
                {importResult.success}명의 환자 정보가 성공적으로 등록되었습니다
              </p>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex gap-3 pt-6 border-t bg-muted/20">
          {step === 'upload' && (
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-6 py-2.5 h-9 transition-all duration-200 hover:bg-muted"
            >
              취소
            </Button>
          )}

          {step === 'mapping' && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep('upload')}
                className="px-6 py-2.5 h-9 transition-all duration-200 hover:bg-muted"
              >
                뒤로
              </Button>
              <Button
                onClick={handleMappingComplete}
                disabled={!columnMapping.name || !columnMapping.phone}
                className="px-6 py-2.5 h-9 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                다음
              </Button>
            </>
          )}

          {step === 'preview' && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep('upload')}
                className="px-6 py-2.5 h-9 transition-all duration-200 hover:bg-muted"
              >
                뒤로
              </Button>
              <div className="flex gap-2">
                {onCreateAutomationCampaigns && (
                  <Button
                    variant="outline"
                    onClick={() => setShowAutomationSetup(!showAutomationSetup)}
                    className="px-4 py-2.5 h-9 transition-all duration-200"
                  >
                    {showAutomationSetup ? '자동화 건너뛰기' : '자동화 설정'}
                  </Button>
                )}
                <Button
                  onClick={handleImport}
                  disabled={selectedRows.size === 0}
                  className="px-6 py-2.5 h-9 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {selectedRows.size}개 항목 가져오기
                </Button>
              </div>
            </>
          )}

          {step === 'automation' && onCreateAutomationCampaigns && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setStep('complete');
                  setSelectedAutomationTemplates(new Set());
                }}
                className="px-6 py-2.5 h-9 transition-all duration-200 hover:bg-muted"
              >
                건너뛰기
              </Button>
              <Button
                onClick={() => {
                  const selectedTemplates = AUTOMATION_TEMPLATES.filter(t => 
                    selectedAutomationTemplates.has(t.id)
                  );
                  if (selectedTemplates.length > 0 && onCreateAutomationCampaigns) {
                    onCreateAutomationCampaigns(selectedTemplates);
                    toast.success('자동화 캠페인 생성 완료', {
                      description: `${selectedTemplates.length}개의 자동화 템플릿이 설정되었습니다.`,
                    });
                  }
                  setStep('complete');
                }}
                className="px-6 py-2.5 h-9 bg-primary hover:bg-primary/90 transition-all duration-200"
              >
                {selectedAutomationTemplates.size > 0 
                  ? `${selectedAutomationTemplates.size}개 템플릿 적용하기`
                  : '완료'
                }
              </Button>
            </>
          )}

          {step === 'complete' && (
            <Button
              onClick={handleClose}
              className="px-8 py-2.5 h-9 bg-primary hover:bg-primary/90 transition-all duration-200"
            >
              확인
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 미리보기 테이블 컴포넌트
interface PreviewTableProps {
  rows: CSVImportRow[];
  selectedRows: Set<number>;
  onToggleRow: (rowNumber: number) => void;
  onToggleAll: () => void;
}

function PreviewTable({ rows, selectedRows, onToggleRow, onToggleAll }: PreviewTableProps) {
  const allSelected = rows.length > 0 && rows.every(row => 
    row.errors.length > 0 || selectedRows.has(row.rowNumber)
  );
  
  return (
    <ScrollArea className="h-full border rounded-lg bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/30 sticky top-0 border-b">
          <tr>
            <th className="p-3 text-left w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onToggleAll}
                className="transition-all duration-200 hover:scale-110"
              />
            </th>
            <th className="p-3 text-left font-medium text-muted-foreground">행</th>
            <th className="p-3 text-left font-medium text-muted-foreground">상태</th>
            <th className="p-3 text-left font-medium text-muted-foreground">이름</th>
            <th className="p-3 text-left font-medium text-muted-foreground">전화번호</th>
            <th className="p-3 text-left font-medium text-muted-foreground">이메일</th>
            <th className="p-3 text-left font-medium text-muted-foreground">생년월일</th>
            <th className="p-3 text-left font-medium text-muted-foreground">메시지</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.rowNumber} className="border-t hover:bg-muted/20 transition-colors duration-150">
              <td className="p-3">
                <Checkbox
                  checked={selectedRows.has(row.rowNumber)}
                  onCheckedChange={() => onToggleRow(row.rowNumber)}
                  disabled={row.errors.length > 0}
                  className="transition-all duration-200 hover:scale-110"
                />
              </td>
              <td className="p-3 text-muted-foreground font-medium">{row.rowNumber}</td>
              <td className="p-3">
                {row.errors.length > 0 ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : row.warnings.length > 0 ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </td>
              <td className="p-3 font-medium">{row.data.name}</td>
              <td className="p-3 font-mono text-xs text-muted-foreground">{row.data.phone}</td>
              <td className="p-3 text-xs text-muted-foreground">{row.data.email}</td>
              <td className="p-3 text-xs text-muted-foreground">{row.data.birth_date}</td>
              <td className="p-2 text-xs">
                {row.errors.length > 0 && (
                  <div className="text-red-600 dark:text-red-400">
                    {row.errors.join(', ')}
                  </div>
                )}
                {row.warnings.length > 0 && (
                  <div className="text-yellow-600 dark:text-yellow-400">
                    {row.warnings.join(', ')}
                  </div>
                )}
                {row.isDuplicate && (
                  <Badge variant="outline" className="text-yellow-600">
                    중복
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
}

