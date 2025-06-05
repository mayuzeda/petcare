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
import BackButton from "@/components/BackButton";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot" | "agent";
  timestamp: Date;
}

const predefinedResponses = [  {
    triggers: ["olá", "ola", "oi", "hello", "hi"],
    response: "Olá! Como posso te ajudar hoje?"
  },
  {
    triggers: ["emergência", "emergencia", "urgente", "socorro", "ajuda", "emergency"],
    response: "Para situações de emergência, recomendo que você entre em contato imediatamente com o veterinário mais próximo. Deseja que eu te conecte com um atendente para mais orientações?"
  },
  {
    triggers: ["vacina", "vacinação", "imunização"],
    response: "As vacinas são essenciais para a saúde do seu pet. Gostaria de informações sobre quais vacinas são necessárias ou de agendar uma vacinação com um de nossos veterinários?"
  },
  {
    triggers: ["consulta", "agendar", "marcar", "veterinário", "veterinaria"],
    response: "Para agendar uma consulta veterinária, posso verificar os horários disponíveis. Você prefere ser atendido por um atendente para marcar sua consulta agora?"
  }
];

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

    // Simula o tempo de resposta do bot
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage.toLowerCase());
      
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        text: botResponse,
        sender: "bot",
        timestamp: new Date()
      }]);
      
      setIsTyping(false);

      // Verifica se deve mostrar a mensagem de conexão com o atendente
      if (
        inputMessage.toLowerCase().includes("atendente") ||
        inputMessage.toLowerCase().includes("falar com") ||
        inputMessage.toLowerCase().includes("pessoa") ||
        inputMessage.toLowerCase().includes("humano")
      ) {
        setTimeout(() => {
          setShowAgentMessage(true);
          setMessages(prev => [...prev, {
            id: `msg-${Date.now()}`,
            text: "Você foi conectado a um atendente PetCare. Em breve, alguém entrará em contato com você.",
            sender: "agent",
            timestamp: new Date()
          }]);
        }, 1000);
      }
    }, 1000);
  };

  const getBotResponse = (userMessage: string): string => {
    // Verifica as respostas predefinidas
    for (const item of predefinedResponses) {
      if (item.triggers.some(trigger => userMessage.includes(trigger))) {
        return item.response;
      }
    }

    // Respostas padrão quando nenhum trigger é encontrado
    const defaultResponses = [
      "Entendi sua mensagem. Posso te conectar com um atendente PetCare para melhor atendimento. Gostaria disso?",
      "Para melhor atendimento às suas necessidades, posso conectá-lo com um de nossos atendentes especializados. Deseja falar com um atendente agora?",
      "Não tenho todas as informações sobre isso. Gostaria de conversar com um de nossos atendentes PetCare para obter ajuda mais específica?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <header className="flex items-center justify-between p-3 bg-white shadow-sm">
        <div className="flex items-center">
          <BackButton />
          <h1 className="text-lg font-bold ml-2">Chat PetCare</h1>
        </div>
        <div className="bg-green-100 px-2 py-1 rounded-full flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          <span className="text-xs text-green-700">Online</span>
        </div>      </header>

      {/* Pequeno banner de boas-vindas */}
      <div className="w-full bg-white shadow-sm py-2 border-t border-gray-100">
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-center">
            <span className="text-sm text-gray-600">
              Atendimento disponível para todos os usuários cadastrados
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-gray-50 overflow-y-auto p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="flex flex-col space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    message.sender === "user"
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
                    className={`text-xs mt-1 ${
                      message.sender === "user" ? "text-blue-100" : "text-gray-500"
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
      <div className="bg-white border-t border-gray-200 p-3 fixed bottom-0 left-0 right-0">
        <div className="container mx-auto max-w-2xl">
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
          
          {!showAgentMessage && (
            <div className="mt-2 text-center text-xs text-gray-500">
              <span>Precisa de ajuda de um atendente?</span>
              <Button
                variant="link"
                className="text-xs p-0 h-auto ml-1"
                onClick={() => {
                  setMessages(prev => [...prev, {
                    id: `msg-${Date.now()}`,
                    text: "Gostaria de falar com um atendente por favor.",
                    sender: "user",
                    timestamp: new Date()
                  }]);
                  
                  setTimeout(() => {
                    setMessages(prev => [...prev, {
                      id: `msg-${Date.now()}`,
                      text: "Claro! Vou conectar você com um de nossos atendentes especializados.",
                      sender: "bot",
                      timestamp: new Date()
                    }]);
                    
                    setTimeout(() => {
                      setShowAgentMessage(true);
                      setMessages(prev => [...prev, {
                        id: `msg-${Date.now()}`,
                        text: "Você foi conectado a um atendente PetCare. Em breve, alguém entrará em contato com você.",
                        sender: "agent",
                        timestamp: new Date()
                      }]);
                    }, 1000);
                  }, 1000);
                }}
              >
                Falar com atendente <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
