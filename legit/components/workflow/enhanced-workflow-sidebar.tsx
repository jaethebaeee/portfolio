"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, ChevronDown, ChevronRight, Sparkles, 
  Filter, X, Info
} from "lucide-react";
import { 
  NODE_LIBRARY, 
  getNodesByCategory, 
  searchNodes,
  NodeLibraryItem 
} from "@/lib/node-library";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface EnhancedWorkflowSidebarProps {
  onDragStart?: (event: React.DragEvent, nodeType: string, subType: string) => void;
}

export function EnhancedWorkflowSidebar({ onDragStart }: EnhancedWorkflowSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['트리거', '메시지 발송'])
  );

  const handleDragStart = (event: React.DragEvent, node: NodeLibraryItem) => {
    if (onDragStart) {
      onDragStart(event, node.type, node.subType);
    } else {
      event.dataTransfer.setData('application/reactflow', node.type);
      event.dataTransfer.setData('application/type', node.subType);
      event.dataTransfer.effectAllowed = 'move';
    }
  };

  const filteredNodes = useMemo(() => {
    if (searchQuery) {
      return searchNodes(searchQuery);
    }
    return NODE_LIBRARY;
  }, [searchQuery]);

  const groupedNodes = useMemo(() => {
    const grouped: Record<string, NodeLibraryItem[]> = {};
    filteredNodes.forEach(node => {
      if (!grouped[node.category]) {
        grouped[node.category] = [];
      }
      grouped[node.category].push(node);
    });
    return grouped;
  }, [filteredNodes]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const categoryColors: Record<string, string> = {
    '트리거': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    '메시지 발송': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    '데이터 관리': 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    '케어': 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800',
    '마케팅': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    '흐름 제어': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  };

  return (
    <TooltipProvider>
      <div className="w-72 border-r bg-muted/5 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">노드 라이브러리</h2>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="노드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 h-9 text-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Search Results Count */}
          {searchQuery && (
            <div className="mt-2 text-xs text-muted-foreground">
              {filteredNodes.length}개 노드 발견
            </div>
          )}
        </div>

        {/* Node List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {Object.entries(groupedNodes).map(([category, nodes]) => {
            const isExpanded = expandedCategories.has(category);
            const categoryColor = categoryColors[category] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400';

            return (
              <Collapsible
                key={category}
                open={isExpanded}
                onOpenChange={() => toggleCategory(category)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5", categoryColor)}>
                        {category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">({nodes.length})</span>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="mt-2 space-y-2 pl-6">
                    {nodes.map((node) => {
                      const Icon = node.icon;
                      
                      return (
                        <Tooltip key={node.id}>
                          <TooltipTrigger asChild>
                            <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, node)}
                              className={cn(
                                "group relative bg-background border rounded-lg p-3 cursor-grab",
                                "hover:border-primary hover:shadow-md transition-all duration-200",
                                "active:cursor-grabbing"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "p-2 rounded-md flex-shrink-0",
                                  node.type === 'trigger' && "bg-blue-100 dark:bg-blue-900",
                                  node.type === 'action' && "bg-green-100 dark:bg-green-900",
                                  node.type === 'condition' && "bg-yellow-100 dark:bg-yellow-900",
                                  node.type === 'delay' && "bg-purple-100 dark:bg-purple-900",
                                  node.type === 'time_window' && "bg-orange-100 dark:bg-orange-900",
                                )}>
                                  <Icon className={cn("h-4 w-4", node.color)} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm mb-1">{node.label}</div>
                                  <div className="text-xs text-muted-foreground line-clamp-2">
                                    {node.description}
                                  </div>
                                  
                                  {/* Tags */}
                                  {node.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {node.tags.slice(0, 2).map((tag, idx) => (
                                        <span
                                          key={idx}
                                          className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                      {node.tags.length > 2 && (
                                        <span className="text-[10px] text-muted-foreground">
                                          +{node.tags.length - 2}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Info Icon */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </div>
                              </div>

                              {/* Drag Indicator */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                <div className="w-1 h-1 bg-muted-foreground rounded-full mt-1" />
                                <div className="w-1 h-1 bg-muted-foreground rounded-full mt-1" />
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <div className="space-y-1">
                              <div className="font-semibold">{node.label}</div>
                              <div className="text-xs">{node.description}</div>
                              <div className="text-xs text-muted-foreground mt-2">
                                태그: {node.tags.join(', ')}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}

          {/* Empty State */}
          {filteredNodes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">검색 결과가 없습니다</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="mt-2 text-xs"
              >
                검색 초기화
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-3 bg-muted/30">
          <div className="text-xs text-muted-foreground text-center">
            총 {NODE_LIBRARY.length}개 노드
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

