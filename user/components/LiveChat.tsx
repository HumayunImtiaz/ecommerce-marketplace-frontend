"use client";

import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, X, MessageSquare, Loader2, Check, CheckCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

interface Message {
  id: string;
  _id?: string;
  senderModel: "User" | "Admin";
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface LiveChatProps {
  onClose: () => void;
}

export default function LiveChat({ onClose }: LiveChatProps) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => scrollToBottom(), 200);
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
        const res = await fetch(`${backendUrl}/api/messages/${user.id}`);
        const data = await res.json();
        if (data.success) setMessages(data.data);

        await fetch(`${backendUrl}/api/messages/${user.id}/read`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ readerRole: "User" })
        });
      } catch (err) { console.error("Failed to load chat history", err); }
      finally { setIsLoading(false); }
    };

    fetchHistory();

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
    const backendUrl = baseUrl.replace(/\/api$/, "");
    const newSocket = io(backendUrl);
    setSocket(newSocket);

    newSocket.on("connect", () => { newSocket.emit("join_room", user.id); });
    newSocket.on("receive_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
      if (message.senderModel === "Admin") {
        fetch(`${backendUrl}/api/messages/${user.id}/read`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ readerRole: "User" })
        }).then(() => { newSocket.emit("mark_read", { chatId: user.id, readerRole: "User" }); });
      }
    });
    newSocket.on("messages_read", (data: { chatId: string, readerRole: "User" | "Admin" }) => {
      if (data.readerRole === "Admin") setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
    });

    return () => { newSocket.disconnect(); };
  }, [user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user || !socket) return;
    const newMsg = { chatId: user.id, senderId: user.id, senderModel: "User", content: inputValue };
    socket.emit("send_message", newMsg);
    setInputValue("");
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-10 right-10 w-[450px] max-w-[calc(100vw-5rem)] h-[650px] max-h-[calc(100vh-10rem)] bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] z-[100] overflow-hidden border border-[#eb9a05]/10 grid grid-rows-[auto_1fr_auto] animate-fade-in-up">
      {/* Header */}
      <div className="bg-[#002147] p-8 flex justify-between items-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#eb9a05]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#eb9a05]/20 flex items-center justify-center text-[#eb9a05]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-playfair font-black tracking-tight">Private Concierge</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#eb9a05]">Available Now</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all transform hover:rotate-90">
          <X className="w-6 h-6 text-[#eb9a05]" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="min-h-0 p-8 overflow-y-auto bg-[#f8f9fa] custom-scrollbar">
        <div className="flex flex-col space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#eb9a05] mb-4" />
              <p className="text-[10px] font-black tracking-widest uppercase opacity-40">Connecting Securely...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 space-y-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
                <MessageSquare className="w-10 h-10 text-gray-100" />
              </div>
              <div>
                <h4 className="text-xl font-playfair font-black text-[#002147] mb-2">Greetings, {user.name}</h4>
                <p className="text-gray-400 text-xs font-medium italic">Our dedicated concierges are ready to assist with your inquiries.</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderModel === "User";
              return (
                <div key={msg.id || msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in-up`}>
                  <div className={`max-w-[85%] min-w-[100px] rounded-[1.5rem] px-6 py-4 shadow-sm transition-all hover:shadow-md ${isMe ? "bg-[#002147] text-white rounded-br-none" : "bg-white border border-gray-100 text-[#002147] rounded-bl-none"}`}>
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <div className={`flex justify-end items-center mt-3 gap-2 ${isMe ? "text-white/40" : "text-gray-300"}`}>
                      <span className="text-[8px] font-bold uppercase tracking-widest">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && (
                        <span className="transition-all">
                          {msg.isRead ? <CheckCheck className="w-3.5 h-3.5 text-[#eb9a05]" /> : <Check className="w-3.5 h-3.5" />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-8 bg-white border-t border-gray-50">
        <form onSubmit={handleSendMessage} className="relative group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Express your inquiry..."
            className="w-full bg-[#f8f9fa] border-2 border-gray-50 rounded-[1.5rem] pl-8 pr-16 py-5 focus:outline-none focus:border-[#eb9a05] focus:bg-white focus:shadow-2xl transition-all font-bold text-sm text-[#002147] placeholder:text-gray-300"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-[#002147] text-[#eb9a05] disabled:opacity-10 hover:bg-[#002b5c] transition-all transform hover:scale-110 active:scale-95 shadow-xl"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
