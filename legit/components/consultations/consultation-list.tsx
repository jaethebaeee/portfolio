import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { Consultation } from "@/lib/database.types";
import Link from "next/link";

interface ConsultationListProps {
  consultations: Consultation[];
  onEdit: (consultation: Consultation) => void;
  onDelete: (id: string) => void;
}

export function ConsultationList({ consultations, onEdit, onDelete }: ConsultationListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'scheduled': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'noshow': return 'destructive';
      default: return 'outline';
    }
  };

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'surgery_booked': return 'bg-green-500 hover:bg-green-600';
      case 'deposit_paid': return 'bg-blue-500 hover:bg-blue-600';
      case 'lost': return 'bg-gray-500';
      default: return 'bg-yellow-500 hover:bg-yellow-600';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>날짜</TableHead>
            <TableHead>환자명</TableHead>
            <TableHead>상담실장</TableHead>
            <TableHead>유입 경로</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>결과</TableHead>
            <TableHead className="text-right">예약금</TableHead>
            <TableHead className="text-right">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consultations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                상담 기록이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            consultations.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{new Date(c.consultation_date).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/patients/${c.patient_id}`} className="hover:underline text-primary">
                    {(c as any).patient?.name || '알 수 없음'}
                  </Link>
                  <div className="text-xs text-muted-foreground">{(c as any).patient?.phone}</div>
                </TableCell>
                <TableCell>{c.counselor_name || '-'}</TableCell>
                <TableCell className="capitalize">{c.source?.replace('_', ' ')}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(c.status) as any}>{c.status}</Badge>
                </TableCell>
                <TableCell>
                  {c.outcome && (
                    <Badge className={getOutcomeColor(c.outcome)}>
                      {c.outcome.replace('_', ' ')}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {c.deposit_amount ? `${c.deposit_amount.toLocaleString()}원` : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(c)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(c.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

