"use client";

import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Send, Search, MessageSquare, UserCircle, Loader2, Check, CheckCheck } from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar: string | null;
}

interface Conversation {
  user: User;
  latestMessage: {
    content: string;
    createdAt: string;
    isRead: boolean;
    senderModel: "User" | "Admin";
  };
  unreadCount: number;
}

interface Message {
  _id: string;
  senderModel: "User" | "Admin";
  content: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminInboxPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations (users who messaged)
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch(`/api/messages/conversations`);
        const data = await res.json();
        if (data.success) {
          setConversations(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      } finally {
        setIsLoadingConversations(false);
      }
    };
    fetchConversations();
  }, []);

  // Socket setup
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:5000";
    const newSocket = io(backendUrl);

    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join_admin");
    });

    newSocket.on("receive_message", (message: Message) => {
      setMessages((prev) => {
        // Only add to the active chat screen if it matches the currently selected user
        if (message.senderModel === "User") {
          // If the chat is currently open, dynamically mark as read
          // Note: Here we're inside the socket listener where state might be stale
          // In a real complete react implementation, we'd use a ref for selectedChat or check inside useEffect
          // But since state gets closure, we depend on selectedChat
        }
        return [...prev, message];
      });
    });

    newSocket.on("messages_read", (data: { chatId: string, readerRole: "User" | "Admin" }) => {
      if (data.readerRole === "User") {
        setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
      }
    });

    // When someone sends a message, update the conversation list / latest message dynamically
    newSocket.on("admin_receive_message", (message: any) => {
      // If it's for currently selected chat, receive_message handles it.
      // But we always need to update conversations list.
      setConversations((prev) => {
        const prevConvos = [...prev];
        const existingConvoIndex = prevConvos.findIndex(c => c.user._id === message.chatId);
        
        if (existingConvoIndex > -1) {
          // Update existing
          prevConvos[existingConvoIndex].latestMessage = message;
          if (selectedChat !== message.chatId) {
            prevConvos[existingConvoIndex].unreadCount += 1;
          }
        } else {
          // Ideally fetch new user details, for now we can just reload conversations or append minimal info
          fetchConversations();
        }
        
        // Sort
        return prevConvos.sort((a, b) => new Date(b.latestMessage.createdAt).getTime() - new Date(a.latestMessage.createdAt).getTime());
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [selectedChat]);

  // Make fetchConversations available to socket listener inside useEffect (hoisted)
  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/messages/conversations`);
      const data = await res.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (err) {}
  };


  // Load specific chat memory
  useEffect(() => {
    if (!selectedChat || !socket) return;
    
    setIsLoadingMessages(true);
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${selectedChat}`);
        const data = await res.json();
        if (data.success) {
          setMessages(data.data);
        }
        
        // Mark as read
        await fetch(`/api/messages/${selectedChat}/read`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ readerRole: "Admin" })
        }).then(() => {
          socket.emit("mark_read", { chatId: selectedChat, readerRole: "Admin" });
        });
        
        setConversations(prev => prev.map(c => c.user._id === selectedChat ? { ...c, unreadCount: 0 } : c));
      } catch (err) {
        console.error("Failed to fetch messages for user", err);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    
    fetchMessages();
    socket.emit("join_room", selectedChat);

  }, [selectedChat, socket]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedChat || !socket) return;
    
    const adminId = "admin"; // Use proper admin ID if available from auth state

    const newMsg = {
      chatId: selectedChat,
      senderId: adminId,
      senderModel: "Admin",
      content: inputValue,
    };

    socket.emit("send_message", newMsg);
    setInputValue("");
  };

  const selectedUser = conversations.find(c => c.user._id === selectedChat)?.user;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ height: "calc(100vh - 120px)" }}>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col h-full bg-gray-50/50">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Live Chats
            </h2>
            <div className="mt-4 relative">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto w-full">
            {isLoadingConversations ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <p>No active conversations</p>
              </div>
            ) : (
              conversations.map((convo) => (
                <div
                  key={convo.user._id}
                  onClick={() => setSelectedChat(convo.user._id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition flex items-start gap-3 ${
                    selectedChat === convo.user._id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                  }`}
                >
                  <div className="relative">
                    {convo.user.avatar ? (
                     <img src={convo.user.avatar} className="w-10 h-10 rounded-full" alt="avatar" />
                    ) : (
                     <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                       {convo.user.fullName?.charAt(0) || "U"}
                     </div>
                    )}
                    {convo.unreadCount > 0 && selectedChat !== convo.user._id && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-medium text-gray-900 truncate pr-2">{convo.user.fullName || convo.user.email}</h4>
                      <span className="text-xs text-gray-400 shrink-0">
                        {convo.latestMessage ? new Date(convo.latestMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${convo.unreadCount > 0 ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                      {convo.latestMessage?.senderModel === "Admin" ? "You: " : ""}
                      {convo.latestMessage?.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col h-full bg-white">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedUser?.fullName || "User"}</h3>
                  <p className="text-xs text-gray-500">{selectedUser?.email}</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30 flex flex-col space-y-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => {
                      const isAdminInfo = msg.senderModel === "Admin";
                      return (
                        <div key={msg._id} className={`flex ${isAdminInfo ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] min-w-[70px] rounded-2xl px-4 py-2 shadow-sm ${
                            isAdminInfo 
                              ? "bg-blue-600 text-white rounded-br-sm" 
                              : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                          }`}>
                            <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                            <div className={`flex justify-end items-center mt-1 text-[10px] ${isAdminInfo ? "text-blue-100" : "text-gray-400"}`}>
                              <span>{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              {isAdminInfo && (
                                <span className="ml-1">
                                  {msg.isRead ? <CheckCheck className="w-3 h-3 text-blue-200" /> : <Check className="w-3 h-3" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button 
                    type="submit" 
                    disabled={!inputValue.trim()}
                    className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 font-medium"
                  >
                    Send <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
              <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-600">Select a conversation</h3>
              <p className="text-sm">Choose a chat from the sidebar to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
