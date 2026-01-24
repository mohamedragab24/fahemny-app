"use client"

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { conversations, messages as initialMessages, Conversation } from "@/lib/data";
import { Search, Send } from "lucide-react";

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);

  return (
    <div className="container mx-auto h-[calc(100vh-theme(spacing.24))] py-6">
      <Card className="h-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-1 lg:col-span-1 border-r flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold font-headline">Messages</h1>
            <div className="relative mt-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-8" />
            </div>
          </div>
          <div className="flex-grow overflow-auto">
            {conversations.map((convo) => (
              <div
                key={convo.id}
                onClick={() => setSelectedConversation(convo)}
                className={cn(
                  "flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 border-b",
                  selectedConversation?.id === convo.id && "bg-secondary"
                )}
              >
                <Avatar>
                  <AvatarImage src={convo.avatar} />
                  <AvatarFallback>{convo.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow overflow-hidden">
                  <p className="font-semibold truncate">{convo.userName}</p>
                  <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                </div>
                <div className="text-xs text-muted-foreground text-right shrink-0">
                  <p>{convo.lastMessageTime}</p>
                  {convo.unreadCount > 0 && (
                    <span className="mt-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">
                      {convo.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedConversation.avatar} />
                  <AvatarFallback>{selectedConversation.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedConversation.userName}</p>
                  <p className="text-sm text-green-500">Online</p>
                </div>
              </div>
              <div className="flex-grow overflow-auto p-6 space-y-4 bg-secondary/30">
                {initialMessages.map((msg) => (
                  <div key={msg.id} className={cn("flex items-end gap-2", msg.isSender ? "justify-end" : "justify-start")}>
                     {!msg.isSender && <Avatar className="h-8 w-8"><AvatarImage src={selectedConversation.avatar} /><AvatarFallback>{selectedConversation.userName.charAt(0)}</AvatarFallback></Avatar>}
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2 max-w-sm",
                        msg.isSender
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border"
                      )}
                    >
                      <p>{msg.text}</p>
                      <p className={cn("text-xs mt-1", msg.isSender ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
                        {msg.timestamp}
                      </p>
                    </div>
                     {msg.isSender && <Avatar className="h-8 w-8"><AvatarImage /><AvatarFallback>ME</AvatarFallback></Avatar>}
                  </div>
                ))}
              </div>
              <div className="p-4 border-t bg-background">
                <div className="relative">
                  <Input placeholder="Type a message..." className="pr-12 h-12" />
                  <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-2xl font-semibold font-headline">Select a conversation</p>
              <p className="text-muted-foreground">Choose a chat from the left to start messaging.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
