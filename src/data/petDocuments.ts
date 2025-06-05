import { Pet } from "./pets";

export interface PetDocument {
  id: string;
  name: string; // Nome do documento
  petId: number; // ID do pet associado ao documento
  fileType: string; // Tipo do arquivo (pdf, jpg, png, etc)
  fileURL: string; // URL do arquivo (local ou remoto)
  fileSize: number; // Tamanho em bytes
  uploadDate: string; // Data de upload do documento
  category: DocumentCategory; // Categoria do documento
  notes?: string; // Notas adicionais sobre o documento
  isFavorite: boolean; // Se o documento está marcado como favorito
}

export type DocumentCategory = 
  | "vacinas" 
  | "receitas" 
  | "exames" 
  | "outros";

export const documentCategories: Record<DocumentCategory, string> = {
  vacinas: "Vacinas",
  receitas: "Receitas",
  exames: "Exames",
  outros: "Outros"
};

// Documentos iniciais para demonstração
export const initialDocuments: PetDocument[] = [
  {
    id: "doc-1",
    name: "Resultado Exame de Sangue",
    petId: 1, // Bella
    fileType: "pdf",
    fileURL: "/documents/exam-blood.pdf",
    fileSize: 1250000,
    uploadDate: "2025-05-15T14:30:00.000Z",
    category: "exames",
    notes: "Exame de sangue completo realizado na Clínica PetVet",
    isFavorite: true
  },
  {
    id: "doc-2",
    name: "Carteira de Vacinação",
    petId: 1, // Bella
    fileType: "pdf",
    fileURL: "/documents/vaccination-card.pdf",
    fileSize: 850000,
    uploadDate: "2025-04-10T10:15:00.000Z",
    category: "vacinas",
    notes: "Inclui todas as vacinas até 2025",
    isFavorite: true
  },
  {
    id: "doc-3",
    name: "Receita Medicamento",
    petId: 2, // Dom
    fileType: "jpg",
    fileURL: "/documents/prescription.jpg",
    fileSize: 450000,
    uploadDate: "2025-05-28T16:45:00.000Z",
    category: "receitas",
    notes: "Receita para antibiótico após procedimento dental",
    isFavorite: false
  },
  {
    id: "doc-4",
    name: "Raio-X Tórax",
    petId: 3, // Thor
    fileType: "png",
    fileURL: "/documents/xray-chest.png",
    fileSize: 2800000,
    uploadDate: "2025-05-02T09:20:00.000Z",
    category: "exames",
    notes: "Raio-X realizado após suspeita de problema respiratório",
    isFavorite: true
  }
];

// Função para carregar documentos do localStorage ou usar os iniciais
export function loadDocuments(): PetDocument[] {
  try {
    const savedDocuments = localStorage.getItem('petcare-documents');
    if (savedDocuments) {
      return JSON.parse(savedDocuments);
    }
  } catch (error) {
    console.error('Erro ao carregar documentos salvos:', error);
  }
  return initialDocuments;
}

// Função para salvar documentos no localStorage
export function saveDocuments(documents: PetDocument[]): void {
  localStorage.setItem('petcare-documents', JSON.stringify(documents));
}

// Função para adicionar um novo documento
export function addDocument(document: PetDocument): PetDocument[] {
  const currentDocuments = loadDocuments();
  const updatedDocuments = [...currentDocuments, document];
  saveDocuments(updatedDocuments);
  return updatedDocuments;
}

// Função para remover um documento pelo ID
export function removeDocument(documentId: string): PetDocument[] {
  const currentDocuments = loadDocuments();
  const updatedDocuments = currentDocuments.filter(doc => doc.id !== documentId);
  saveDocuments(updatedDocuments);
  return updatedDocuments;
}

// Função para formatar o tamanho do arquivo
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}

// Função para obter ícone baseado no tipo de arquivo
export function getFileIcon(fileType: string): string {
  switch(fileType.toLowerCase()) {
    case 'pdf': return 'file-text';
    case 'jpg': 
    case 'jpeg': 
    case 'png': 
    case 'gif': return 'image';
    case 'doc': 
    case 'docx': return 'file-text';
    case 'xls': 
    case 'xlsx': return 'file-spreadsheet';
    default: return 'file';
  }
}

// Função para obter cor baseada na categoria do documento
export const documentColors: Record<DocumentCategory, string> = {
  vacinas: "#10b981", // verde
  receitas: "#8b5cf6", // roxo
  exames: "#3b82f6", // azul
  outros: "#6b7280" // cinza
};
