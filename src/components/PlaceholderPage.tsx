import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PetAvatars from "@/components/PetAvatars";
import { usePet } from "@/contexts/PetContext";

const PlaceholderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPet } = usePet();
  const pageName = location.pathname.substring(1);

  return (
    <div className="min-h-screen flex flex-col">
      <PetAvatars />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <h2 className="text-2xl font-bold mb-6 capitalize">{pageName}</h2>
        
        <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center justify-center">
          <img 
            src={selectedPet.image} 
            alt={selectedPet.name} 
            className="w-32 h-32 rounded-full object-cover mb-4"
          />
          <h2 className="text-xl font-semibold mb-2">{selectedPet.name}</h2>
          <p className="text-gray-600 mb-8">Esta página está em desenvolvimento.</p>
          <p className="text-gray-500">
            Página: <span className="font-semibold">{pageName}</span> para {selectedPet.name}
          </p>
          
          <div className="mt-8">
            <Button onClick={() => navigate("/dashboard")}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlaceholderPage;
