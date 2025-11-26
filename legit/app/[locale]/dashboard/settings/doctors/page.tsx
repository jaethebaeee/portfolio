"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, UserMd, Palette } from "lucide-react";
import { toast } from "sonner";
import { Doctor } from "@/lib/database.types";
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from "@/lib/doctors";

export default function DoctorsPage() {
  const { userId } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", specialty: "", color: "#3b82f6" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const colors = [
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f59e0b", // Yellow
    "#ef4444", // Red
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#6b7280", // Gray
  ];

  useEffect(() => {
    if (userId) {
      fetchDoctors();
    }
  }, [userId]);

  const fetchDoctors = async () => {
    if (!userId) return;
    try {
      const data = await getDoctors(userId);
      setDoctors(data);
    } catch (error) {
      toast.error("의사 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userId) return;
    if (!formData.name) {
      toast.error("이름을 입력해주세요.");
      return;
    }

    try {
      if (editingId) {
        await updateDoctor(userId, editingId, formData);
        toast.success("수정되었습니다.");
      } else {
        await createDoctor(userId, formData);
        toast.success("추가되었습니다.");
      }
      setIsDialogOpen(false);
      fetchDoctors();
      resetForm();
    } catch (error) {
      toast.error("저장에 실패했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!userId) return;
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deleteDoctor(userId, id);
      toast.success("삭제되었습니다.");
      fetchDoctors();
    } catch (error) {
      toast.error("삭제에 실패했습니다.");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", specialty: "", color: "#3b82f6" });
    setEditingId(null);
  };

  const startEdit = (doctor: Doctor) => {
    setEditingId(doctor.id);
    setFormData({ 
      name: doctor.name, 
      specialty: doctor.specialty || "", 
      color: doctor.color || "#3b82f6" 
    });
    setIsDialogOpen(true);
  };

  if (loading) return <div className="p-8">로딩 중...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">의료진 관리</h1>
          <p className="text-muted-foreground">
            의사/원장님 정보를 등록하고 캘린더 색상을 설정하세요
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> 의료진 추가
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="group relative overflow-hidden border-l-4" style={{ borderLeftColor: doctor.color }}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>{doctor.name}</span>
                <div 
                  className="h-4 w-4 rounded-full" 
                  style={{ backgroundColor: doctor.color }} 
                />
              </CardTitle>
              <CardDescription>{doctor.specialty || "전문분야 미입력"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm" onClick={() => startEdit(doctor)}>
                  수정
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(doctor.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {doctors.length === 0 && (
          <div className="col-span-full text-center py-12 border border-dashed rounded-lg bg-muted/10 text-muted-foreground">
            등록된 의료진이 없습니다.
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? '의료진 수정' : '새 의료진 등록'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>이름</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="예: 김닥터"
              />
            </div>
            <div className="space-y-2">
              <Label>전문분야</Label>
              <Input 
                value={formData.specialty} 
                onChange={(e) => setFormData({...formData, specialty: e.target.value})} 
                placeholder="예: 라식/라섹, 코성형"
              />
            </div>
            <div className="space-y-2">
              <Label>캘린더 색상</Label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-all ${formData.color === c ? 'ring-2 ring-offset-2 ring-black scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setFormData({...formData, color: c})}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
            <Button onClick={handleSubmit}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

