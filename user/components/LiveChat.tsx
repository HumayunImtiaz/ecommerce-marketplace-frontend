"use client";

import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, X, MessageSquare, Loader2, Check, CheckCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

interface Message {
  _id: string;
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
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
        const res = await fetch(`${backendUrl}/api/auth/messages/${user.id}`);
        const data = await res.json();
        if (data.success) {
          setMessages(data.data);
        }

        // Mark as read
        await fetch(`${backendUrl}/api/auth/messages/${user.id}/read`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ readerRole: "User" })
        });
      } catch (err) {
        console.error("Failed to load chat history", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();

    // Connect socket
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";
    const newSocket = io(backendUrl);

    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join_room", user.id);
    });

    newSocket.on("receive_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);

      // If the chat is open, immediately mark incoming messages as read
      if (message.senderModel === "Admin") {
        fetch(`${backendUrl}/api/auth/messages/${user.id}/read`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ readerRole: "User" })
        }).then(() => {
          newSocket.emit("mark_read", { chatId: user.id, readerRole: "User" });
        });
      }
    });

    newSocket.on("messages_read", (data: { chatId: string, readerRole: "User" | "Admin" }) => {
      if (data.readerRole === "Admin") {
        setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user || !socket) return;

    const newMsg = {
      chatId: user.id,
      senderId: user.id,
      senderModel: "User",
      content: inputValue,
    };

    socket.emit("send_message", newMsg);
    setInputValue("");
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-blue-600 p-4 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-semibold">Live Support</h3>
        </div>
        <button onClick={onClose} className="text-white hover:text-blue-200 transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-h-0 p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-3">
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-2">
            <MessageSquare className="w-12 h-12 opacity-20" />
            <p className="text-sm">No messages yet. Say hi!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderModel === "User";
            return (
              <div
                key={msg._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] min-w-[70px] rounded-2xl px-4 py-2 text-sm ${isMe
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                    }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <div className={`flex justify-end items-center mt-1 text-[10px] ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && (
                      <span className="ml-1">
                        {msg.isRead ? <CheckCheck className="w-3 h-3 text-blue-200" /> : <Check className="w-3 h-3" />}
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

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-100 shrink-0">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2 bg-gray-50 p-1 rounded-full border border-gray-200"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="p-2 rounded-full bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
