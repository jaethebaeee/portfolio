"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  VARIABLE_METADATA, 
  getVariablesForTrigger, 
  fuzzySearchVariables,
  getVariableMetadata,
  CATEGORY_LABELS,
  VariableMetadata 
} from "@/lib/variable-metadata";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandInput } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvancedVariableAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  triggerType?: string;
  onCursorPosition?: (position: number) => void;
  textareaId?: string;
}

// 최근 사용한 변수 추적 (localStorage)
const RECENT_VARIABLES_KEY = 'template_recent_variables';

function getRecentVariables(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_VARIABLES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentVariable(variableName: string) {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentVariables();
    const updated = [variableName, ...recent.filter(v => v !== variableName)].slice(0, 5);
    localStorage.setItem(RECENT_VARIABLES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore errors
  }
}

export function AdvancedVariableAutocomplete({
  value,
  onChange,
  triggerType,
  onCursorPosition,
  textareaId,
}: AdvancedVariableAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const commandRef = useRef<HTMLDivElement>(null);

  // 트리거 타입에 맞는 변수 필터링
  const availableVariables = triggerType 
    ? getVariablesForTrigger(triggerType)
    : VARIABLE_METADATA;

  // 검색 필터링
  const filteredVariables = searchQuery
    ? fuzzySearchVariables(searchQuery, 20)
    : availableVariables;

  // 최근 사용한 변수
  const recentVariableNames = getRecentVariables();
  const recentVariables = recentVariableNames
    .map(name => VARIABLE_METADATA.find(v => v.name === name))
    .filter((v): v is VariableMetadata => v !== undefined);

  // 카테고리별 그룹화
  const groupedVariables = filteredVariables.reduce((acc, variable) => {
    if (!acc[variable.category]) {
      acc[variable.category] = [];
    }
    acc[variable.category].push(variable);
    return acc;
  }, {} as Record<string, VariableMetadata[]>);

  // 텍스트에어리어 찾기 및 이벤트 리스너
  useEffect(() => {
    const findTextarea = (): HTMLTextAreaElement | null => {
      if (textareaId) {
        const element = document.getElementById(textareaId);
        if (element && element.tagName === 'TEXTAREA') {
          return element as HTMLTextAreaElement;
        }
      }
      
      const activeElement = document.activeElement;
      if (activeElement && activeElement.tagName === 'TEXTAREA') {
        return activeElement as HTMLTextAreaElement;
      }
      
      const textareas = document.querySelectorAll('textarea[id^="message-"]');
      if (textareas.length > 0) {
        return Array.from(textareas).find(t => t === document.activeElement) as HTMLTextAreaElement || 
               textareas[textareas.length - 1] as HTMLTextAreaElement;
      }
      
      return null;
    };

    const handleInput = (e: Event) => {
      const target = e.target as HTMLTextAreaElement;
      if (!target || target.tagName !== 'TEXTAREA') return;
      
      const pos = target.selectionStart || 0;
      setCursorPos(pos);
      textareaRef.current = target;

      // {{ 입력 시 자동완성 열기
      const textBeforeCursor = target.value.substring(0, pos);
      const lastTwoChars = textBeforeCursor.slice(-2);
      
      if (lastTwoChars === "{{") {
        setOpen(true);
        setSearchQuery("");
        setSelectedIndex(0);
      } else if (target.value[pos - 1] === "}") {
        setOpen(false);
      }

      if (onCursorPosition) {
        onCursorPosition(pos);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      const target = e.target as HTMLTextAreaElement;
      if (target.tagName !== 'TEXTAREA') return;

      // Tab 키로 선택된 변수 삽입
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        const variables = recentVariables.length > 0 && !searchQuery 
          ? recentVariables 
          : Object.values(groupedVariables).flat();
        
        if (variables[selectedIndex]) {
          insertVariable(variables[selectedIndex].name);
        }
        return;
      }

      // Esc로 닫기
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }

      // Arrow keys로 네비게이션
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const allVariables = recentVariables.length > 0 && !searchQuery 
          ? recentVariables 
          : Object.values(groupedVariables).flat();
        setSelectedIndex(prev => (prev + 1) % allVariables.length);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const allVariables = recentVariables.length > 0 && !searchQuery 
          ? recentVariables 
          : Object.values(groupedVariables).flat();
        setSelectedIndex(prev => (prev - 1 + allVariables.length) % allVariables.length);
        return;
      }
    };

    document.addEventListener("input", handleInput, true);
    document.addEventListener("click", handleInput, true);
    document.addEventListener("keyup", handleInput, true);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("input", handleInput, true);
      document.removeEventListener("click", handleInput, true);
      document.removeEventListener("keyup", handleInput, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [open, searchQuery, selectedIndex, recentVariables, groupedVariables, textareaId, onCursorPosition]);

  const insertVariable = useCallback((variableName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const currentValue = value;
    const pos = textarea.selectionStart || cursorPos;
    const textBeforeCursor = currentValue.substring(0, pos);
    const textAfterCursor = currentValue.substring(pos);
    
    // {{ 뒤에 변수 삽입
    const lastOpenBrace = textBeforeCursor.lastIndexOf("{{");
    if (lastOpenBrace !== -1 && lastOpenBrace === pos - 2) {
      // {{ 바로 뒤에 커서가 있는 경우
      const beforeBrace = currentValue.substring(0, lastOpenBrace);
      const afterBrace = currentValue.substring(pos);
      const newValue = `${beforeBrace}{{${variableName}}}${afterBrace}`;
      onChange(newValue);
      
      // 커서 위치 조정
      setTimeout(() => {
        const newPos = lastOpenBrace + variableName.length + 4; // {{variable}}
        textarea.focus();
        textarea.setSelectionRange(newPos, newPos);
        setCursorPos(newPos);
      }, 0);
    } else {
      // {{ 없으면 그냥 삽입
      const newValue = `${textBeforeCursor}{{${variableName}}}${textAfterCursor}`;
      onChange(newValue);
      
      // 커서 위치 조정
      setTimeout(() => {
        const newPos = pos + variableName.length + 4; // {{variable}}
        textarea.focus();
        textarea.setSelectionRange(newPos, newPos);
        setCursorPos(newPos);
      }, 0);
    }

    // 최근 사용한 변수에 추가
    addRecentVariable(variableName);
    setOpen(false);
    setSearchQuery("");
  }, [value, onChange, cursorPos]);

  // 변수 선택 시
  const handleSelect = (variableName: string) => {
    insertVariable(variableName);
  };

  // 모든 변수 목록 (최근 사용한 변수 + 카테고리별 변수)
  const allVariables = recentVariables.length > 0 && !searchQuery 
    ? recentVariables 
    : Object.values(groupedVariables).flat();

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="hidden" />
        </PopoverTrigger>
        <PopoverContent 
          className="w-[400px] p-0" 
          align="start" 
          side="bottom"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command ref={commandRef} className="rounded-lg border-0">
            <CommandInput 
              placeholder="변수 검색..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Search className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">변수를 찾을 수 없습니다</p>
                </div>
              </CommandEmpty>

              {/* 최근 사용한 변수 */}
              {recentVariables.length > 0 && !searchQuery && (
                <CommandGroup heading="최근 사용">
                  {recentVariables.map((variable, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <CommandItem
                        key={variable.name}
                        value={variable.name}
                        onSelect={() => handleSelect(variable.name)}
                        className={cn(
                          "cursor-pointer flex items-start gap-3 py-2",
                          isSelected && "bg-accent"
                        )}
                      >
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-semibold">{`{{${variable.name}}}`}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {CATEGORY_LABELS[variable.category]}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {variable.description}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-0.5">
                            예: {variable.example}
                          </p>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {/* 카테고리별 변수 */}
              {Object.entries(groupedVariables).map(([category, variables]) => (
                <CommandGroup 
                  key={category} 
                  heading={CATEGORY_LABELS[category]}
                  className="capitalize"
                >
                  {variables.map((variable, idx) => {
                    const globalIndex = recentVariables.length > 0 && !searchQuery
                      ? recentVariables.length + Object.entries(groupedVariables)
                          .slice(0, Object.keys(groupedVariables).indexOf(category))
                          .reduce((sum, [, vars]) => sum + vars.length, 0) + idx
                      : Object.entries(groupedVariables)
                          .slice(0, Object.keys(groupedVariables).indexOf(category))
                          .reduce((sum, [, vars]) => sum + vars.length, 0) + idx;
                    
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <CommandItem
                        key={variable.name}
                        value={variable.name}
                        onSelect={() => handleSelect(variable.name)}
                        className={cn(
                          "cursor-pointer flex items-start gap-3 py-2",
                          isSelected && "bg-accent"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-semibold">{`{{${variable.name}}}`}</span>
                            {variable.required && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                필수
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {variable.description}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-0.5">
                            예: {variable.example}
                          </p>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
          
          {/* 도움말 */}
          <div className="border-t p-2 bg-muted/50">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">↑↓</kbd>
                <span>이동</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">Tab</kbd>
                <span>선택</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">Esc</kbd>
                <span>닫기</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

