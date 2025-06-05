import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import IconGrid from "@/components/IconGrid";
import PetAvatars from "@/components/PetAvatars";
import { usePet } from "@/contexts/PetContext";
import UpcomingEventsWidget from "@/components/UpcomingEventsWidget";
import ChatIcon from "@/components/ChatIcon";

const Dashboard = () => {
  const navigate = useNavigate();
  const { selectedPet } = usePet();

  return (
    <div className="min-h-screen flex flex-col"> 
      <PetAvatars />
      <main className="flex-1 container mx-auto px-4 py-4">
        <div className="mb-2">
          <h1 className="text-2xl font-bold">Olá, esse é perfil de {selectedPet.name}</h1>
          <p className="text-gray-600">O que você gostaria de acessar?</p>
        </div>
        
        <section className="flex-1 mb-6">
          <IconGrid />
        </section>
          <section className="mb-20">
          <UpcomingEventsWidget />
        </section>
        
        {/* Botão de chat flutuante */}
        <div className="fixed bottom-6 right-6">
          <ChatIcon className="h-14 w-14" />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
