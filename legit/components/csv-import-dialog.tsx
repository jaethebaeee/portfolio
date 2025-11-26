"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileUp, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CsvImportDialogProps {
  onImport: (data: any[]) => Promise<void>;
  trigger?: React.ReactNode;
}

export function CsvImportDialog({ onImport, trigger }: CsvImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"upload" | "map" | "importing">("upload");
  const [importStats, setImportStats] = useState<{ total: number; success: number; failed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requiredFields = [
    { key: "name", label: "이름", required: true },
    { key: "phone", label: "전화번호", required: true },
    { key: "email", label: "이메일", required: false },
    { key: "birth_date", label: "생년월일 (YYYY-MM-DD)", required: false },
    { key: "gender", label: "성별 (남/여)", required: false },
    { key: "notes", label: "메모", required: false },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      preview: 5, // Preview first 5 rows
      complete: (results) => {
        setHeaders(results.meta.fields || []);
        setPreviewData(results.data);
        // Auto-map logic
        const newMapping: Record<string, string> = {};
        (results.meta.fields || []).forEach((header) => {
          if (header.includes("이름") || header.includes("성명") || header.toLowerCase().includes("name")) newMapping["name"] = header;
          if (header.includes("전화") || header.includes("휴대폰") || header.toLowerCase().includes("phone")) newMapping["phone"] = header;
          if (header.includes("이메일") || header.toLowerCase().includes("email")) newMapping["email"] = header;
          if (header.includes("생년") || header.toLowerCase().includes("birth")) newMapping["birth_date"] = header;
          if (header.includes("성별") || header.toLowerCase().includes("gender")) newMapping["gender"] = header;
          if (header.includes("메모") || header.includes("비고") || header.toLowerCase().includes("note")) newMapping["notes"] = header;
        });
        setMapping(newMapping);
        setStep("map");
      },
      error: (error) => {
        toast.error("CSV 파일 파싱 중 오류가 발생했습니다: " + error.message);
      },
    });
  };

  const handleImport = async () => {
    if (!file) return;

    // Check required mappings
    if (!mapping["name"] || !mapping["phone"]) {
      toast.error("이름과 전화번호 컬럼은 반드시 매핑해야 합니다.");
      return;
    }

    setStep("importing");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const total = results.data.length;
        const mappedData = results.data.map((row: any) => {
          const newRow: any = {};
          Object.entries(mapping).forEach(([fieldKey, header]) => {
            if (header) newRow[fieldKey] = row[header];
          });
          return newRow;
        });

        try {
          await onImport(mappedData);
          setImportStats({ total, success: total, failed: 0 }); // Simplification, ideally onImport returns stats
          toast.success(`${total}명의 환자 데이터를 가져왔습니다.`);
          setIsOpen(false);
          resetState();
        } catch (error: any) {
          console.error(error);
          toast.error("데이터 가져오기 실패: " + error.message);
          setStep("map");
        }
      },
    });
  };

  const resetState = () => {
    setFile(null);
    setPreviewData([]);
    setHeaders([]);
    setMapping({});
    setStep("upload");
    setImportStats(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetState();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            CSV 가져오기
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>환자 데이터 가져오기 (CSV)</DialogTitle>
          <DialogDescription>
            기존 EMR이나 엑셀에서 내보낸 CSV 파일을 업로드하여 환자를 일괄 등록합니다.
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="grid w-full max-w-sm items-center gap-1.5 mx-auto py-8 text-center">
            <Label htmlFor="csv-file" className="cursor-pointer border-2 border-dashed rounded-lg p-12 hover:bg-muted/50 transition-colors">
              <div className="flex flex-col items-center gap-2">
                <FileUp className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">클릭하여 CSV 파일 선택</span>
                <span className="text-xs text-muted-foreground">.csv 파일만 지원됩니다</span>
              </div>
              <Input
                ref={fileInputRef}
                id="csv-file"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </Label>
          </div>
        )}

        {step === "map" && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>컬럼 매핑 확인</AlertTitle>
              <AlertDescription>
                업로드한 파일의 컬럼을 시스템 필드와 연결해주세요.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 py-4">
              {requiredFields.map((field) => (
                <div key={field.key} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={field.key} className="text-right col-span-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  <Select
                    value={mapping[field.key] || ""}
                    onValueChange={(value) => setMapping({ ...mapping, [field.key]: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="컬럼 선택..." />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header} (예: {previewData[0]?.[header]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(mapping).map((key) => (
                      <TableHead key={key}>{requiredFields.find(f => f.key === key)?.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 3).map((row, i) => (
                    <TableRow key={i}>
                      {Object.keys(mapping).map((key) => (
                        <TableCell key={key}>{row[mapping[key]]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {step === "importing" && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p>데이터를 가져오는 중입니다... 잠시만 기다려주세요.</p>
          </div>
        )}

        <DialogFooter>
          {step === "map" && (
            <>
              <Button variant="outline" onClick={resetState}>
                다시 선택
              </Button>
              <Button onClick={handleImport}>
                가져오기 실행
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

