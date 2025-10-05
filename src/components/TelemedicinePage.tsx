import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PetLayout from './PetLayout';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { usePet } from '@/contexts/PetContext';
import { Pet } from '@/data/pets';
import { specialties, Specialty, loadingMessages } from '@/data/telemedicineSpecialties';
import { Clock, Video, Calendar, AlertCircle, CheckCircle2, Stethoscope } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

type Step = 'initial' | 'selectPet' | 'warningImmediate' | 'selectSpecialty' | 'warningSpecialty' | 'loading';
type ConsultType = 'immediate' | 'specialty' | null;

const TelemedicinePage: React.FC = () => {
    const navigate = useNavigate();
    const { pets } = usePet();
    const [step, setStep] = useState<Step>('initial');
    const [consultType, setConsultType] = useState<ConsultType>(null);
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    // Animação das mensagens de loading
    useEffect(() => {
        if (step === 'loading') {
            const interval = setInterval(() => {
                setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [step]);

    const handleConsultTypeSelect = (type: ConsultType) => {
        setConsultType(type);
        setStep('selectPet');
    };

    const handlePetSelect = (pet: Pet) => {
        setSelectedPet(pet);
        if (consultType === 'immediate') {
            setStep('warningImmediate');
        } else {
            setStep('selectSpecialty');
        }
    };

    const handleSpecialtySelect = (specialty: Specialty) => {
        setSelectedSpecialty(specialty);
        setStep('warningSpecialty');
    };

    const handleStartConsult = () => {
        setStep('loading');
        // Simular busca de profissional (em produção, aqui seria uma chamada à API)
        // setTimeout(() => {
        //   // Navegar para sala de consulta ou outro destino
        // }, 5000);
    };

    // Tela 1: Escolha do tipo de consulta
    const renderInitialScreen = () => (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Telemedicina Veterinária</h1>
                <p className="text-muted-foreground">Escolha o tipo de atendimento para seu pet</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card
                    className="cursor-pointer hover:border-primary transition-all hover:shadow-lg"
                    onClick={() => handleConsultTypeSelect('immediate')}
                >
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Video className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Consulta Imediata</CardTitle>
                        </div>
                        <CardDescription>Atendimento rápido com clínico veterinário geral</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Atendimento em até 15 minutos
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Ideal para situações urgentes
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Clínico veterinário disponível
                            </li>
                        </ul>
                        <Button className="w-full mt-4">Iniciar Consulta Imediata</Button>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:border-primary transition-all hover:shadow-lg"
                    onClick={() => handleConsultTypeSelect('specialty')}
                >
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-blue-500/10 rounded-full">
                                <Calendar className="h-6 w-6 text-blue-500" />
                            </div>
                            <CardTitle>Especialidades</CardTitle>
                        </div>
                        <CardDescription>Agende com especialistas em diversas áreas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Mais de 8 especialidades disponíveis
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Atendimento especializado
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Agendamento por WhatsApp
                            </li>
                        </ul>
                        <Button className="w-full mt-4" variant="outline">Escolher Especialidade</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    // Tela 2: Seleção de Pet
    const renderPetSelection = () => (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Selecione o Pet</h1>
                <p className="text-muted-foreground">Qual pet será atendido?</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {pets.map((pet) => (
                    <Card
                        key={pet.id}
                        className="cursor-pointer hover:border-primary transition-all hover:shadow-lg"
                        onClick={() => handlePetSelect(pet)}
                    >
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <img
                                    src={pet.image}
                                    alt={pet.name}
                                    className="h-32 w-32 rounded-full object-cover border-4 border-primary/20"
                                />
                            </div>
                            <CardTitle>{pet.name}</CardTitle>
                            <CardDescription>{pet.info.tipo} • {pet.info.raca}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p>Peso: {pet.info.peso}</p>
                                <p>Idade: {pet.info.idade}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-6 text-center">
                <Button variant="ghost" onClick={() => setStep('initial')}>
                    Voltar
                </Button>
            </div>
        </div>
    );

    // Tela 3a: Aviso para Consulta Imediata
    const renderWarningImmediate = () => (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card>
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-primary/10 rounded-full">
                            <Stethoscope className="h-12 w-12 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Consulta Imediata</CardTitle>
                    <CardDescription>
                        Atendimento com {selectedPet?.name}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Antes de iniciar, tenha em mãos:</strong>
                        </AlertDescription>
                    </Alert>

                    <ul className="space-y-3 ml-6">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>Carteira de vacinação atualizada</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>Histórico médico e exames recentes</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>Lista de medicamentos em uso</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>Descrição detalhada dos sintomas</span>
                        </li>
                    </ul>

                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            <span className="font-semibold">Tempo de espera médio</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">5 - 15 minutos</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setStep('selectPet')}>
                            Voltar
                        </Button>
                        <Button className="flex-1" onClick={handleStartConsult}>
                            Iniciar Consulta
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    // Tela 3b: Seleção de Especialidade
    const renderSpecialtySelection = () => (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Escolha a Especialidade</h1>
                <p className="text-muted-foreground">Atendimento para {selectedPet?.name}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specialties.map((specialty) => (
                    <Card
                        key={specialty.id}
                        className="cursor-pointer hover:border-primary transition-all hover:shadow-lg"
                        onClick={() => handleSpecialtySelect(specialty)}
                    >
                        <CardHeader>
                            <div className="text-4xl mb-2">{specialty.icon}</div>
                            <CardTitle className="text-lg">{specialty.name}</CardTitle>
                            <CardDescription className="text-xs">{specialty.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>Espera: {specialty.averageWaitTime}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-6 text-center">
                <Button variant="ghost" onClick={() => setStep('selectPet')}>
                    Voltar
                </Button>
            </div>
        </div>
    );

    // Tela 4b: Aviso para Especialidades
    const renderWarningSpecialty = () => (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card>
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="text-6xl">{selectedSpecialty?.icon}</div>
                    </div>
                    <CardTitle className="text-2xl">{selectedSpecialty?.name}</CardTitle>
                    <CardDescription>
                        Atendimento especializado para {selectedPet?.name}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Prepare-se para a consulta:</strong>
                        </AlertDescription>
                    </Alert>

                    <ul className="space-y-3 ml-6">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>Documentos do pet (carteira de vacinação, exames)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>Histórico médico relacionado à especialidade</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>Lista de medicamentos e tratamentos atuais</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>Anotações sobre comportamento e sintomas</span>
                        </li>
                    </ul>

                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            <span className="font-semibold">Tempo de espera estimado</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{selectedSpecialty?.averageWaitTime}</p>
                    </div>

                    <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
                        <Calendar className="h-4 w-4" />
                        <AlertDescription>
                            Se o profissional não estiver disponível, você receberá uma notificação por <strong>WhatsApp</strong> e no
                            <strong> calendário do app</strong> para agendar a consulta.
                        </AlertDescription>
                    </Alert>

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setStep('selectSpecialty')}>
                            Voltar
                        </Button>
                        <Button className="flex-1" onClick={handleStartConsult}>
                            Buscar Profissional
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    // Tela 5: Loading - Buscando Profissional
    const renderLoading = () => (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card>
                <CardContent className="py-12">
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-full border-4 border-primary/20"></div>
                                <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <Stethoscope className="h-10 w-10 text-primary" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">
                                {loadingMessages[currentMessageIndex]}
                            </h2>
                            <p className="text-muted-foreground">
                                Aguardando profissional disponível...
                            </p>
                        </div>

                        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-6 rounded-lg">
                            <div className="flex items-center justify-center gap-3 mb-3">
                                <img
                                    src={selectedPet?.image}
                                    alt={selectedPet?.name}
                                    className="h-16 w-16 rounded-full object-cover border-2 border-primary"
                                />
                                <div className="text-left">
                                    <p className="font-semibold">{selectedPet?.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {consultType === 'immediate' ? 'Consulta Imediata' : selectedSpecialty?.name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => {
                                setStep('initial');
                                setConsultType(null);
                                setSelectedPet(null);
                                setSelectedSpecialty(null);
                            }}
                        >
                            Cancelar
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <PetLayout title="Telemedicina">
            {step === 'initial' && renderInitialScreen()}
            {step === 'selectPet' && renderPetSelection()}
            {step === 'warningImmediate' && renderWarningImmediate()}
            {step === 'selectSpecialty' && renderSpecialtySelection()}
            {step === 'warningSpecialty' && renderWarningSpecialty()}
            {step === 'loading' && renderLoading()}
        </PetLayout>
    );
};

export default TelemedicinePage;
