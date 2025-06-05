import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    File,
    FileText,
    Image,
    Upload,
    Trash2,
    Star,
    Search,
    Plus,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    PlusIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePet } from "@/contexts/PetContext";
import {
    PetDocument,
    DocumentCategory,
    documentCategories,
    documentColors,
    loadDocuments,
    saveDocuments,
    formatFileSize,
    getFileIcon
} from "@/data/petDocuments";
import BackButton from "@/components/BackButton";
import PetAvatars from "@/components/PetAvatars";

const DocumentsPage = () => {
    const navigate = useNavigate();
    const { selectedPet } = usePet();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [documents, setDocuments] = useState<PetDocument[]>([]);
    const [petDocuments, setPetDocuments] = useState<PetDocument[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<DocumentCategory | "historico-geral" | "adicionar">("historico-geral");
    const [searchQuery, setSearchQuery] = useState("");
    const [uploadingDocument, setUploadingDocument] = useState<Partial<PetDocument>>({
        name: "",
        category: "outros",
        notes: ""
    });

    // Carregar documentos ao montar o componente
    useEffect(() => {
        const loadedDocuments = loadDocuments();
        setDocuments(loadedDocuments);
    }, []);

    // Filtrar documentos para o pet selecionado
    useEffect(() => {
        const filteredDocuments = documents.filter(doc => doc.petId === selectedPet.id);
        const searchResults = searchQuery
            ? filteredDocuments.filter(doc =>
                doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (doc.notes && doc.notes.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            : filteredDocuments;
        const categoryFiltered = activeCategory === "historico-geral"
            ? searchResults
            : activeCategory === "adicionar"
                ? [] // No documents shown in the "adicionar" tab
                : searchResults.filter(doc => doc.category === activeCategory);

        const sortedDocuments = [...categoryFiltered].sort(
            (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        );

        setPetDocuments(sortedDocuments);
    }, [documents, selectedPet, activeCategory, searchQuery]);

    // Salvar documentos no localStorage quando houver mudanças
    useEffect(() => {
        saveDocuments(documents);
    }, [documents]);
    // Manipulação da abertura do seletor de arquivos
    const handleUploadClick = () => {

        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Manipulação de arquivos selecionados
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];

            // Criar URL temporária para o arquivo
            const fileURL = URL.createObjectURL(file);

            setUploadingDocument({
                ...uploadingDocument,
                name: file.name.split('.')[0], // Nome do arquivo sem extensão
                fileType: file.name.split('.').pop() || 'unknown',
                fileSize: file.size,
                fileURL,
                petId: selectedPet.id,
                uploadDate: new Date().toISOString(),
                isFavorite: false
            });

            setIsDialogOpen(true);
        }
    };
    // Salvar novo documento
    const handleSaveDocument = () => {
        if (uploadingDocument.name && uploadingDocument.fileURL && uploadingDocument.petId) {
            const newDocument: PetDocument = {
                id: `doc-${Date.now()}`,
                name: uploadingDocument.name,
                petId: uploadingDocument.petId,
                fileType: uploadingDocument.fileType || 'unknown',
                fileURL: uploadingDocument.fileURL,
                fileSize: uploadingDocument.fileSize || 0,
                uploadDate: uploadingDocument.uploadDate || new Date().toISOString(),
                category: uploadingDocument.category as DocumentCategory || 'outros',
                notes: uploadingDocument.notes,
                isFavorite: false
            };

            setDocuments([...documents, newDocument]);
            setIsDialogOpen(false);

            // Redirecionar para a categoria do documento adicionado ou para o histórico geral
            setActiveCategory(newDocument.category);

            // Resetar o estado do documento para upload
            setUploadingDocument({
                name: "",
                category: "outros",
                notes: ""
            });
        }
    };

    // Remover documento
    const handleRemoveDocument = (docId: string) => {
        setDocuments(documents.filter(doc => doc.id !== docId));
    };

    // Alternar favorito
    const handleToggleFavorite = (docId: string) => {
        setDocuments(documents.map(doc =>
            doc.id === docId ? { ...doc, isFavorite: !doc.isFavorite } : doc
        ));
    };

    // Formatação de data
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    };

    // Formatação de hora
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Obter ícone baseado no tipo de documento
    const getDocumentIcon = (fileType: string) => {
        switch (fileType.toLowerCase()) {
            case 'pdf':
                return <FileText className="h-6 w-6 text-red-500" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <Image className="h-6 w-6 text-blue-500" />;
            default:
                return <File className="h-6 w-6 text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col pb-20">
            <header className="flex items-center justify-between p-3 bg-white shadow-sm">
                <div className="flex items-center">
                    <BackButton />
                    <h1 className="text-lg font-bold ml-2">Documentos</h1>
                </div>

                <Button
                    className="rounded-full"
                    size="icon"
                    onClick={handleUploadClick}
                >
                    <Plus className="h-4 w-4" />
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    onChange={handleFileSelect}
                />
            </header>

            {/* Pet Avatars Section */}
            <div className="w-full bg-white shadow-sm py-2 border-t border-gray-100">
                <PetAvatars showAddButton={false} />
            </div>

            <main className="flex-1 container mx-auto p-2 md:p-3">
                {/* Banner com informações do pet */}
                <div className="bg-white rounded-lg shadow p-3 mb-3">
                    <div className="flex items-center gap-2">
                        <img
                            src={selectedPet.image}
                            alt={`${selectedPet.name} Avatar`}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <h2 className="text-base font-semibold">
                                Documentos de {selectedPet.name}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {petDocuments.length} documentos registrados
                            </p>
                        </div>
                    </div>
                </div>

                {/* Barra de Pesquisa - só mostra quando não está na aba de adicionar */}
                {activeCategory !== "adicionar" && (
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Pesquisar documentos..."
                            className="pl-10 pr-4 py-2 border rounded-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                )}
                {/* Abas para categorias */}
                <div className="flex items-center justify-between mb-3 w-full">
                    <Tabs defaultValue="historico-geral" className="mb-3" value={activeCategory} onValueChange={(value) => setActiveCategory(value as any)}>
                        <TabsList className="grid grid-cols-2 lg:grid-cols-6 gap-2 mb-2">
                            <TabsTrigger value="vacinas" className="text-xs">Vacinas</TabsTrigger>
                            <TabsTrigger value="receitas" className="text-xs">Receitas</TabsTrigger>
                            <TabsTrigger value="exames" className="text-xs">Exames</TabsTrigger>
                            <TabsTrigger value="outros" className="text-xs">Outros</TabsTrigger>
                            <TabsTrigger value="historico-geral" className="text-xs">Todos</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button onClick={handleUploadClick} className="flex gap-2 items-center">
                        <PlusIcon className="h-4 w-4" />
                        Adicionar Documento
                    </Button>
                </div>



                {/* Área central para upload quando não há documentos (e não está na tab de adicionar) */}
                {petDocuments.length === 0 && activeCategory !== "adicionar" && (
                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-6">
                        <div className="bg-gray-100 rounded-full p-4 mb-4">
                            <Upload className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-1">Sem documentos</h3>
                        <p className="text-sm text-gray-500 text-center mb-4">
                            Adicione documentos para {selectedPet.name} clicando no botão abaixo
                        </p>
                        <Button onClick={handleUploadClick} className="flex gap-2 items-center">
                            <Upload className="h-4 w-4" />
                            Adicionar Documento
                        </Button>
                    </div>
                )}

                {/* Lista de documentos */}
                {petDocuments.length > 0 && (
                    <div className="grid grid-cols-1 gap-3">
                        {petDocuments.map(doc => (
                            <div
                                key={doc.id}
                                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-3"
                            >
                                <div className="flex items-start gap-3">                  <div className={`p-3 rounded-lg bg-${doc.category === 'exames' ? 'blue' :
                                    doc.category === 'vacinas' ? 'green' :
                                        doc.category === 'receitas' ? 'purple' :
                                            'gray'}-100`}
                                >
                                    {getDocumentIcon(doc.fileType)}
                                </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{doc.name}</h3>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs px-2 py-0 font-normal"
                                                        style={{
                                                            color: documentColors[doc.category],
                                                            borderColor: documentColors[doc.category],
                                                        }}
                                                    >
                                                        {documentCategories[doc.category]}
                                                    </Badge>
                                                    <span>•</span>
                                                    <span>{doc.fileType.toUpperCase()}</span>
                                                    <span>•</span>
                                                    <span>{formatFileSize(doc.fileSize)}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleToggleFavorite(doc.id)}
                                                >
                                                    <Star
                                                        className={`h-4 w-4 ${doc.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                                                    />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500"
                                                    onClick={() => handleRemoveDocument(doc.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {doc.notes && (
                                            <p className="text-sm text-gray-500 mt-2">{doc.notes}</p>
                                        )}

                                        <div className="flex items-center text-xs text-gray-500 mt-2">
                                            <div className="flex items-center gap-1">
                                                <CalendarIcon className="h-3.5 w-3.5" />
                                                <span>{formatDate(doc.uploadDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 ml-3">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{formatTime(doc.uploadDate)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal para metadados do documento */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adicionar Documento</DialogTitle>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Documento</label>
                            <Input
                                value={uploadingDocument.name || ''}
                                onChange={(e) => setUploadingDocument({
                                    ...uploadingDocument,
                                    name: e.target.value
                                })}
                                placeholder="Nome do documento..."
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>              
                            <select
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                                value={uploadingDocument.category}
                                onChange={(e) => setUploadingDocument({
                                    ...uploadingDocument,
                                    category: e.target.value as DocumentCategory
                                })}
                            >
                                <option value="vacinas">{documentCategories.vacinas}</option>
                                <option value="receitas">{documentCategories.receitas}</option>
                                <option value="exames">{documentCategories.exames}</option>
                                <option value="outros">{documentCategories.outros}</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                            <textarea
                                value={uploadingDocument.notes || ''}
                                onChange={(e) => setUploadingDocument({
                                    ...uploadingDocument,
                                    notes: e.target.value
                                })}
                                placeholder="Adicione observações sobre o documento..."
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                rows={3}
                            />
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSaveDocument}>
                                Salvar Documento
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DocumentsPage;
