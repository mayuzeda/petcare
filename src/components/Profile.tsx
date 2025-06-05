import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Check, Pencil, Weight, IdCard, Calendar, PawPrint, Dog, Cat } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PetInfo } from "@/data/pets"
import { usePet } from "@/contexts/PetContext"
import PetLayout from "./PetLayout"
import BackButton from "./BackButton"

export default function Profile() {
  const { selectedPet } = usePet();
  
  const [editing, setEditing] = useState<string | null>(null)
  const [petInfo, setPetInfo] = useState<PetInfo>(selectedPet.info)

  // Update petInfo when selectedPet changes
  useEffect(() => {
    setPetInfo(selectedPet.info)
  }, [selectedPet])

  const handleEdit = (field: string) => {
    setEditing(field)
  }

  const handleSave = () => {
    setEditing(null)
  }

  const handleChange = (field: keyof PetInfo, value: string) => {
    setPetInfo((prev) => ({ ...prev, [field]: value }))
  }

  const getFieldIcon = (field: keyof PetInfo) => {
    const icons = {
      tipo: petInfo.tipo.toLowerCase() === "gato" ? <Cat className="h-5 w-5" /> : <Dog className="h-5 w-5" />,
      peso: <Weight className="h-5 w-5" />,
      idade: <Calendar className="h-5 w-5" />,
      raca: <PawPrint className="h-5 w-5" />,
      coleira: <IdCard className="h-5 w-5" />,
    }
    return icons[field]
  }

  const renderField = (label: string, field: keyof PetInfo) => {
    return (
      <div className="flex items-center justify-between border-b border-blue-800 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-300 text-blue-300">
            {getFieldIcon(field)}
          </div>
          <div>
            <Label className="text-white/70">{label}</Label>
            {editing === field ? (
              <Input
                value={petInfo[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                className="mt-1 h-8 bg-blue-900 text-white"
              />
            ) : (
              <p className="text-white">{petInfo[field]}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {editing === field ? (
            <Button variant="ghost" size="icon" onClick={handleSave} className="h-8 w-8 text-white">
              <Check className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => handleEdit(field)} className="h-8 w-8 text-white">
              <Pencil className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <PetLayout>
      <div className="mb-4 flex items-center">
        <BackButton />
      </div>
      
      <div className="container mx-auto p-4">
        <Card className="w-full max-w-md mx-auto overflow-hidden rounded-3xl bg-blue-900 text-white shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center space-x-4">
              <img
                src={selectedPet.image}
                alt={selectedPet.name}
                className="h-16 w-16 rounded-full object-cover"
              />
              <h2 className="text-2xl font-bold">{selectedPet.name}</h2>
            </div>
          </CardHeader>
          <CardContent>
            {renderField("Tipo", "tipo")}
            {renderField("Peso", "peso")}
            {renderField("Idade", "idade")}
            {renderField("Raça", "raca")}
            {renderField("Coleira", "coleira")}
          </CardContent>
        </Card>
      </div>
    </PetLayout>
  )
}
