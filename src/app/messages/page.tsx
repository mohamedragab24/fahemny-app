"use client";

import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Send, Loader2, MessageSquare } from "lucide-react";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { Message, UserProfile } from "@/lib/types";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { doc } from "firebase/firestore";

// Hook to fetch and prepare conversation data
function useConversations() {
  const { user } = useUser();
  const firestore = useFirestore();

  // 1. Fetch all messages involving the current user
  const sentQuery = useMemoFirebase(
    () => user ? query(collection(firestore, "messages"), where("senderId", "==", user.uid)) : null,
    [firestore, user]
  );
  const receivedQuery = useMemoFirebase(
    () => user ? query(collection(firestore, "messages"), where("receiverId", "==", user.uid)) : null,
    [firestore, user]
  );

  const { data: sentMessages, isLoading: loadingSent } = useCollection<Message>(sentQuery);
  const { data: receivedMessages, isLoading: loadingReceived } = useCollection<Message>(receivedQuery);

  // 2. Combine and process messages
  const conversations = useMemo(() => {
    if (!user || !sentMessages || !receivedMessages) return [];
    
    const allMessages = [...sentMessages, ...receivedMessages];
    if (allMessages.length === 0) return [];

    const conversationsMap = new Map<string, Message>();

    allMessages.forEach((msg) => {
      const partnerId = msg.senderId === user.uid ? msg.receiverId : msg.senderId;
      const existingLastMessage = conversationsMap.get(partnerId);

      // Keep only the most recent message for each conversation partner
      if (!existingLastMessage || new Date(msg.timestamp) > new Date(existingLastMessage.timestamp)) {
        conversationsMap.set(partnerId, msg);
      }
    });

    // Sort conversations by the timestamp of the last message
    return Array.from(conversationsMap.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [user, sentMessages, receivedMessages]);

  return { 
    conversations, 
    isLoading: loadingSent || loadingReceived,
    allMessages: useMemo(() => (sentMessages && receivedMessages) ? [...sentMessages, ...receivedMessages] : [], [sentMessages, receivedMessages]),
  };
}


function ConversationListItem({ conversation, onSelect, isSelected }: { conversation: Message, onSelect: (partnerId: string) => void, isSelected: boolean }) {
    const { user } = useUser();
    const firestore = useFirestore();

    const partnerId = conversation.senderId === user?.uid ? conversation.receiverId : conversation.senderId;

    const partnerProfileRef = useMemoFirebase(
        () => partnerId ? doc(firestore, 'userProfiles', partnerId) : null,
        [firestore, partnerId]
    );
    const { data: partnerProfile, isLoading } = useDoc<UserProfile>(partnerProfileRef);

    if (isLoading || !partnerProfile) {
        return (
            <div className="flex items-center gap-3 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-grow space-y-2">
                    <Skeleton className="h-4 w-2/4" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            </div>
        )
    }

    return (
        <div
            onClick={() => onSelect(partnerId)}
            className={cn(
                "flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 border-b",
                isSelected && "bg-secondary"
            )}
        >
            <Avatar>
                <AvatarImage src={undefined} />
                <AvatarFallback>{partnerProfile.firstName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow overflow-hidden">
                <p className="font-semibold truncate">{partnerProfile.firstName} {partnerProfile.lastName}</p>
                <p className="text-sm text-muted-foreground truncate">{conversation.content}</p>
            </div>
            <div className="text-xs text-muted-foreground text-right shrink-0">
                <p>{new Date(conversation.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
            </div>
        </div>
    );
}

function ChatWindow({ partnerId, messages }: { partnerId: string | null, messages: Message[] }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    const partnerProfileRef = useMemoFirebase(
        () => partnerId ? doc(firestore, 'userProfiles', partnerId) : null,
        [firestore, partnerId]
    );
    const { data: partnerProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(partnerProfileRef);

    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    if (!partnerId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-2xl font-semibold font-headline">Select a conversation</p>
                <p className="text-muted-foreground">Choose a chat from the left to start messaging.</p>
            </div>
        )
    }
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !partnerId) return;

        setIsSending(true);

        const messageData = {
            senderId: user.uid,
            receiverId: partnerId,
            content: newMessage,
            timestamp: new Date().toISOString(),
        };

        const messagesCollection = collection(firestore, 'messages');
        addDocumentNonBlocking(messagesCollection, messageData);
        
        setNewMessage("");
        setIsSending(false);
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center gap-3 bg-secondary/50">
                {isProfileLoading ? <Skeleton className="h-10 w-10 rounded-full" /> : (
                    <Avatar>
                        <AvatarImage src={undefined} />
                        <AvatarFallback>{partnerProfile?.firstName.charAt(0)}</AvatarFallback>
                    </Avatar>
                )}
                 <div>
                    {isProfileLoading ? <Skeleton className="h-5 w-32" /> : <p className="font-semibold">{partnerProfile?.firstName} {partnerProfile?.lastName}</p>}
                </div>
            </div>
            <ScrollArea className="flex-grow bg-secondary/30">
                <div className="p-6 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground pt-10">No messages yet. Start the conversation!</div>
                ) : (
                    messages.map((msg) => (
                    <div key={msg.id} className={cn("flex gap-2", msg.senderId === user?.uid ? "justify-end" : "justify-start")}>
                        <div className={cn(
                            "max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg",
                            msg.senderId === user?.uid ? "bg-primary text-primary-foreground" : "bg-card"
                        )}>
                            <p>{msg.content}</p>
                            <p className={cn("text-xs mt-1 opacity-70", msg.senderId === user?.uid ? "text-right" : "text-left")}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    ))
                )}
                <div ref={messagesEndRef} />
                </div>
            </ScrollArea>
            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSendMessage} className="relative">
                    <Input 
                        placeholder="Type a message..." 
                        className="pr-12 h-12"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={isSending}
                    />
                    <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9" disabled={isSending || !newMessage.trim()}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    )
}


export default function MessagesPage() {
  const { user, isUserLoading } = useUser();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const { conversations: lastMessages, isLoading: areConversationsLoading, allMessages } = useConversations();

  const handleSelectConversation = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
  };
  
  const filteredMessages = useMemo(() => {
    if (!selectedPartnerId || !user) return [];
    return allMessages
        .filter(msg => 
            (msg.senderId === user.uid && msg.receiverId === selectedPartnerId) ||
            (msg.senderId === selectedPartnerId && msg.receiverId === user.uid)
        )
        .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [selectedPartnerId, user, allMessages]);
  
  if (isUserLoading) {
      return (
          <div className="container mx-auto h-[calc(100vh-theme(spacing.24))] py-6">
              <Skeleton className="h-full w-full" />
          </div>
      )
  }

  if (!user) {
      return (
       <div className="container mx-auto py-10 text-center">
         <h1 className="text-2xl font-bold">Please log in</h1>
         <p className="text-muted-foreground">You need to be logged in to view your messages.</p>
         <Button asChild className="mt-4"><Link href="/login">Log In</Link></Button>
       </div>
      )
  }


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
          <ScrollArea className="flex-grow">
            {areConversationsLoading ? (
                <div className="p-4 space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            ) : lastMessages.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No conversations.</div>
            ) : lastMessages.map((convo) => {
                const partnerId = convo.senderId === user.uid ? convo.receiverId : convo.senderId;
                return (
                    <ConversationListItem
                        key={partnerId}
                        conversation={convo}
                        onSelect={handleSelectConversation}
                        isSelected={selectedPartnerId === partnerId}
                    />
                )
            })}
          </ScrollArea>
        </div>
        <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full">
          <ChatWindow partnerId={selectedPartnerId} messages={filteredMessages} />
        </div>
      </Card>
    </div>
  );
}
