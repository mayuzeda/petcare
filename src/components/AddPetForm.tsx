import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Camera } from "lucide-react";
import { usePet } from "@/contexts/PetContext";
import { Pet, PetInfo } from "@/data/pets";

interface AddPetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPet: (pet: Pet) => void;
}

const AddPetForm: React.FC<AddPetFormProps> = ({
  open,
  onOpenChange,
  onAddPet,
}) => {
  const [petImage, setPetImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [petInfo, setPetInfo] = useState<PetInfo>({
    tipo: "",
    peso: "",
    idade: "",
    raca: "",
    coleira: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPetImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPetImage(null);
  };

  const handleInfoChange = (key: keyof PetInfo, value: string) => {
    setPetInfo((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !petInfo.tipo || !petImage) {
      alert("Por favor, preencha todos os campos obrigatórios: Nome, Tipo e Foto");
      return;
    }
    
    const newPet: Pet = {
      id: Date.now(), // Gera um ID único baseado no timestamp
      name,
      image: petImage,
      info: petInfo,
    };
    
    onAddPet(newPet);
    onOpenChange(false);
    
    // Reset form
    setPetImage(null);
    setName("");
    setPetInfo({
      tipo: "",
      peso: "",
      idade: "",
      raca: "",
      coleira: "",
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl">Adicionar Novo Pet</DialogTitle>
          <DialogDescription>
            Preencha as informações do seu novo pet.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                {petImage ? (
                  <div className="relative">
                    <img 
                      src={petImage} 
                      alt="Pet preview" 
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex flex-col items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Adicionar foto</span>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  id="pet-image"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </div>
              <Label htmlFor="pet-image" className="mt-2 text-sm text-gray-500">
                Clique para fazer upload
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pet-name">Nome do Pet <span className="text-red-500">*</span></Label>
              <Input
                id="pet-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome do pet"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pet-type">Tipo <span className="text-red-500">*</span></Label>
              <Select 
                value={petInfo.tipo} 
                onValueChange={(value) => handleInfoChange("tipo", value)}
              >
                <SelectTrigger id="pet-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cachorro">Cachorro</SelectItem>
                  <SelectItem value="Gato">Gato</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pet-weight">Peso</Label>
              <Input
                id="pet-weight"
                value={petInfo.peso}
                onChange={(e) => handleInfoChange("peso", e.target.value)}
                placeholder="Ex: 15kg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pet-age">Idade</Label>
              <Input
                id="pet-age"
                value={petInfo.idade}
                onChange={(e) => handleInfoChange("idade", e.target.value)}
                placeholder="Ex: 5 anos"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pet-breed">Raça</Label>
              <Input
                id="pet-breed"
                value={petInfo.raca}
                onChange={(e) => handleInfoChange("raca", e.target.value)}
                placeholder="Ex: SRD"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pet-collar">Coleira</Label>
              <Input
                id="pet-collar"
                value={petInfo.coleira}
                onChange={(e) => handleInfoChange("coleira", e.target.value)}
                placeholder="Ex: 123456"
              />
            </div>
          </div>          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Salvar Pet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPetForm;
