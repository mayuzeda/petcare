import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePet } from "@/contexts/PetContext";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MapPin, Navigation, Clock, Home, Car, TreePine, Building } from "lucide-react";
import { PetLayout } from "./PetLayout";
import { getPetGPSData, calculateGPSSummary, TimeRange } from "@/data/petGPS";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Coordenadas do Parque Ibirapuera - São Paulo
const SAO_PAULO_CENTER = { lat: -23.5872, lng: -46.6568 };

// Localizações fictícias dos pets próximos ao Parque Ibirapuera
const PET_LOCATIONS = {
    1: { // Bella - cachorro caminhando no parque
        lat: -23.5872,
        lng: -46.6568,
        address: "Parque Ibirapuera - Trilha das Árvores",
        lastUpdate: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
        status: "moving" as const
    },
    2: { // Dom - gato em casa
        lat: -23.5845,
        lng: -46.6520,
        address: "Rua Curitiba, 425 - Paraíso (Residência)",
        lastUpdate: new Date(Date.now() - 12 * 60 * 1000), // 12 minutos atrás
        status: "stationary" as const
    },
    3: { // Thor - cachorro caminhando no parque
        lat: -23.5878,
        lng: -46.6580,
        address: "Parque Ibirapuera - Área de Recreação",
        lastUpdate: new Date(Date.now() - 2 * 60 * 1000), // 2 minutos atrás
        status: "moving" as const
    }
};

// Componente para centralizar o mapa no pet
const MapCenter: React.FC<{ position: [number, number] }> = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        map.setView(position, 16);
    }, [map, position]);

    return null;
};

// Criar um ícone customizado para o pin do pet
const createPetIcon = (petImage: string, status: string) => {
    const statusColor = status === "moving" ? "#10b981" : "#f59e0b";

    return L.divIcon({
        html: `
            <div style="
                position: relative;
                width: 40px;
                height: 50px;
                display: flex;
                flex-direction: column;
                align-items: center;
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    background-color: ${statusColor};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                ">
                    <img src="${petImage}" alt="Pet" style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        border-radius: 50%;
                    " />
                </div>
                <div style="
                    width: 0;
                    height: 0;
                    border-left: 6px solid transparent;
                    border-right: 6px solid transparent;
                    border-top: 10px solid ${statusColor};
                    margin-top: -2px;
                "></div>
            </div>
        `,
        className: 'custom-pet-marker',
        iconSize: [40, 50],
        iconAnchor: [20, 50],
        popupAnchor: [0, -50]
    });
};

// Cores para diferentes tipos de localização
const locationColors: Record<string, string> = {
    casa: "#10b981",      // verde
    quintal: "#3b82f6",   // azul
    rua: "#8b5cf6",       // roxo
    parque: "#f59e0b",    // laranja
    "casa+rua": "#ef4444", // vermelho
    misto: "#6b7280"      // cinza
};

// Ícones para os locais
const locationIcons: Record<string, JSX.Element> = {
    casa: <Home size={16} />,
    quintal: <Building size={16} />,
    rua: <Car size={16} />,
    parque: <TreePine size={16} />,
    "casa+rua": <Navigation size={16} />,
    misto: <MapPin size={16} />
};

const GPSPage = () => {
    const { selectedPet } = usePet();
    const [timeRange, setTimeRange] = useState<TimeRange>("day");

    const petLocation = PET_LOCATIONS[selectedPet.id as keyof typeof PET_LOCATIONS];
    const summary = calculateGPSSummary(selectedPet.id, timeRange);

    const handleTimeRangeChange = (value: string) => {
        if (value) {
            setTimeRange(value as TimeRange);
        }
    };

    const formatLastUpdate = (date: Date) => {
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffMinutes < 1) return "Agora mesmo";
        if (diffMinutes === 1) return "1 minuto atrás";
        if (diffMinutes < 60) return `${diffMinutes} minutos atrás`;

        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours === 1) return "1 hora atrás";
        return `${diffHours} horas atrás`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "moving": return "bg-green-500";
            case "stationary": return "bg-yellow-500";
            default: return "bg-gray-500";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "moving": return "Em movimento";
            case "stationary": return "Parado";
            default: return "Desconhecido";
        }
    };

    // Renderização do nome do local personalizado
    const renderLocationName = (location: string) => {
        if (selectedPet.id === 1) { // Bella
            switch (location) {
                case "casa": return "Interior da Casa";
                case "quintal": return "Área Externa/Quintal";
                case "rua": return "Passeio na Rua";
                case "parque": return "Parque/Área de Lazer";
                case "casa+rua": return "Casa e Áreas Externas";
                default: return location;
            }
        } else if (selectedPet.id === 2) { // Dom (gato)
            switch (location) {
                case "casa": return "Interior da Casa";
                case "quintal": return "Varanda/Quintal";
                default: return location;
            }
        } else { // Thor
            switch (location) {
                case "casa": return "Área Interna";
                case "quintal": return "Quintal/Jardim";
                case "rua": return "Caminhada/Passeio";
                case "parque": return "Área de Recreação";
                case "casa+rua": return "Ambientes Internos/Externos";
                default: return location;
            }
        }
    };

    return (
        <PetLayout
            title={`GPS - ${selectedPet.name}`}
            showBackButton={true}
        >
            <div className="w-full max-w-4xl space-y-6">
                {/* Status atual do pet */}
                <Card className="shadow-md">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            Localização Atual
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(petLocation.status)} animate-pulse`}></div>
                                    <span className="font-semibold text-lg">{selectedPet.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                        {getStatusText(petLocation.status)}
                                    </Badge>
                                </div>
                                <p className="text-gray-700 mb-1">{petLocation.address}</p>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Clock className="h-4 w-4" />
                                    <span>Última atualização: {formatLastUpdate(petLocation.lastUpdate)}</span>
                                </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                                <p>Lat: {petLocation.lat.toFixed(4)}</p>
                                <p>Lng: {petLocation.lng.toFixed(4)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>                {/* Mapa */}
                <Card className="shadow-md">
                    <CardHeader className="pb-4">                        <CardTitle className="flex items-center gap-2">
                            <Navigation className="h-5 w-5 text-blue-600" />
                            Mapa - Parque Ibirapuera
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative rounded-lg overflow-hidden h-80">
                            <MapContainer
                                center={[petLocation.lat, petLocation.lng]}
                                zoom={16}
                                className="w-full h-full"
                                zoomControl={true}
                                attributionControl={false}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <MapCenter position={[petLocation.lat, petLocation.lng]} />
                                <Marker
                                    position={[petLocation.lat, petLocation.lng]}
                                    icon={createPetIcon(selectedPet.image, petLocation.status)}
                                >
                                    <Popup>
                                        <div className="text-center p-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <img
                                                    src={selectedPet.image}
                                                    alt={selectedPet.name}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                                <div>
                                                    <p className="font-semibold text-sm">{selectedPet.name}</p>
                                                    <p className="text-xs text-gray-600">{getStatusText(petLocation.status)}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-700 mb-1">{petLocation.address}</p>
                                            <p className="text-xs text-gray-500">
                                                Última atualização: {formatLastUpdate(petLocation.lastUpdate)}
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Seletor de período */}
                <div className="flex justify-center">
                    <ToggleGroup type="single" value={timeRange} onValueChange={handleTimeRangeChange} className="p-1 rounded-lg">
                        <ToggleGroupItem value="day" aria-label="Toggle day" className="data-[state=on]:bg-white data-[state=on]:shadow-sm">
                            <span className="px-2">Hoje</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem value="week" aria-label="Toggle week" className="data-[state=on]:bg-white data-[state=on]:shadow-sm">
                            <span className="px-2">Semana</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem value="month" aria-label="Toggle month" className="data-[state=on]:bg-white data-[state=on]:shadow-sm">
                            <span className="px-2">Mês</span>
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                {/* Distribuição de Locais */}
                <Card className="shadow-md">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-gray-700" />
                            Locais Frequentados
                            <Badge variant="outline" className="ml-2">
                                {timeRange === 'day' ? 'Hoje' : timeRange === 'week' ? 'Esta Semana' : 'Este Mês'}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {summary.locationCount.map((location, index) => (
                                <div key={location.location} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                                        <span className="text-gray-600">
                                            {locationIcons[location.location]}
                                        </span>
                                    </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {renderLocationName(location.location)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {location.count} {location.count === 1 ? 'registro' : 'registros'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">                    <p className="font-semibold text-lg text-blue-600">
                                        {location.percentage}%
                                    </p>
                                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-300 bg-blue-500"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Informações adicionais */}
                <Card className="shadow-md border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <MapPin className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-sm text-gray-700">
                                <p className="font-medium mb-1">
                                    {selectedPet.info.tipo.toLowerCase() === "cachorro"
                                        ? `Rastreamento GPS de ${selectedPet.name}`
                                        : `Monitoramento de ${selectedPet.name}`
                                    }
                                </p>                                <p>
                                    {selectedPet.info.tipo.toLowerCase() === "cachorro"
                                        ? `${selectedPet.name} está sendo monitorado no Parque Ibirapuera. O GPS atualiza a localização a cada 2-5 minutos durante os passeios.`
                                        : `${selectedPet.name} está sendo monitorado em casa, próximo ao Parque Ibirapuera. O sistema registra os ambientes frequentados ao longo do dia.`
                                    }
                                </p>                                <p className="mt-2 text-xs text-blue-600">
                                    💡 Ideal para passeios no parque! Mantenha o dispositivo GPS carregado para acompanhar toda a diversão.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PetLayout>
    );
};

export default GPSPage;
