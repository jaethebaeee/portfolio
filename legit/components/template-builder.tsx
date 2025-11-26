"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MessageSquare, Phone, Trash2, Edit2, Plus, Copy, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MarketingTemplate, TemplateMessage, Channel } from "@/lib/template-types";
import { toast } from "sonner";

interface TemplateBuilderProps {
  templates: MarketingTemplate[];
  onUpdate: (templates: MarketingTemplate[]) => void;
  onEdit?: (template: MarketingTemplate) => void;
  onPreview?: (template: MarketingTemplate) => void;
  onDuplicate?: (template: MarketingTemplate) => void;
}

interface SortableTemplateItemProps {
  template: MarketingTemplate;
  onEdit: (template: MarketingTemplate) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onPreview?: (template: MarketingTemplate) => void;
  onDuplicate?: (template: MarketingTemplate) => void;
}

function SortableTemplateItem({
  template,
  onEdit,
  onDelete,
  onToggle,
  onPreview,
  onDuplicate,
}: SortableTemplateItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: template.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getChannelBadge = (channel: Channel) => {
    switch (channel) {
      case "kakao":
        return <Badge className="bg-yellow-500">카톡</Badge>;
      case "sms":
        return <Badge className="bg-blue-500">SMS</Badge>;
      case "both":
        return (
          <>
            <Badge className="bg-yellow-500">카톡</Badge>
            <Badge className="bg-blue-500">SMS</Badge>
          </>
        );
    }
  };

  const getTriggerLabel = () => {
    switch (template.trigger.type) {
      case "appointment_completed":
        return "예약 완료 시";
      case "days_after_surgery":
        return `수술 후 ${template.trigger.value}일째`;
      case "days_before_birthday":
        return `생일 ${template.trigger.value}일 전`;
      case "months_since_last_visit":
        return `${template.trigger.value}개월 미방문`;
      case "review_request":
        return "리뷰 요청";
      default:
        return "조건 없음";
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
              >
                <GripVertical className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex gap-1">
                    {template.messages.map((msg, idx) => (
                      <div key={idx}>{getChannelBadge(msg.channel)}</div>
                    ))}
                  </div>
                </div>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>트리거: {getTriggerLabel()}</span>
                  <span>메시지 수: {template.messages.length}개</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Switch
                checked={template.enabled}
                onCheckedChange={() => onToggle(template.id)}
              />
              {onPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPreview(template)}
                  title="미리보기"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onDuplicate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDuplicate(template)}
                  title="복사"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(template)}
                title="편집"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(template.id)}
                title="삭제"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

export function TemplateBuilder({ templates, onUpdate, onEdit, onPreview, onDuplicate }: TemplateBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = templates.findIndex((t) => t.id === active.id);
      const newIndex = templates.findIndex((t) => t.id === over.id);

      const newTemplates = arrayMove(templates, oldIndex, newIndex);
      onUpdate(newTemplates);
      toast.success("템플릿 순서가 변경되었습니다.");
    }
  };

  const handleToggle = (id: string) => {
    const newTemplates = templates.map((t) =>
      t.id === id ? { ...t, enabled: !t.enabled } : t
    );
    onUpdate(newTemplates);
    toast.success("템플릿 상태가 변경되었습니다.");
  };

  const handleDelete = (id: string) => {
    if (confirm("정말 이 템플릿을 삭제하시겠습니까?")) {
      const newTemplates = templates.filter((t) => t.id !== id);
      onUpdate(newTemplates);
      toast.success("템플릿이 삭제되었습니다.");
    }
  };

  const handleEdit = (template: MarketingTemplate) => {
    if (onEdit) {
      onEdit(template);
    } else {
      toast.info("템플릿 편집 기능은 곧 추가될 예정입니다.");
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={templates.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div>
          {templates.map((template) => (
            <SortableTemplateItem
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onPreview={onPreview}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

