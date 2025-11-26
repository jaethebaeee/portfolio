"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, Clock, Trash2, GitGitCompare, X } from "lucide-react";
import Link from "next/link";
import { getPatient } from "@/lib/patients";
import { Patient, PatientPhoto } from "@/lib/database.types";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PatientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getPatient(id);
        setPatient(data);
      } catch (error) {
        toast.error("환자 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8">로딩 중...</div>;
  if (!patient) return <div className="p-8">환자를 찾을 수 없습니다.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patients">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            {patient.name}
            {patient.gender && (
              <Badge variant="secondary" className="text-base font-normal">
                {patient.gender === 'male' ? '남성' : '여성'}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            {patient.phone} | {patient.birth_date}
          </p>
        </div>
      </div>

      <Tabs defaultValue="photos" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="photos">사진 (Before/After)</TabsTrigger>
          <TabsTrigger value="history">진료 이력</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>환자 정보</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">이메일</Label>
                <div className="mt-1">{patient.email || '-'}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">최근 방문일</Label>
                <div className="mt-1">{patient.last_visit_date || '-'}</div>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">메모</Label>
                <div className="mt-1 p-3 bg-muted/50 rounded-md min-h-[100px]">
                  {patient.notes || '메모가 없습니다.'}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <PatientPhotoGallery patientId={id} />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              진료 이력 기능 준비 중입니다.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PatientPhotoGallery({ patientId }: { patientId: string }) {
  const { user } = useUser();
  const [photos, setPhotos] = useState<PatientPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [photoType, setPhotoType] = useState<'before' | 'after' | 'general'>('general');
  const [compareMode, setGitCompareMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<PatientPhoto[]>([]);
  const [isGitCompareDialogOpen, setIsGitCompareDialogOpen] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [patientId]);

  async function fetchPhotos() {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('patient_photos')
      .select('*')
      .eq('patient_id', patientId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching photos:', error);
      return;
    }
    setPhotos(data || []);
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user?.id) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${patientId}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('patient-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('patient-photos')
        .getPublicUrl(filePath);

      // 3. Save to DB
      const { error: dbError } = await supabase
        .from('patient_photos')
        .insert({
          user_id: user.id,
          patient_id: patientId,
          photo_url: publicUrl,
          photo_type: photoType,
          taken_at: new Date().toISOString().split('T')[0]
        });

      if (dbError) throw dbError;

      toast.success("사진이 업로드되었습니다.");
      fetchPhotos();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`업로드 실패: ${error.message}`);
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = async (photoId: string, photoUrl: string) => {
    if (!confirm('정말 이 사진을 삭제하시겠습니까?')) return;

    try {
      // 1. Delete from DB
      const { error: dbError } = await supabase
        .from('patient_photos')
        .delete()
        .eq('id', photoId);

      if (dbError) throw dbError;

      // 2. Delete from Storage (Optional but recommended)
      // Extract path from URL is tricky if we store full URL. 
      // For now, just deleting DB record is enough to hide it.
      
      toast.success("사진이 삭제되었습니다.");
      setPhotos(photos.filter(p => p.id !== photoId));
    } catch (error: any) {
      toast.error(`삭제 실패: ${error.message}`);
    }
  };

  const togglePhotoSelection = (photo: PatientPhoto) => {
    if (selectedPhotos.find(p => p.id === photo.id)) {
      setSelectedPhotos(selectedPhotos.filter(p => p.id !== photo.id));
    } else {
      if (selectedPhotos.length >= 2) {
        toast.error("비교할 사진은 최대 2장까지만 선택 가능합니다.");
        return;
      }
      setSelectedPhotos([...selectedPhotos, photo]);
    }
  };

  const startComparison = () => {
    if (selectedPhotos.length !== 2) {
      toast.error("비교할 사진 2장을 선택해주세요.");
      return;
    }
    // Sort by date (oldest first for Before/After)
    const sorted = [...selectedPhotos].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    setSelectedPhotos(sorted);
    setIsGitCompareDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 p-4 rounded-lg">
        {compareMode ? (
          <div className="flex items-center gap-4 w-full justify-between animate-in slide-in-from-left duration-300">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-sm">비교 모드</Badge>
              <span className="text-sm text-muted-foreground">
                {selectedPhotos.length} / 2 선택됨
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="default" 
                size="sm" 
                onClick={startComparison}
                disabled={selectedPhotos.length !== 2}
              >
                <GitCompare className="mr-2 h-4 w-4" /> 비교하기
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setGitCompareMode(false);
                  setSelectedPhotos([]);
                }}
              >
                <X className="mr-2 h-4 w-4" /> 취소
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
               <Label className="text-sm font-medium mb-1">사진 유형 선택</Label>
               <RadioGroup 
                 defaultValue="general" 
                 value={photoType} 
                 onValueChange={(v: any) => setPhotoType(v)}
                 className="flex gap-4"
               >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="before" id="type-before" />
                  <Label htmlFor="type-before">시술 전 (Before)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="after" id="type-after" />
                  <Label htmlFor="type-after">시술 후 (After)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="general" id="type-general" />
                  <Label htmlFor="type-general">일반</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setGitCompareMode(true)}>
                <GitCompare className="mr-2 h-4 w-4" /> 비교 모드
              </Button>
              <Input 
                type="file" 
                className="hidden" 
                id="photo-upload" 
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
              />
              <Label htmlFor="photo-upload">
                <Button variant="default" asChild disabled={uploading} className="cursor-pointer">
                  <span>
                    {uploading ? "업로드 중..." : (
                      <>
                        <Upload className="mr-2 h-4 w-4" /> 사진 업로드
                      </>
                    )}
                  </span>
                </Button>
              </Label>
            </div>
          </>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
          등록된 사진이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => {
            const isSelected = selectedPhotos.find(p => p.id === photo.id);
            return (
              <Card 
                key={photo.id} 
                className={`overflow-hidden group relative transition-all duration-200 ${
                  compareMode ? 'cursor-pointer hover:ring-2 hover:ring-primary' : ''
                } ${isSelected ? 'ring-2 ring-primary scale-95' : ''}`}
                onClick={() => compareMode && togglePhotoSelection(photo)}
              >
                <div className="aspect-square relative bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={photo.photo_url} 
                    alt={photo.photo_type} 
                    className="object-cover w-full h-full transition-transform group-hover:scale-105" 
                  />
                  <Badge 
                    className={`absolute top-2 left-2 border-none text-white ${
                      photo.photo_type === 'before' ? 'bg-red-500/80' : 
                      photo.photo_type === 'after' ? 'bg-green-500/80' : 'bg-gray-500/80'
                    }`}
                  >
                    {photo.photo_type.toUpperCase()}
                  </Badge>
                  
                  {compareMode && isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <GitCompare className="h-6 w-6" />
                      </div>
                    </div>
                  )}

                  {!compareMode && (
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(photo.id, photo.photo_url);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="text-sm text-muted-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {photo.taken_at || photo.created_at.split('T')[0]}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Comparison Dialog */}
      <Dialog open={isGitCompareDialogOpen} onOpenChange={setIsGitCompareDialogOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Before & After 비교</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center gap-4 bg-black/5 rounded-lg p-4 relative overflow-hidden">
            {selectedPhotos.length === 2 && (
              <>
                <div className="flex-1 relative h-full flex flex-col">
                   <div className="absolute top-2 left-2 z-10">
                    <Badge variant="destructive" className="text-lg px-3 py-1">Before</Badge>
                   </div>
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img 
                     src={selectedPhotos[0].photo_url} 
                     alt="Before" 
                     className="w-full h-full object-contain bg-black"
                   />
                   <div className="text-center text-sm font-medium mt-2">
                     {selectedPhotos[0].taken_at || selectedPhotos[0].created_at.split('T')[0]}
                   </div>
                </div>
                <div className="flex-1 relative h-full flex flex-col">
                   <div className="absolute top-2 left-2 z-10">
                    <Badge variant="default" className="bg-green-600 text-lg px-3 py-1">After</Badge>
                   </div>
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img 
                     src={selectedPhotos[1].photo_url} 
                     alt="After" 
                     className="w-full h-full object-contain bg-black"
                   />
                   <div className="text-center text-sm font-medium mt-2">
                     {selectedPhotos[1].taken_at || selectedPhotos[1].created_at.split('T')[0]}
                   </div>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
             <Button variant="outline" onClick={() => setIsGitCompareDialogOpen(false)}>닫기</Button>
             <Button onClick={() => toast.success("이미지 저장 기능은 준비 중입니다.")}>
               이미지 저장
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
