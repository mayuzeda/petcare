import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Send,
  ArrowRight,
  User,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PetLayout from "./PetLayout";

// Removed: predefinedResponses array is no longer needed.

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot" | "agent";
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Como posso te ajudar hoje?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showAgentMessage, setShowAgentMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Lógica para obter ou criar um ID de chat para o n8n
    const chatId = sessionStorage.getItem("chatId") || "chat_" + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("chatId", chatId);

    // Chama o webhook do n8n
    fetch('http://localhost:5678/webhook/6cdef828-159a-412d-ae25-33c7df6024e5/chat', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chatId: chatId,
            message: userMessage.text,
            route: "general"
        })
    })
    .then(res => res.json())
    .then(data => {
      // Simula um atraso para dar tempo de exibir o "digitando"
      setTimeout(() => {
        setIsTyping(false);
        const botResponseText = data.output || "Desculpe, não entendi.";
        const botMessage: Message = {
          id: `msg-${Date.now()}`,
          text: botResponseText,
          sender: "bot",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1000);
    })
    .catch(err => {
      setIsTyping(false);
      console.error("Erro ao comunicar com o agente:", err);
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        text: "Desculpe, houve um erro ao processar sua mensagem. Por favor, tente novamente.",
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    });
  };

  // Removed: getBotResponse function is no longer needed.

  return (
    <PetLayout title="Chat PetCare" showBottomNavigation={false}>
      <div className="flex flex-col h-full w-full items-center align-start">
        <div className="bg-green-100 px-2 py-1 rounded-full flex items-center justify-center mb-4 w-80">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          <span className="text-xs text-green-700">Online - Atendimento disponível</span>
        </div>        
        {/* Chat Area */}
        <div className="flex-1 bg-gray-50 overflow-y-auto p-4 pb-32 w-full">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${message.sender === "user"
                      ? "bg-primary text-white rounded-tr-none"
                      : message.sender === "agent"
                        ? "bg-green-100 text-green-800 rounded-tl-none border border-green-200"
                        : "bg-white text-gray-800 rounded-tl-none shadow-sm"
                      }`}
                  >
                    {message.sender === "agent" && (
                      <div className="flex items-center mb-1 text-green-700">
                        <User className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">Atendente PetCare</span>
                        <CheckCircle className="h-3 w-3 ml-1" />
                      </div>
                    )}
                    <p className="text-sm">{message.text}</p>
                    <div
                      className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 rounded-2xl rounded-tl-none shadow-sm p-3 max-w-[80%]">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>        
        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-3 fixed bottom-0 left-0 right-0 z-50">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Digite sua mensagem..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
                className="flex-1 rounded-full"
              />
              <Button
                onClick={handleSendMessage}
                className="rounded-full"
                disabled={inputMessage.trim() === ""}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PetLayout>
  );
};

export default ChatPage;
