import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Pet, pets as initialPets } from '@/data/pets';

type PetContextType = {
  pets: Pet[];
  selectedPet: Pet;
  setSelectedPet: (pet: Pet) => void;
  addPet: (pet: Pet) => void;
};

const PetContext = createContext<PetContextType | undefined>(undefined);

// Função auxiliar para carregar pets do localStorage
const loadPetsFromStorage = (): Pet[] => {
  try {
    const savedPets = localStorage.getItem('petcare-pets');
    if (savedPets) {
      return JSON.parse(savedPets);
    }
  } catch (error) {
    console.error('Erro ao carregar pets salvos:', error);
  }
  return initialPets;
};

export const PetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pets, setPets] = useState<Pet[]>(() => loadPetsFromStorage());
  const [selectedPet, setSelectedPet] = useState<Pet>(() => {
    const loadedPets = loadPetsFromStorage();
    return loadedPets[0]; // Default to first pet
  });
  const addPet = (newPet: Pet) => {
    setPets((currentPets) => [...currentPets, newPet]);
    setSelectedPet(newPet); // Automaticamente seleciona o novo pet
  };
  
  // Salva os pets no localStorage sempre que mudam
  useEffect(() => {
    localStorage.setItem('petcare-pets', JSON.stringify(pets));
  }, [pets]);

  return (
    <PetContext.Provider value={{ pets, selectedPet, setSelectedPet, addPet }}>
      {children}
    </PetContext.Provider>
  );
};

export const usePet = (): PetContextType => {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error('usePet must be used within a PetProvider');
  }
  return context;
};
