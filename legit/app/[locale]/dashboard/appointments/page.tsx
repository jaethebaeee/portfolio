"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar, Clock, User, Search, Edit2, Trash2, CheckCircle2, XCircle, Filter } from "lucide-react";
import { toast } from "sonner";
import { Appointment } from "@/lib/database.types";
import { Patient } from "@/lib/database.types";
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
} from "@/lib/queries/appointments";
import { usePatients } from "@/lib/queries/patients";

import { CopyKakaoButton } from "@/components/ui/copy-kakao-button";

export default function AppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

  const [formData, setFormData] = useState({
    patient_id: "",
    appointment_date: "",
    appointment_time: "",
    type: "",
    status: "scheduled" as "scheduled" | "completed" | "cancelled" | "no_show",
    notes: "",
  });

  // React Query hooks
  const { data: appointments = [], isLoading, error } = useAppointments(statusFilter);
  const { data: patients = [] } = usePatients();

  // TODO: Implement doctors query hook
  const doctors: any[] = [];
  const createAppointmentMutation = useCreateAppointment();
  const updateAppointmentMutation = useUpdateAppointment();
  const deleteAppointmentMutation = useDeleteAppointment();

  // 예약 추가
  const handleAddAppointment = async () => {
    try {
      if (!formData.patient_id || !formData.appointment_date || !formData.appointment_time) {
        toast.error("환자, 예약 날짜, 예약 시간은 필수입니다.");
        return;
      }

      await createAppointmentMutation.mutateAsync(formData);
      toast.success("예약이 추가되었습니다. 템플릿이 자동으로 실행됩니다.");
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "예약 추가 중 오류가 발생했습니다.");
    }
  };

  // 예약 수정
  const handleUpdateAppointment = async () => {
    if (!editingAppointment) return;

    try {
      if (!formData.patient_id || !formData.appointment_date || !formData.appointment_time) {
        toast.error("환자, 예약 날짜, 예약 시간은 필수입니다.");
        return;
      }

      await updateAppointmentMutation.mutateAsync({
        id: editingAppointment.id,
        data: formData,
      });
      toast.success("예약 정보가 수정되었습니다.");
      setEditingAppointment(null);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "예약 수정 중 오류가 발생했습니다.");
    }
  };

  // 예약 삭제
  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    try {
      await deleteAppointmentMutation.mutateAsync(appointmentToDelete.id);
      toast.success("예약이 삭제되었습니다.");
      setIsDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "예약 삭제 중 오류가 발생했습니다.");
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: "",
      appointment_date: "",
      appointment_time: "",
      type: "",
      status: "scheduled",
      notes: "",
    });
  };

  const startEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patient_id: appointment.patient_id,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      type: appointment.type || "",
      status: appointment.status,
      notes: appointment.notes || "",
    });
  };

  const confirmDelete = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setIsDeleteDialogOpen(true);
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient?.name || "알 수 없음";
  };

  const getPatient = (patientId: string) => {
    return patients.find((p) => p.id === patientId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />완료</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />취소</Badge>;
      default:
        return <Badge className="bg-blue-500">예정</Badge>;
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const query = searchQuery.toLowerCase();
    const patientName = getPatientName(appointment.patient_id).toLowerCase();
    
    const matchesSearch = 
      patientName.includes(query) ||
      appointment.type?.toLowerCase().includes(query) ||
      appointment.appointment_date.includes(query);

    const matchesDoctor = doctorFilter === "all" || (appointment as any).doctor_id === doctorFilter;

    return matchesSearch && matchesDoctor;
  });

  // 날짜별로 그룹화
  const groupedAppointments = filteredAppointments.reduce((acc, appointment) => {
    const date = appointment.appointment_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const sortedDates = Object.keys(groupedAppointments).sort();

  // 에러 처리
  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">예약 목록을 불러오는 중 오류가 발생했습니다.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            새로고침
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">예약</h1>
          <p className="text-muted-foreground">
            예약 일정을 관리하고 확인하세요
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              예약 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>예약 추가</DialogTitle>
              <DialogDescription>
                새로운 예약을 추가하세요. 예약 완료 시 템플릿이 자동으로 실행됩니다.
              </DialogDescription>
            </DialogHeader>
            <AppointmentForm
              formData={formData}
              setFormData={setFormData}
              patients={patients}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                취소
              </Button>
              <Button
                onClick={handleAddAppointment}
                disabled={createAppointmentMutation.isPending}
              >
                {createAppointmentMutation.isPending ? "추가 중..." : "추가"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="환자 이름, 예약 유형, 날짜로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="scheduled">예정</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
                <SelectItem value="cancelled">취소</SelectItem>
              </SelectContent>
            </Select>

            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="w-40">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="의료진 필터" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 의료진</SelectItem>
                {doctors.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: doc.color }} />
                      {doc.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground">
              총 {filteredAppointments.length}건
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 예약 목록 */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
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
      ) : sortedDates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {searchQuery ? "검색 결과가 없습니다." : "등록된 예약이 없습니다."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <h2 className="text-lg font-semibold mb-3">
                {new Date(date).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </h2>
              <div className="space-y-3">
                {groupedAppointments[date]
                  .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                  .map((appointment) => (
                    <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {getPatientName(appointment.patient_id)}
                                </span>
                              </div>
                              {getStatusBadge(appointment.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{appointment.appointment_time}</span>
                              </div>
                              {appointment.type && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{appointment.type}</span>
                                </div>
                              )}
                            </div>
                            {appointment.notes && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                {appointment.notes}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(appointment)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => confirmDelete(appointment)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            💡 카카오톡으로 빠르게 안내하기
                          </div>
                          <CopyKakaoButton 
                            patientName={getPatientName(appointment.patient_id)}
                            appointmentDate={appointment.appointment_date}
                            appointmentTime={appointment.appointment_time}
                            type={appointment.type}
                            hospitalPhone={getPatient(appointment.patient_id)?.phone}
                            notes={appointment.notes}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 수정 다이얼로그 */}
      {editingAppointment && (
        <Dialog open={!!editingAppointment} onOpenChange={() => setEditingAppointment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>예약 정보 수정</DialogTitle>
              <DialogDescription>
                예약 정보를 수정하세요
              </DialogDescription>
            </DialogHeader>
            <AppointmentForm
              formData={formData}
              setFormData={setFormData}
              patients={patients}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingAppointment(null)}>
                취소
              </Button>
              <Button
                onClick={handleUpdateAppointment}
                disabled={updateAppointmentMutation.isPending}
              >
                {updateAppointmentMutation.isPending ? "저장 중..." : "저장"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>예약 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 예약을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAppointment}
              disabled={deleteAppointmentMutation.isPending}
            >
              {deleteAppointmentMutation.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 예약 폼 컴포넌트
function AppointmentForm({
  formData,
  setFormData,
  patients,
}: {
  formData: any;
  setFormData: (data: any) => void;
  patients: Patient[];
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="patient_id">환자 *</Label>
        <Select
          value={formData.patient_id}
          onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="환자를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.name} ({patient.phone})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="appointment_date">예약 날짜 *</Label>
          <Input
            id="appointment_date"
            type="date"
            value={formData.appointment_date}
            onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="appointment_time">예약 시간 *</Label>
          <Input
            id="appointment_time"
            type="time"
            value={formData.appointment_time}
            onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">예약 유형</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="라식">라식</SelectItem>
              <SelectItem value="라섹">라섹</SelectItem>
              <SelectItem value="성형수술">성형수술</SelectItem>
              <SelectItem value="상담">상담</SelectItem>
              <SelectItem value="검진">검진</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">상태</Label>
          <Select
            value={formData.status}
            onValueChange={(value: any) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">예정</SelectItem>
              <SelectItem value="completed">완료</SelectItem>
              <SelectItem value="cancelled">취소</SelectItem>
            </SelectContent>
          </Select>
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
    </div>
  );
}
