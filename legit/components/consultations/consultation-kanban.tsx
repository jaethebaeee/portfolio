import { Consultation } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Phone, CalendarClock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface ConsultationKanbanProps {
  consultations: Consultation[];
  onEdit: (consultation: Consultation) => void;
}

export function ConsultationKanban({ consultations, onEdit }: ConsultationKanbanProps) {
  // Filter and group consultations
  const columns = {
    scheduled: {
      title: "예약됨 (Scheduled)",
      color: "bg-gray-100",
      items: consultations.filter(c => c.status === 'scheduled')
    },
    considering: {
      title: "고민 중 (Considering)",
      color: "bg-blue-50",
      items: consultations.filter(c => c.status === 'completed' && c.outcome === 'considering')
    },
    follow_up: {
      title: "재연락 필요 (Follow-up)",
      color: "bg-yellow-50",
      items: consultations.filter(c => c.status === 'completed' && c.outcome === 'follow_up_needed')
    },
    booked: {
      title: "수술/시술 예약 (Booked)",
      color: "bg-green-50",
      items: consultations.filter(c => c.outcome === 'surgery_booked' || c.outcome === 'deposit_paid')
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-250px)] min-h-[500px]">
      {Object.entries(columns).map(([key, column]) => (
        <div key={key} className={`flex-1 min-w-[300px] rounded-lg p-4 ${column.color} flex flex-col gap-4`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground">
              {column.title}
            </h3>
            <Badge variant="secondary">{column.items.length}</Badge>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {column.items.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8 bg-white/50 rounded-md border border-dashed">
                항목 없음
              </div>
            ) : (
              column.items.map((item) => (
                <KanbanCard key={item.id} consultation={item} onEdit={onEdit} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function KanbanCard({ consultation, onEdit }: { consultation: Consultation, onEdit: (c: Consultation) => void }) {
  const patientName = (consultation as any).patient?.name || '알 수 없음';
  const patientPhone = (consultation as any).patient?.phone || '';
  
  const isFollowUpOverdue = consultation.follow_up_date 
    ? new Date(consultation.follow_up_date) < new Date() 
    : false;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white" onClick={() => onEdit(consultation)}>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-sm">{patientName}</div>
            <div className="text-xs text-muted-foreground">{patientPhone}</div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
            e.stopPropagation();
            onEdit(consultation);
          }}>
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded">
          {consultation.notes || "메모 없음"}
        </div>

        {/* Follow-up Alert */}
        {consultation.outcome === 'follow_up_needed' && consultation.follow_up_date && (
          <div className={`flex items-center gap-2 text-xs p-2 rounded ${isFollowUpOverdue ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
            <CalendarClock className="h-3 w-3" />
            <span>
              {new Date(consultation.follow_up_date).toLocaleDateString()} 
              ({formatDistanceToNow(new Date(consultation.follow_up_date), { addSuffix: true, locale: ko })})
            </span>
            {isFollowUpOverdue && <AlertCircle className="h-3 w-3" />}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <span>{consultation.counselor_name || '미배정'}</span>
          </div>
          <div className="font-medium text-gray-900">
            {consultation.quoted_price ? `₩${consultation.quoted_price.toLocaleString()}` : '-'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

