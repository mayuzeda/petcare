export interface PetInfo {
  tipo: string
  peso: string
  idade: string
  raca: string
  coleira: string
}

export interface Pet {
  id: number
  name: string
  image: string
  info: PetInfo
}

export const pets: Pet[] = [
  {
    id: 1,
    name: "Bella",
    image: "/bela.png",
    info: {
      tipo: "Cachorro",
      peso: "15kg",
      idade: "5 anos",
      raca: "SRD",
      coleira: "52386"
      
    }
  },
  {
    id: 2,
    name: "Dom",
    image: "/dom.jpeg",
    info: {
      tipo: "Gato",
      peso: "8kg",
      idade: "7 anos",
      raca: "SRD",
      coleira: "54486"
    }
  },
  {    id: 3,
    name: "Thor",
    image: "/thor.jpg",
    info: {
      tipo: "Cachorro",
      peso: "30kg",
      idade: "9 anos",
      raca: "Golden Retriever",
      coleira: "512386"
    }
  }
]