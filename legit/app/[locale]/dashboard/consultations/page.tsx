"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List as ListIcon, Sparkles } from "lucide-react";
import { ConsultationList } from "@/components/consultations/consultation-list";
import { ConsultationKanban } from "@/components/consultations/consultation-kanban";
import { ConsultationDialog } from "@/components/consultations/consultation-dialog";
import { ConsultationStats } from "@/components/consultations/consultation-stats";
import { getConsultations, getConsultationStats, createConsultation, updateConsultation, deleteConsultation } from "@/lib/consultations";
import { getPatients } from "@/lib/patients";
import { Consultation, Patient } from "@/lib/database.types";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ConsultationPage() {
  const { userId, isLoaded } = useAuth();
  
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const fetchData = async () => {
    if (!userId) return;
    try {
      const [consultationsData, statsData, patientsData] = await Promise.all([
        getConsultations(userId),
        getConsultationStats(userId),
        getPatients(userId)
      ]);
      setConsultations(consultationsData as Consultation[]);
      setStats(statsData);
      setPatients(patientsData as Patient[]);
    } catch (error) {
      console.error(error);
      toast.error("상담 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && userId) {
      fetchData();
    }
  }, [isLoaded, userId]);

  const handleCreate = async (data: Partial<Consultation>) => {
    if (!userId) return;
    try {
      await createConsultation(userId, data);
      await fetchData();
      toast.success("상담 기록이 생성되었습니다.");
    } catch (error) {
      toast.error("저장하지 못했습니다.");
    }
  };

  const handleUpdate = async (data: Partial<Consultation>) => {
    if (!userId || !editingConsultation) return;
    try {
      await updateConsultation(userId, editingConsultation.id, data);
      await fetchData();
      toast.success("상담 기록이 수정되었습니다.");
    } catch (error) {
      toast.error("수정하지 못했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!userId || !confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteConsultation(userId, id);
      await fetchData();
      toast.success("상담 기록이 삭제되었습니다.");
    } catch (error) {
      toast.error("삭제하지 못했습니다.");
    }
  };

  if (!isLoaded || loading) {
    return <div className="p-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">상담 관리 (CRM)</h2>
          <p className="text-muted-foreground">
            상담 이력과 수술 예약 현황을 관리하세요.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md bg-background mr-2">
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-8 px-3 rounded-none rounded-l-md"
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="h-4 w-4 mr-2" /> 리스트
            </Button>
            <div className="w-[1px] h-4 bg-border" />
            <Button 
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-8 px-3 rounded-none rounded-r-md"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4 mr-2" /> 칸반 보드
            </Button>
          </div>
          <Button onClick={() => window.location.href = '/dashboard/consultations/review'} variant="outline">
            <Sparkles className="mr-2 h-4 w-4" /> AI 진료실 (Demo)
          </Button>
          <Button onClick={() => { setEditingConsultation(undefined); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> 새 상담 등록
          </Button>
        </div>
      </div>

      {stats && <ConsultationStats stats={stats} />}

      {viewMode === 'list' ? (
        <ConsultationList 
          consultations={consultations} 
          onEdit={(c) => { setEditingConsultation(c); setDialogOpen(true); }}
          onDelete={handleDelete}
        />
      ) : (
        <ConsultationKanban 
          consultations={consultations}
          onEdit={(c) => { setEditingConsultation(c); setDialogOpen(true); }}
        />
      )}

      <ConsultationDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onSubmit={editingConsultation ? handleUpdate : handleCreate}
        initialData={editingConsultation}
        patients={patients}
      />
    </div>
  );
}
