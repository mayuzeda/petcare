import { useEffect } from 'react';
import { usePet } from '@/contexts/PetContext';
import { Pet } from '@/data/pets';

// Componente para persistir dados dos pets no localStorage
const PetPersistence = () => {
  const { pets } = usePet();
  
  // Salva os pets no localStorage sempre que mudam
  useEffect(() => {
    localStorage.setItem('petcare-pets', JSON.stringify(pets));
  }, [pets]);
  
  return null; // Componente não renderiza nada
};

export default PetPersistence;

// Função para carregar pets do localStorage
export const loadSavedPets = (): Pet[] | null => {
  try {
    const savedPets = localStorage.getItem('petcare-pets');
    if (savedPets) {
      return JSON.parse(savedPets);
    }
    return null;
  } catch (error) {
    console.error('Erro ao carregar pets salvos:', error);
    return null;
  }
};
