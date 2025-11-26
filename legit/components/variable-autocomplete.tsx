"use client";

import { useState, useRef, useEffect } from "react";
import { AVAILABLE_VARIABLES } from "@/lib/template-validation";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface VariableAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onCursorPosition?: (position: number) => void;
}

export function VariableAutocomplete({
  value,
  onChange,
  onCursorPosition,
}: VariableAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Find textarea by finding the active textarea or the one with id containing "message-"
    const findTextarea = () => {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.tagName === 'TEXTAREA') {
        return activeElement as HTMLTextAreaElement;
      }
      // Try to find textarea with message- id pattern
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

      // {{ 입력 시 자동완성 열기
      const textBeforeCursor = target.value.substring(0, pos);
      const lastTwoChars = textBeforeCursor.slice(-2);
      
      if (lastTwoChars === "{{") {
        setOpen(true);
      } else if (target.value[pos - 1] === "}") {
        setOpen(false);
      }

      if (onCursorPosition) {
        onCursorPosition(pos);
      }
    };

    // Use event delegation on document
    document.addEventListener("input", handleInput, true);
    document.addEventListener("click", handleInput, true);
    document.addEventListener("keyup", handleInput, true);

    return () => {
      document.removeEventListener("input", handleInput, true);
      document.removeEventListener("click", handleInput, true);
      document.removeEventListener("keyup", handleInput, true);
    };
  }, [onCursorPosition]);

  const insertVariable = (variableName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const textBeforeCursor = value.substring(0, cursorPos);
    const textAfterCursor = value.substring(cursorPos);
    
    // {{ 뒤에 변수 삽입
    const lastOpenBrace = textBeforeCursor.lastIndexOf("{{");
    if (lastOpenBrace !== -1) {
      const beforeBrace = value.substring(0, lastOpenBrace);
      const afterBrace = value.substring(lastOpenBrace + 2);
      const newValue = `${beforeBrace}{{${variableName}}}${afterBrace}`;
      onChange(newValue);
      
      // 커서 위치 조정
      setTimeout(() => {
        const newPos = lastOpenBrace + variableName.length + 4; // {{variable}}
        textarea.setSelectionRange(newPos, newPos);
        setCursorPos(newPos);
      }, 0);
    } else {
      // {{ 없으면 그냥 삽입
      const newValue = `${textBeforeCursor}{{${variableName}}}${textAfterCursor}`;
      onChange(newValue);
    }

    setOpen(false);
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="hidden" />
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="start" side="bottom">
          <Command>
            <CommandList>
              <CommandEmpty>변수를 찾을 수 없습니다.</CommandEmpty>
              <CommandGroup heading="사용 가능한 변수">
                {AVAILABLE_VARIABLES.map((variable) => (
                  <CommandItem
                    key={variable.name}
                    value={variable.name}
                    onSelect={() => insertVariable(variable.name)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-semibold">{`{{${variable.name}}}`}</span>
                      </div>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {variable.description}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

