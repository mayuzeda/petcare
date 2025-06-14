import { useNavigate } from "react-router-dom";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PetLayout from "@/components/PetLayout";
import BackButton from "@/components/BackButton";
import { usePet } from "@/contexts/PetContext";

const Emergency = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedPet } = usePet();

  const handleEmergencyCall = () => {
    toast({
      title: "Chamada de Emergência Iniciada",
      description: `Ajuda está a caminho para ${selectedPet.name}. Mantenha a calma.`,
      variant: "destructive",
    });
  };

  return (
    <PetLayout>
      <div className="app-container">
        <header className="flex items-center py-4">
          
          <h2 className="font-semibold text-lg ml-2">Emergência</h2>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 mt-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Ajuda de Emergência para {selectedPet.name}</h1>
            <p className="text-gray-600 mt-2">Pressione o botão abaixo para solicitar assistência imediata</p>
          </div>
          
          <div className="w-32 h-32 rounded-full bg-destructive flex items-center justify-center cursor-pointer animate-pulse" onClick={handleEmergencyCall}>
            <Phone className="h-14 w-14 text-white" />
          </div>
          
          <div className="text-center text-gray-600">
            <p>Sua localização atual será compartilhada</p>
            <p>com os serviços de emergência</p>
          </div>
          
          <Button 
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="mt-8"
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </PetLayout>
  );
};

export default Emergency;
