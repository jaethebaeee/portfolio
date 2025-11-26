"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  FileText, 
  Copy, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  PlayCircle,
  PauseCircle,
  Wand2,
  MoreHorizontal,
  CreditCard,
  Calculator,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock Transcript Data
const MOCK_TRANSCRIPT = [
  { id: 1, speaker: "doctor", text: "안녕하세요, 오늘 어떤 부분 때문에 오셨나요?", time: "00:00" },
  { id: 2, speaker: "patient", text: "눈이 좀 처져 보이는 게 고민이라서요. 쌍꺼풀 수술을 생각하고 있어요.", time: "00:05" },
  { id: 3, speaker: "doctor", text: "네, 한번 볼게요. 눈을 감았다가 떠보시겠어요?", time: "00:12" },
  { id: 4, speaker: "doctor", text: "지금 눈꺼풀 피부가 약간 늘어져 있고, 지방도 조금 있는 편이시네요.", time: "00:20" },
  { id: 5, speaker: "patient", text: "네 맞아요. 아침마다 좀 붓기도 하고요.", time: "00:25" },
  { id: 6, speaker: "doctor", text: "이런 경우에는 절개법으로 지방을 좀 제거하면서 라인을 잡는 게 좋을 것 같습니다.", time: "00:30" },
  { id: 7, speaker: "patient", text: "매몰법으로는 어려울까요? 흉터 남는 게 걱정돼서요.", time: "00:38" },
  { id: 8, speaker: "doctor", text: "매몰법도 가능은 하지만, 피부 처짐이 있어서 나중에 다시 풀릴 가능성이 높아요. 부분 절개로 하면 흉터도 최소화할 수 있습니다.", time: "00:45" },
  { id: 9, speaker: "patient", text: "아, 부분 절개요? 그건 회복 기간이 얼마나 걸리나요?", time: "00:55" },
  { id: 10, speaker: "doctor", text: "큰 붓기는 일주일 정도면 빠지고요, 실밥은 5일 뒤에 뽑습니다. 일상생활은 바로 가능하세요.", time: "01:02" },
];

// Specialty Templates
const TEMPLATES = {
  eyelid: {
    label: "눈 성형 (Blepharoplasty)",
    note: `Subjective (주관적 호소):
- 눈꺼풀 처짐과 아침 부종 호소
- 쌍꺼풀 수술 희망하나 흉터에 대한 우려로 매몰법 선호
- 회복 기간에 대한 문의

Objective (객관적 소견):
- 눈꺼풀 피부 이완 및 안와 지방 과다 관찰됨
- 피부 처짐으로 인해 단순 매몰법 시행 시 풀림 가능성 높음

Assessment (평가/진단):
- 안검하수 의심 소견 없음
- 상안검 이완증 및 지방 과다

Plan (계획):
- 부분 절개법을 통한 쌍꺼풀 수술 권장
- 지방 제거 병행 필요
- 수술 후 5일차 실밥 제거, 1주 후 부종 호전 예상 안내`
  },
  rhinoplasty: {
    label: "코 성형 (Rhinoplasty)",
    note: `Subjective (주관적 호소):
- 콧대가 낮고 코끝이 뭉툭한 것이 고민
- 자연스러운 라인을 선호하며 보형물 티가 나는 것을 우려
- 비염 증상 동반 여부 확인 요청

Objective (객관적 소견):
- 콧대 높이가 낮고 비중격 연골이 다소 약함
- 코끝 피부 두께는 보통이며 탄력 양호
- 비중격 만곡증 소견 일부 관찰됨

Assessment (평가/진단):
- 융비술(Augmentation Rhinoplasty) 및 비첨 성형술 필요
- 기능적 코성형(비염 수술) 병행 고려 가능

Plan (계획):
- 실리콘 보형물 3mm 사용 예정
- 비중격 연골을 이용한 코끝 연장술
- 수술 후 7일차 부목 제거 예정`
  },
  skin: {
    label: "피부 레이저 (Laser Therapy)",
    note: `Subjective (주관적 호소):
- 얼굴 전체적인 잡티와 기미 개선 희망
- 시술 후 붉은기나 딱지가 생기는 것을 원치 않음
- 일상생활 즉시 복귀 원함

Objective (객관적 소견):
- 양측 광대 부위에 경계가 불분명한 갈색 색소 병변 다수
- 피부톤이 전체적으로 칙칙함
- 모공 확장 소견 동반

Assessment (평가/진단):
- 표피성 및 진피성 색소 혼재 (기미, 잡티)
- 모공 확장증

Plan (계획):
- 피코 토닝 레이저 10회 패키지 권장
- 비타민 관리 병행
- 자외선 차단제 사용 교육`
  }
};

export function ConsultationReview() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("transcript");
  const [soapNote, setSoapNote] = useState(TEMPLATES.eyelid.note);
  const [selectedTemplate, setSelectedTemplate] = useState("eyelid");
  const [highlightedTranscriptId, setHighlightedTranscriptId] = useState<number | null>(null);
  
  // Quotation State
  const [quoteAmount, setQuoteAmount] = useState<string>("1500000");
  const [discountRate, setDiscountRate] = useState<string>("10");

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    setSoapNote(TEMPLATES[value as keyof typeof TEMPLATES].note);
    toast.success(`${TEMPLATES[value as keyof typeof TEMPLATES].label} 템플릿이 적용되었습니다.`);
  };

  const handleCopyNote = () => {
    navigator.clipboard.writeText(soapNote);
    toast.success("진료 기록이 클립보드에 복사되었습니다.", {
      description: "EMR(차트)에 붙여넣기 하세요.",
    });
  };

  const handleTranscriptClick = (id: number) => {
    setHighlightedTranscriptId(id);
    toast.info("오디오 재생 위치가 변경되었습니다.", {
      description: `타임스탬프: ${MOCK_TRANSCRIPT.find(t => t.id === id)?.time}`,
      duration: 1000,
    });
  };

  const handleSendKakao = () => {
    toast.success("알림톡 발송 예약됨", {
      description: "환자에게 상담 후 안내 메시지가 발송됩니다.",
    });
  };

  const handleBookSurgery = () => {
    toast.success("수술 예약 페이지로 이동합니다.", {
      description: "일정 관리 화면을 엽니다...",
    });
  };

  const handleCopyForEMR = () => {
    // Format specifically for EMR (e.g. condensed)
    const emrFormat = `[${new Date().toLocaleDateString()} 상담기록]\n` + soapNote.replace(/\n\n/g, "\n");
    navigator.clipboard.writeText(emrFormat);
    toast.success("EMR용 서식이 복사되었습니다.", {
      description: "차트 프로그램(BizM, 차트온)에 붙여넣기 하세요.",
    });
  };

  const handleCreateQuote = () => {
    const amount = parseInt(quoteAmount);
    const discount = parseInt(discountRate);
    const finalPrice = amount * (1 - discount / 100);
    
    toast.success("견적서가 생성되었습니다.", {
      description: `최종 금액: ${finalPrice.toLocaleString()}원 (할인율 ${discount}%)`,
    });
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            김민지 (F/28) 
            <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
              상담 완료
            </Badge>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 font-normal">
              지인 소개 (김철수님)
            </Badge>
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 font-normal">
              예산 200~300만원
            </Badge>
            <Badge variant="secondary" className="text-xs bg-red-50 text-red-600 border-red-100 font-normal">
              ⚠️ 흉터 걱정 많음
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-3">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> 2024.11.26</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 14:30 - 15:00</span>
            <span className="flex items-center gap-1">담당: 이진우 원장</span>
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2">
             <Clock className="w-4 h-4" />
             이전 기록
           </Button>
           <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
             <CheckCircle2 className="w-4 h-4" />
             상담 종료
           </Button>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-12 h-full">
          
          {/* Left Panel: Transcript & Audio (30%) */}
          <div className="col-span-3 bg-white border-r flex flex-col h-full">
            <div className="p-4 border-b bg-slate-50">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
                녹음 / 전사
                <Badge variant="secondary" className="text-xs">03:45</Badge>
              </h2>
              {/* Audio Player Placeholder */}
              <div className="bg-white border rounded-md p-3 shadow-sm flex items-center gap-3 mb-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-blue-600"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <PauseCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                </Button>
                <div className="flex-1 h-8 flex items-center">
                   {/* Fake Waveform */}
                   <div className="flex items-end gap-[2px] h-full w-full opacity-50">
                      {[...Array(30)].map((_, i) => (
                        <div 
                          key={i} 
                          className="bg-blue-500 w-1 rounded-t-sm" 
                          style={{ height: `${Math.random() * 100}%` }}
                        />
                      ))}
                   </div>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {MOCK_TRANSCRIPT.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleTranscriptClick(item.id)}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-colors text-sm
                      ${highlightedTranscriptId === item.id 
                        ? 'bg-blue-50 border border-blue-100 ring-1 ring-blue-200' 
                        : 'hover:bg-gray-50 border border-transparent'
                      }
                    `}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-semibold text-xs ${item.speaker === 'doctor' ? 'text-blue-600' : 'text-gray-600'}`}>
                        {item.speaker === 'doctor' ? '원장님' : '환자'}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{item.time}</span>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Middle Panel: AI SOAP Note (50%) */}
          <div className="col-span-6 bg-white flex flex-col h-full border-r">
             <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
               <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                   <div className="p-2 bg-purple-100 rounded-lg">
                     <Wand2 className="w-4 h-4 text-purple-600" />
                   </div>
                   <div>
                     <h2 className="font-semibold text-gray-800">AI Note</h2>
                   </div>
                 </div>
                 
                 {/* Template Selector */}
                 <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger className="w-[200px] h-8 text-xs bg-slate-50 border-slate-200">
                    <SelectValue placeholder="템플릿 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eyelid">눈 성형 (Eyelid)</SelectItem>
                    <SelectItem value="rhinoplasty">코 성형 (Rhinoplasty)</SelectItem>
                    <SelectItem value="skin">피부 레이저 (Skin)</SelectItem>
                  </SelectContent>
                 </Select>
               </div>

               <div className="flex gap-2">
                 <Button variant="outline" size="sm" onClick={() => setSoapNote("")}>
                    초기화
                 </Button>
                 <Button variant="default" size="sm" onClick={handleCopyNote} className="gap-1.5">
                    <Copy className="w-3.5 h-3.5" />
                    복사
                 </Button>
               </div>
             </div>
             
             <div className="flex-1 p-6 bg-gray-50/50">
               <Card className="h-full shadow-sm border-gray-200">
                 <CardContent className="p-0 h-full">
                   <Textarea 
                     className="w-full h-full min-h-[500px] resize-none border-0 p-6 text-base leading-relaxed focus-visible:ring-0 font-mono text-gray-800"
                     value={soapNote}
                     onChange={(e) => setSoapNote(e.target.value)}
                   />
                 </CardContent>
               </Card>
             </div>
          </div>

          {/* Right Panel: Smart Actions (20%) */}
          <div className="col-span-3 bg-slate-50 flex flex-col h-full">
            <div className="p-4 border-b bg-white">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Smart Actions
              </h2>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                
                {/* Action: Quotation Generator (New) */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Sales</div>
                  <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-400">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="font-medium text-sm flex items-center gap-1">
                          <Calculator className="w-3.5 h-3.5 text-purple-500" />
                          견적 산출 (Quotation)
                        </div>
                      </div>
                      <div className="space-y-3 mb-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">시술 비용</Label>
                          <div className="relative">
                            <Input 
                              type="number" 
                              value={quoteAmount}
                              onChange={(e) => setQuoteAmount(e.target.value)}
                              className="h-8 text-xs pr-6" 
                            />
                            <span className="absolute right-2 top-2 text-xs text-gray-400">원</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">할인율 (%)</Label>
                          <Input 
                            type="number" 
                            value={discountRate}
                            onChange={(e) => setDiscountRate(e.target.value)}
                            className="h-8 text-xs" 
                          />
                        </div>
                        <div className="pt-2 border-t flex justify-between items-center">
                           <span className="text-xs font-semibold text-gray-600">예상 금액</span>
                           <span className="text-sm font-bold text-blue-600">
                             {(parseInt(quoteAmount || '0') * (1 - parseInt(discountRate || '0') / 100)).toLocaleString()}원
                           </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full text-xs h-8 gap-1" onClick={handleCreateQuote}>
                        <CreditCard className="w-3 h-3" />
                        견적서 생성
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Action 1: Post-Op Care */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Communication</div>
                  <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-yellow-400">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-sm flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-yellow-500" />
                          알림톡 발송
                        </div>
                        <Badge variant="secondary" className="text-[10px]">추천</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">
                        상담 후 안내 메시지를 발송합니다.
                      </p>
                      <Button size="sm" variant="outline" className="w-full text-xs h-8" onClick={handleSendKakao}>
                        미리보기 및 발송
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Action: Naver Review Request (New) */}
                <div className="space-y-2">
                  <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-400">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-sm flex items-center gap-1">
                          <span className="font-bold text-green-500">N</span>
                          네이버 리뷰 요청
                        </div>
                        <Badge variant="secondary" className="text-[10px] bg-green-50 text-green-700">효과↑</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">
                        네이버 영수증 리뷰 작성 링크를 발송합니다.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => {
                          toast.success("네이버 리뷰 링크가 알림톡으로 발송되었습니다.", {
                            description: "고객님이 링크를 클릭하면 바로 리뷰 작성 화면으로 이동합니다."
                          });
                        }}>
                          알림톡 발송
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs h-8" onClick={() => {
                          navigator.clipboard.writeText("https://m.place.naver.com/hospital/12345/review/write");
                          toast.success("리뷰 작성 링크가 복사되었습니다.");
                        }}>
                          링크 복사
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action 2: Follow-up */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Follow Up</div>
                  <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-400">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-sm flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          수술 예약/스케줄
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">
                        수술 예약을 진행하시겠습니까?
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" variant="outline" className="text-xs h-8" onClick={handleBookSurgery}>
                          예약하기
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs h-8">
                          나중에
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action 3: EMR Integration */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">System</div>
                  <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-gray-400">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-sm flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-gray-500" />
                          차트 연동
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">
                        BizM 차트 양식으로 변환하여 복사합니다.
                      </p>
                      <Button size="sm" variant="secondary" className="w-full text-xs h-8 gap-1" onClick={handleCopyForEMR}>
                        <Copy className="w-3 h-3" />
                        서식 복사
                      </Button>
                    </CardContent>
                  </Card>
                </div>

              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
