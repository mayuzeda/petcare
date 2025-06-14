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
import { PetLayout } from "./PetLayout";

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
                return <FileText className="h-6 w-6" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <Image className="h-6 w-6 text-blue-500" />;
            default:
                return <File className="h-6 w-6 text-gray-500" />;
        }
    };

    // Floating Action Button para adicionar documento
    const fabButton = (
        <>
            <Button
                className="rounded-full w-14 h-14 bg-orange-500 hover:bg-orange-600 p-0 shadow-lg hover:shadow-xl transition-shadow"
                size="lg"
                onClick={handleUploadClick}
            >
                <Plus className="h-6 w-6" />
            </Button>            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                className="hidden"
                aria-label="Selecionar arquivo para upload"
                onChange={handleFileSelect}
            />
        </>
    );    return (
        <PetLayout
            title="Documentos"
            floatingActionButton={fabButton}
        >
            {/* Container principal com altura fixa */}
            <div className="flex flex-col h-full w-full max-w-4xl">
                {/* Banner com informações do pet - altura fixa */}
                <div className="bg-white rounded-lg shadow p-4 mb-4 flex-none">
                    <div className="flex items-center gap-3">
                        <img
                            src={selectedPet.image}
                            alt={`${selectedPet.name} Avatar`}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                            <h2 className="text-lg font-semibold">
                                Documentos de {selectedPet.name}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {petDocuments.length} documentos registrados
                            </p>
                        </div>
                    </div>
                </div>

                {/* Barra de Pesquisa - altura fixa */}
                {activeCategory !== "adicionar" && (
                    <div className="relative mb-4 flex-none">
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

                {/* Abas para categorias - altura fixa */}
                <div className="mb-4 flex-none">
                    <Tabs defaultValue="historico-geral" value={activeCategory} onValueChange={(value) => setActiveCategory(value as DocumentCategory | "historico-geral" | "adicionar")}>
                        <TabsList className="grid grid-cols-5 gap-2">
                            <TabsTrigger value="vacinas" className="text-xs">Vacinas</TabsTrigger>
                            <TabsTrigger value="receitas" className="text-xs">Receitas</TabsTrigger>
                            <TabsTrigger value="exames" className="text-xs">Exames</TabsTrigger>
                            <TabsTrigger value="outros" className="text-xs">Outros</TabsTrigger>
                            <TabsTrigger value="historico-geral" className="text-xs">Todos</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Área de conteúdo com scroll - altura flexível */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                    {/* Área central para upload quando não há documentos */}
                    {petDocuments.length === 0 && activeCategory !== "adicionar" && (
                        <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-6">
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
                        <div className="grid grid-cols-1 gap-3 pb-4">
                            {petDocuments.map(doc => (
                                <div
                                    key={doc.id}
                                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-3"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-3 rounded-lg flex-none ${
                                            doc.category === 'exames' ? 'bg-blue-100 text-blue-700' :
                                            doc.category === 'vacinas' ? 'bg-green-100 text-green-700' :
                                            doc.category === 'receitas' ? 'bg-purple-100 text-purple-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {getDocumentIcon(doc.fileType)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-medium text-gray-900 truncate">{doc.name}</h3>
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

                                                <div className="flex gap-1 flex-none">
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
                                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{doc.notes}</p>
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
                </div>
            </div>

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
                                title="Selecionar categoria do documento"
                                aria-label="Categoria do documento"
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

        </PetLayout >
    );
};

export default DocumentsPage;
