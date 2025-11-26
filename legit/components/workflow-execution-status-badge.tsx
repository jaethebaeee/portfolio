import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";

interface WorkflowExecutionStatusBadgeProps {
  status: string;
  className?: string;
}

export function WorkflowExecutionStatusBadge({
  status,
  className,
}: WorkflowExecutionStatusBadgeProps) {
  switch (status) {
    case "completed":
      return (
        <Badge className={`bg-green-500 hover:bg-green-600 ${className ?? ""}`}>
          <CheckCircle2 className="w-3 h-3 mr-1" /> 완료
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive" className={className}>
          <XCircle className="w-3 h-3 mr-1" /> 실패
        </Badge>
      );
    case "running":
      return (
        <Badge className={`bg-blue-500 hover:bg-blue-600 animate-pulse ${className ?? ""}`}>
          <Loader2 className="w-3 h-3 mr-1 animate-spin" /> 실행 중
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge variant="secondary" className={className}>
          <Clock className="w-3 h-3 mr-1" /> 대기
        </Badge>
      );
  }
}


