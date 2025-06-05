import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePet } from "@/contexts/PetContext";
import AddPetForm from "./AddPetForm";

interface PetAvatarsProps {
  showAddButton?: boolean;
}

export default function PetAvatars({ showAddButton = true }: PetAvatarsProps) {
  const { pets, selectedPet, setSelectedPet, addPet } = usePet();
  const [addPetModalOpen, setAddPetModalOpen] = useState(false);

  return (
    <div className="w-full bg-white shadow-sm py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="flex space-x-6 overflow-x-none py-2 px-4">            {pets.map((pet) => (
              <div key={pet.id} className="flex flex-col items-center">
                <button 
                  className={`w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 hover:bg-gray-300 transition-colors ${
                    selectedPet.id === pet.id 
                      ? "ring-4 ring-primary ring-offset-2" 
                      : ""
                  }`}
                  onClick={() => setSelectedPet(pet)}
                >
                  <img
                    src={pet.image}
                    alt={`${pet.name} Avatar`}
                    className="w-full h-full rounded-full object-cover"
                  />
                </button>
                <span className="mt-2 text-sm font-medium text-gray-700">{pet.name}</span>
              </div>
            ))}
            {showAddButton && (
              <div className="flex flex-col items-center">
                <button 
                  className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 hover:border-primary transition-colors"
                  onClick={() => setAddPetModalOpen(true)}
                >
                  <Plus className="w-8 h-8 text-gray-400" />
                </button>
                <span className="mt-2 text-sm font-medium text-gray-700">Adicionar</span>
              </div>
            )}            
            {showAddButton && (
              <AddPetForm 
                open={addPetModalOpen}
                onOpenChange={setAddPetModalOpen}
                onAddPet={addPet}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}