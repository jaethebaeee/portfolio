"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createClientClient } from "@/lib/supabase";
import { Conversation, Message, Patient } from "@/lib/database.types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send, Phone, User, MoreVertical, Archive, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ConversationWithPatient = Conversation & {
  patient: Patient;
  messages: Message[];
};

export default function InboxPage() {
  const { userId, isLoaded } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithPatient[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithPatient | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const supabase = createClientClient();

  useEffect(() => {
    if (isLoaded && userId) {
      fetchConversations();
      
      // Realtime subscription for new messages
      const channel = supabase
        .channel('inbox-updates')
        .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'messages',
            filter: `user_id=eq.${userId}`
        }, (payload) => {
            console.log('Realtime update:', payload);
            fetchConversations(); // Refresh list to update unread/last message
            if (selectedConversation && payload.new && (payload.new as Message).conversation_id === selectedConversation.id) {
                setMessages(prev => [...prev, payload.new as Message]);
            }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isLoaded, userId, selectedConversation]);

  const fetchConversations = async () => {
    if (!userId) return;
    
    // Fetch conversations with patient details
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        patient:patients(*)
      `)
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('대화 목록을 불러오는데 실패했습니다.');
      setLoading(false);
      return;
    }

    setConversations(data as any);
    setLoading(false);
  };

  const selectConversation = async (conv: ConversationWithPatient) => {
    setSelectedConversation(conv);
    // Fetch messages for this conversation
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('메시지를 불러오는데 실패했습니다.');
      return;
    }
    
    setMessages(data as Message[]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !userId) return;

    const optimisticMessage: Message = {
        id: 'temp-' + Date.now(),
        conversation_id: selectedConversation.id,
        user_id: userId,
        direction: 'outbound',
        channel: 'kakao',
        content: newMessage,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage("");

    try {
        // Call API to send message (and insert into DB)
        const response = await fetch('/api/inbox/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversationId: selectedConversation.id,
                content: newMessage, // Use original content
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to send message');
        }

        // Replace optimistic message with actual result
        // Or just let Realtime/Fetch handle it. 
        // For smoother UX, we can update the ID of the temp message.
        setMessages(prev => prev.map(m => 
            m.id === optimisticMessage.id ? result.message : m
        ));

    } catch (e: any) {
        console.error(e);
        toast.error(`전송 실패: ${e.message}`);
        // Mark optimistic message as failed
        setMessages(prev => prev.map(m => 
            m.id === optimisticMessage.id ? { ...m, status: 'failed' } : m
        ));
    }
  };

  if (!isLoaded || loading) return <div className="p-8">로딩 중...</div>;

  return (
    <div className="flex h-[calc(100vh-100px)] border rounded-lg overflow-hidden bg-background shadow-sm">
      {/* Sidebar: Conversation List */}
      <div className="w-80 border-r flex flex-col bg-muted/10">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">메시지함</h2>
            <Button size="icon" variant="ghost"><MoreVertical className="h-4 w-4" /></Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="이름 또는 전화번호 검색" className="pl-8" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={cn(
                  "flex items-start gap-3 p-4 text-left hover:bg-muted transition-colors border-b last:border-0",
                  selectedConversation?.id === conv.id && "bg-muted"
                )}
              >
                <Avatar>
                    <AvatarFallback>{conv.patient?.name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium truncate">{conv.patient?.name || "알 수 없음"}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {conv.last_message_at && formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true, locale: ko })}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground truncate flex items-center gap-1">
                     {/* Show last message preview if available */}
                     <span className="truncate">대화 내용 보기</span>
                  </div>
                </div>
              </button>
            ))}
            {conversations.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                    대화가 없습니다.
                </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Area: Chat Window */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-card">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{selectedConversation.patient?.name?.[0] || "?"}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{selectedConversation.patient?.name}</h3>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="flex items-center"><Phone className="h-3 w-3 mr-1" /> {selectedConversation.patient?.phone}</span>
                    <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> 마지막 활동: {selectedConversation.last_message_at ? new Date(selectedConversation.last_message_at).toLocaleTimeString() : '-'}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon"><Archive className="h-5 w-5" /></Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 bg-muted/5">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex w-full",
                    msg.direction === 'outbound' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm",
                      msg.direction === 'outbound' 
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-white dark:bg-zinc-800 border rounded-tl-none"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <div className={cn(
                        "text-[10px] mt-1 text-right opacity-70",
                        msg.direction === 'outbound' ? "text-blue-100" : "text-muted-foreground"
                    )}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {msg.status === 'failed' && <span className="text-red-300 ml-1">전송 실패</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t bg-card">
            <div className="flex gap-2">
              <Input 
                placeholder="메시지 입력..." 
                className="flex-1"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                    }
                }}
              />
              <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex justify-between px-1">
                <span>Enter로 전송, Shift+Enter로 줄바꿈</span>
                <span>카카오톡으로 전송됩니다 (실패 시 SMS)</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-lg font-medium">대화를 선택하세요</p>
            <p className="text-sm">왼쪽 목록에서 환자를 선택하여 대화를 시작하세요.</p>
        </div>
      )}
    </div>
  );
}

import { MessageCircle } from "lucide-react";

