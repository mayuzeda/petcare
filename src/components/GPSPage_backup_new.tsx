import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePet } from "@/contexts/PetContext";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Footprints, MapPin, Timer, Home, Shrub, Car, AlertTriangle } from "lucide-react";
import PetAvatars from "@/components/PetAvatars";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Area
} from "recharts";
import { getPetGPSData, calculateGPSSummary, checkGPSAlerts, TimeRange } from "@/data/petGPS";

// Cores para os gráficos
const distanceColor = "#3b82f6"; // azul
const stepsColor = "#10b981";    // verde
const activeColor = "#8b5cf6";   // roxo
const inactiveColor = "#d1d5db"; // cinza

// Cores para os locais
const locationColors: Record<string, string> = {
    casa: "#4b5563",       // cinza escuro
    quintal: "#10b981",    // verde
    rua: "#3b82f6",        // azul
    parque: "#8b5cf6",     // roxo
    "casa+rua": "#60a5fa", // azul claro
    misto: "#f59e0b"       // laranja
};

// Ícones para os locais
const locationIcons: Record<string, JSX.Element> = {
    casa: <Home size={14} />,
    quintal: <Home size={14} />,
    rua: <Car size={14} />,
    parque: <Shrub size={14} />,
    "casa+rua": <Car size={14} />,
    misto: <MapPin size={14} />
};

const GPSPage = () => {
    const { selectedPet } = usePet();
    const [timeRange, setTimeRange] = useState<TimeRange>("day");

    const gpsData = getPetGPSData(selectedPet.id, timeRange);
    const summary = calculateGPSSummary(selectedPet.id, timeRange);
    const alerts = checkGPSAlerts(selectedPet.id, timeRange);

    const handleTimeRangeChange = (value: string) => {
        if (value) {
            setTimeRange(value as TimeRange);
        }
    };

    // Determinar o label do eixo X baseado no intervalo de tempo
    const getXAxisLabel = () => {
        switch (timeRange) {
            case "day":
                return "hour";
            case "week":
                return "day";
            case "month":
                return "date";
            default:
                return "hour";
        }
    };

    // Formatar valores de distância
    const formatDistance = (value: number) => {
        return value >= 1000
            ? `${(value / 1000).toFixed(1)} km`
            : `${value} m`;
    };

    // Formatar valores de tempo
    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0) {
            return `${hours}h ${mins}min`;
        }
        return `${mins} min`;
    };

    // Dados de localização para exibição
    const locationData = summary.locationCount.map(item => ({
        name: item.location,
        value: item.percentage,
        count: item.count
    }));// Customizar o conteúdo do tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border rounded-md shadow-lg">
                    <p className="font-bold text-gray-800 mb-2 border-b pb-1">
                        {timeRange === 'day' ? `Hora: ${label}` :
                            timeRange === 'week' ? `Dia: ${label}` :
                                `Data: ${label}`}
                    </p>
                    <div className="space-y-2">
                        {payload.map((entry: any, index: number) => (
                            <div
                                key={`item-${index}`}
                                className="flex items-center gap-2"
                            >
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                ></div>
                                <span className="font-semibold">
                                    {entry.name === "distance"
                                        ? "Distância: "
                                        : entry.name === "steps"
                                            ? "Passos: "
                                            : entry.name === "active"
                                                ? "Tempo Ativo: "
                                                : entry.name === "inactive"
                                                    ? "Tempo Inativo: "
                                                    : `${entry.name}: `}
                                </span>
                                <span className="text-gray-700">
                                    {entry.name === "distance"
                                        ? formatDistance(entry.value)
                                        : entry.name === "steps"
                                            ? entry.value.toLocaleString()
                                            : entry.name === "active" || entry.name === "inactive"
                                                ? formatTime(entry.value)
                                                : entry.value}
                                </span>
                            </div>
                        ))}
                    </div>
                    {/* Informação adicional personalizada sobre o pet */}
                    {timeRange === 'day' &&
                        <p className="mt-2 pt-2 text-xs text-gray-500 border-t">
                            {label.startsWith("07") || label.startsWith("08") || label.startsWith("17") || label.startsWith("18")
                                ? `Horários de maior atividade para ${selectedPet.name}`
                                : label.startsWith("00") || label.startsWith("01") || label.startsWith("02") || label.startsWith("03") || label.startsWith("04")
                                    ? `${selectedPet.name} normalmente descansa neste horário`
                                    : `Monitoramento de ${selectedPet.name}`}
                        </p>
                    }
                </div>
            );
        }
        return null;
    };// Renderização condicional para nome do local
    const renderLocationName = (location: string) => {
        // Para modo mensal, substituir "misto" por uma descrição mais específica
        if (location === "misto") {
            if (timeRange === "month") {
                if (selectedPet.id === 1) {
                    return "Múltiplos Ambientes"; // Bella visita todos os locais
                } else if (selectedPet.id === 3) {
                    return "Ambientes Diversos"; // Thor vai a todos os locais
                } else {
                    return "Ambiente Doméstico"; // Dom (gato) fica só em casa
                }
            } else {
                return "Locais Variados";
            }
        }

        // Personalizar nomes para diferentes pets
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
        } else { // Thor ou outro pet
            switch (location) {
                case "casa": return "Área Interna";
                case "quintal": return "Quintal/Jardim";
                case "rua": return "Caminhada/Passeio";
                case "parque": return "Área de Recreação";
                case "casa+rua": return "Ambientes Internos/Externos";
                default: return location;
            }
        }
    };    return (
        <div className="min-h-screen flex flex-col pb-20">
            <header className="flex items-center justify-between p-3 bg-white shadow-sm">
                <div className="flex items-center">
                    <BackButton />
                    <h1 className="text-lg font-bold ml-2">GPS</h1>
                </div>
            </header>
            
            {/* Pet Avatars Section */}
            <div className="w-full bg-white shadow-sm py-2 border-t border-gray-100">
                <PetAvatars showAddButton={false} />
            </div>
            
            <main className="flex-1 container mx-auto p-2 md:p-3">
                <div className="container mx-auto px-4 mt-4 mb-4">
                    <ToggleGroup type="single" value={timeRange} onValueChange={handleTimeRangeChange} className="bg-gray-100 p-1 rounded-lg flex justify-center">
                        <ToggleGroupItem value="day" aria-label="Toggle day" className="data-[state=on]:bg-white data-[state=on]:shadow-sm">
                            <span className="px-2">Dia</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem value="week" aria-label="Toggle week" className="data-[state=on]:bg-white data-[state=on]:shadow-sm">
                            <span className="px-2">Semana</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem value="month" aria-label="Toggle month" className="data-[state=on]:bg-white data-[state=on]:shadow-sm">
                            <span className="px-2">Mês</span>
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>                <div className="mb-4">
                    {alerts.hasAlerts && (
                        <Alert variant="destructive" className="mb-6 border-l-4 border-l-red-600 animate-fadeIn">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
                                <div>
                                    <AlertTitle className="text-lg font-bold text-red-600">
                                        Alerta de Atividade - {selectedPet.name}
                                    </AlertTitle>
                                    <AlertDescription className="mt-2 text-gray-700">
                                        {alerts.alerts.map((alert, index) => (
                                            <div key={index} className="py-1">
                                                • {alert}
                                            </div>
                                        ))}
                                    </AlertDescription>
                                    <div className="mt-2 text-sm text-red-600">
                                        {summary.activityLevel === "BAIXO"
                                            ? "Recomendamos aumentar o nível de atividade física do seu pet."
                                            : "Monitore estes alertas para garantir a saúde do seu pet."}
                                    </div>
                                </div>
                            </div>
                        </Alert>
                    )}
                </div>
              {/* Resumo de atividades */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 staggered-animation">
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-b-4 border-b-blue-400 animate-fadeIn opacity-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Distância Total</p>
                                <p className="text-3xl font-bold text-blue-600">{formatDistance(summary.totalDistance)}</p>
                                <p className="text-xs text-muted-foreground mt-1">                                {timeRange === 'day'
                                        ? `${selectedPet.info.tipo.toLowerCase() === 'cachorro' ? 'Diário recomendado' : 'Movimentação'}: ${selectedPet.info.tipo.toLowerCase() === 'cachorro' ? '2-5 km' : '100-500m'}`
                                        : `${timeRange === 'week' ? 'Semanal' : 'Mensal'}`}
                                </p>
                            </div>
                            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center shadow-inner">
                                <MapPin className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-b-4 border-b-green-400 animate-fadeIn opacity-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total de Passos</p>
                                <p className="text-3xl font-bold text-green-600">{summary.totalSteps.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground mt-1">                                    {selectedPet.info.tipo.toLowerCase() === 'cachorro'
                                        ? `Meta: ${selectedPet.info.raca.toLowerCase().includes('pequeno') ? '8-10k' : selectedPet.info.raca.toLowerCase().includes('médio') ? '10-12k' : '12-15k'} passos`
                                        : 'Gatos têm padrões de atividade diferentes'}
                                </p>
                            </div>
                            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center shadow-inner">
                                <Footprints className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-b-4 border-b-purple-400 animate-fadeIn opacity-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tempo Ativo</p>
                                <p className="text-3xl font-bold text-purple-600">{formatTime(summary.totalActiveTime)}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    vs. {formatTime(summary.totalInactiveTime)} inativo
                                    <span className="block">
                                        {Math.round((summary.totalActiveTime / (summary.totalActiveTime + summary.totalInactiveTime)) * 100)}% do tempo
                                    </span>
                                </p>
                            </div>
                            <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center shadow-inner">
                                <Timer className="h-8 w-8 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={`shadow-md hover:shadow-lg transition-shadow duration-300 border-b-4 animate-fadeIn opacity-0 ${summary.activityLevel === "ALTO" ? "border-b-blue-400" :
                    summary.activityLevel === "MODERADO" ? "border-b-green-400" :
                        "border-b-amber-400"
                    }`}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Nível de Atividade</p>
                                <div className="flex items-center">
                                    <p className={`text-3xl font-bold ${summary.activityLevel === "ALTO" ? "text-blue-600" :
                                        summary.activityLevel === "MODERADO" ? "text-green-600" :
                                            "text-amber-600"
                                        }`}>{summary.activePercentage}%</p>
                                    <Badge
                                        variant={summary.activityLevel === "BAIXO" ? "destructive" : "default"}
                                        className={`ml-2 ${summary.activityLevel === "ALTO" ? "bg-blue-500" :
                                            summary.activityLevel === "MODERADO" ? "bg-green-500" : ""
                                            }`}
                                    >
                                        {summary.activityLevel}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {summary.activityLevel === "ALTO"
                                        ? "Excelente nível de atividade!"
                                        : summary.activityLevel === "MODERADO"
                                            ? "Bom nível, pode melhorar"
                                            : "Precisa de mais exercícios"}
                                </p>
                            </div>
                            <div className={`h-14 w-14 rounded-full flex items-center justify-center shadow-inner ${summary.activityLevel === "ALTO" ? "bg-blue-100" :
                                summary.activityLevel === "MODERADO" ? "bg-green-100" :
                                    "bg-amber-100"
                                }`}>
                                {summary.activityLevel === "ALTO" ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={summary.activityLevel === "ALTO" ? "text-blue-600" : summary.activityLevel === "MODERADO" ? "text-green-600" : "text-amber-600"}>
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                ) : summary.activityLevel === "MODERADO" ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                                        <path d="M8 12h8"></path>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                                        <path d="m15 9-6 6"></path>
                                        <path d="m9 9 6 6"></path>
                                    </svg>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>            {/* Gráfico de Distância */}
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 gap-6 mb-6">
                    <Card className="overflow-hidden border-2 border-opacity-50 animate-slideIn opacity-0" style={{ borderColor: distanceColor, animationDelay: '0.2s' }}>
                        <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full" style={{ backgroundColor: distanceColor }}></span>
                        Distância Percorrida
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {timeRange === 'day'
                            ? `Rastreamento da distância percorrida por ${selectedPet.name} nas últimas 24 horas`
                            : timeRange === 'week'
                                ? `Distância semanal percorrida por ${selectedPet.name}`
                                : `Resumo mensal da distância percorrida por ${selectedPet.name}`}
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="h-[280px] chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={gpsData}
                                margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
                            >
                                <defs>
                                    <linearGradient id="distanceGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={distanceColor} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={distanceColor} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                                <XAxis
                                    dataKey={getXAxisLabel()}
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    tickMargin={10}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                    tickLine={{ stroke: '#e5e7eb' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    tickMargin={10}
                                    tickFormatter={(value) => formatDistance(value)}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                    tickLine={{ stroke: '#e5e7eb' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotoneX"
                                    dataKey="distance"
                                    stroke={distanceColor}
                                    strokeWidth={3}
                                    dot={{ r: 2, fill: distanceColor, strokeWidth: 2 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    name="Distância"
                                    isAnimationActive={true}
                                    animationDuration={1000}
                                />
                                <Area
                                    type="monotoneX"
                                    dataKey="distance"
                                    stroke="none"
                                    fill="url(#distanceGradient)"
                                    fillOpacity={1}
                                    isAnimationActive={true}
                                    animationDuration={1500}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-2 text-center text-sm text-muted-foreground">
                        <p>Total: <span className="font-semibold" style={{ color: distanceColor }}>{formatDistance(summary.totalDistance)}</span></p>                    </div>
                </CardContent>
            </Card>
                </div>
            </div>            {/* Gráficos de Passos e Tempo Ativo/Inativo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Gráfico de Passos */}
                    <Card className="overflow-hidden border-2 border-opacity-50 animate-slideIn opacity-0" style={{ borderColor: stepsColor, animationDelay: '0.3s' }}>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: stepsColor }}></span>
                            Passos
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {timeRange === 'day'
                                ? `Contagem de passos de ${selectedPet.name} durante o dia`
                                : timeRange === 'week'
                                    ? `Passos diários de ${selectedPet.name} na semana`
                                    : `Atividade mensal registrada para ${selectedPet.name}`}
                        </p>
                    </CardHeader>                    <CardContent>
                        <div className="h-[250px] chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={gpsData}
                                    margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
                                    barCategoryGap={4}
                                >
                                    <defs>
                                        <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={stepsColor} stopOpacity={0.8} />
                                            <stop offset="100%" stopColor={stepsColor} stopOpacity={0.3} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
                                    <XAxis
                                        dataKey={getXAxisLabel()}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        tickMargin={10}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        tickMargin={10}
                                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="steps"
                                        name="Passos"
                                        fill="url(#stepsGradient)"
                                        radius={[4, 4, 0, 0]}
                                        isAnimationActive={true}
                                        animationDuration={800}
                                        animationBegin={300}
                                        shadowColor="#44403c"
                                        shadowOpacity={0.05}
                                        shadowRadius={5}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-center text-sm text-muted-foreground">
                            <p>Total: <span className="font-semibold" style={{ color: stepsColor }}>{summary.totalSteps.toLocaleString()} passos</span></p>                            <p className="text-xs mt-1">                                {selectedPet.info.tipo.toLowerCase() === "cachorro" ?
                                    `Recomendação diária: ${selectedPet.info.raca.toLowerCase().includes('pequeno') ? '8.000-10.000' :
                                        selectedPet.info.raca.toLowerCase().includes('médio') ? '10.000-12.000' : '12.000-15.000'} passos` :
                                    `Média de ${Math.round(summary.totalSteps / (timeRange === "day" ? 1 : timeRange === "week" ? 7 : 30)).toLocaleString()} passos ${timeRange === "day" ? "hoje" : timeRange === "week" ? "por dia nesta semana" : "diários neste mês"}`}
                            </p>
                        </div>
                    </CardContent>
                </Card>                {/* Gráfico de Tempo Ativo/Inativo */}
                <Card className="overflow-hidden border-2 border-opacity-50 animate-slideIn opacity-0" style={{ borderColor: activeColor, animationDelay: '0.4s' }}>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center">
                                    <span className="h-4 w-4 rounded-full mr-1" style={{ backgroundColor: activeColor }}></span>
                                    <span className="mr-2 text-sm">Ativo</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="h-4 w-4 rounded-full mr-1" style={{ backgroundColor: inactiveColor }}></span>
                                    <span className="text-sm">Inativo</span>
                                </div>
                            </div>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Proporção entre tempo ativo e inativo de {selectedPet.name}
                        </p>
                    </CardHeader>                    <CardContent>
                        <div className="h-[250px] chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={gpsData}
                                    margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
                                    stackOffset="expand"
                                    barSize={timeRange === 'day' ? 15 : timeRange === 'week' ? 30 : 50}
                                    barGap={4}
                                >
                                    <defs>
                                        <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={activeColor} stopOpacity={0.9} />
                                            <stop offset="100%" stopColor={activeColor} stopOpacity={0.7} />
                                        </linearGradient>
                                        <linearGradient id="inactiveGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={inactiveColor} stopOpacity={0.8} />
                                            <stop offset="100%" stopColor={inactiveColor} stopOpacity={0.5} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
                                    <XAxis
                                        dataKey={getXAxisLabel()}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        tickMargin={10}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <YAxis
                                        tickFormatter={(value) => `${Math.round(value * 100)}%`}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        tickMargin={10}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        iconType="circle"
                                        iconSize={10}
                                        formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                                        wrapperStyle={{ paddingTop: 10 }}
                                    />
                                    <Bar
                                        stackId="time"
                                        name="Tempo Ativo"
                                        dataKey="active"
                                        fill="url(#activeGradient)"
                                        isAnimationActive={true}
                                        animationDuration={800}
                                        animationBegin={300}
                                        radius={[0, 0, 0, 0]}
                                    />
                                    <Bar
                                        stackId="time"
                                        name="Tempo Inativo"
                                        dataKey="inactive"
                                        fill="url(#inactiveGradient)"
                                        isAnimationActive={true}
                                        animationDuration={800}
                                        animationBegin={300}
                                        radius={[0, 0, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-center text-sm text-muted-foreground">
                            <div className="flex justify-center items-center gap-4">
                                <p>Ativo: <span className="font-semibold" style={{ color: activeColor }}>{formatTime(summary.totalActiveTime)}</span></p>
                                <p>Inativo: <span className="font-semibold" style={{ color: inactiveColor }}>{formatTime(summary.totalInactiveTime)}</span></p>
                            </div>
                            <p className="text-xs mt-2">
                                {summary.activityLevel === "ALTO"
                                    ? `Excelente! ${selectedPet.name} está com ótimo nível de atividade (${summary.activePercentage}%)`
                                    : summary.activityLevel === "MODERADO"
                                        ? `Boa atividade - ${selectedPet.name} está com nível moderado (${summary.activePercentage}%)`
                                        : `${selectedPet.name} poderia se beneficiar de mais atividade física (${summary.activePercentage}%)`
                                }
                            </p>                        </div>
                    </CardContent>
                </Card>
                </div>
            </div>            {/* Distribuição de Locais */}
                <div className="mb-6">
                <Card className="animate-slideIn opacity-0 shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4"style={{ animationDelay: '0.5s', borderLeftColor: locationColors[summary.locationCount[0]?.location || 'casa'] }}>
                <CardHeader className="pb-3 border-b">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="h-5 w-5 text-gray-700" />                        {selectedPet.info.tipo.toLowerCase() === "cachorro"
                            ? `Onde ${selectedPet.name} esteve ${timeRange === 'day' ? 'hoje' : timeRange === 'week' ? 'nesta semana' : 'neste mês'}`
                            : `Localização de ${selectedPet.name} ${timeRange === 'day' ? 'hoje' : timeRange === 'week' ? 'nesta semana' : 'neste mês'}`
                        }
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">                        {selectedPet.info.tipo.toLowerCase() === "cachorro"
                            ? `Rastreamento de locais frequentados por ${selectedPet.name} - Entenda onde seu pet passa mais tempo`
                            : `Áreas da casa frequentadas por ${selectedPet.name} - Conheça melhor os hábitos do seu gato`
                        }
                    </p>
                </CardHeader>                <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col justify-center">                            <div className="bg-gray-50 p-4 rounded-lg mb-4 border-l-4" style={{ borderLeftColor: locationColors[summary.locationCount[0]?.location || 'casa'] }}>
                                <h3 className="text-lg font-semibold mb-1">
                                    {selectedPet.name} {timeRange === 'day' ? 'passou o dia' : timeRange === 'week' ? 'passou a semana' : 'passou o mês'} principalmente em:
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    {summary.locationCount.length > 0 ? (
                                        <>
                                            <div className="h-5 w-5 rounded-full flex items-center justify-center" style={{ backgroundColor: locationColors[summary.locationCount[0].location] }}>
                                                {locationIcons[summary.locationCount[0].location]}
                                            </div>
                                            <span className="font-medium">{renderLocationName(summary.locationCount[0].location)}</span>
                                            <Badge variant="outline" style={{ backgroundColor: `${locationColors[summary.locationCount[0].location]}22` }}>
                                                {summary.locationCount[0].percentage}% do tempo
                                            </Badge>
                                        </>
                                    ) : (
                                        "Sem dados de localização disponíveis"
                                    )}
                                </div>
                            </div>
                            <div className="space-y-3 mt-2 animate-scaleIn opacity-0" style={{ animationDelay: '0.5s' }}>{summary.locationCount.map((location, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors border border-gray-100 hover:border-gray-200"
                                        style={{ animationDelay: `${0.5 + (index * 0.1)}s` }}
                                    >
                                        <div
                                            className="h-12 w-12 rounded-full flex items-center justify-center shadow-md"
                                            style={{
                                                backgroundColor: locationColors[location.location] || '#777777',
                                            }}
                                        >
                                            {locationIcons[location.location] || <MapPin size={16} color="#ffffff" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className="font-medium">{renderLocationName(location.location)}</p>
                                                <Badge
                                                    className="ml-2"
                                                    variant="outline"
                                                    style={{ backgroundColor: `${locationColors[location.location]}22` }}
                                                >
                                                    {location.percentage}%
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full"
                                                        style={{
                                                            width: `${location.percentage}%`,
                                                            backgroundColor: locationColors[location.location] || '#777777'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-xs text-muted-foreground">
                                                    {timeRange === 'day' ? `${location.count} ${location.count > 1 ? 'horas' : 'hora'}` :
                                                        timeRange === 'week' ? `${location.count} ${location.count > 1 ? 'dias' : 'dia'}` :
                                                            `${location.count} ${location.count > 1 ? 'semanas' : 'semana'}`}
                                                </p>

                                                {index === 0 && (
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                        Mais frequente
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>                        </div>
                    </div>
                </CardContent>
            </Card>            </div>

            {/* Informações específicas baseado no tipo de pet e nível de atividade */}
                <div className="mt-6">
                    <Card className="animate-slideIn opacity-0 shadow-md hover:shadow-lg transition-shadow duration-300" style={{ animationDelay: '0.6s', borderTop: '4px solid', borderColor: summary.activityLevel === "ALTO" ? "#3b82f6" : summary.activityLevel === "MODERADO" ? "#10b981" : "#f59e0b" }}>
                    <CardContent className="p-6">
                        {selectedPet.id === 1 ? (
                            <div className="text-sm">
                                <h3 className="font-bold mb-2">Sobre a atividade de {selectedPet.name}:</h3>
                                <p className="mb-2">
                                    Como uma cachorra {selectedPet.info.raca} de {selectedPet.info.idade} com <span className={`font-bold ${summary.activityLevel === "ALTO" ? "text-blue-600" :
                                        summary.activityLevel === "MODERADO" ? "text-green-600" : "text-amber-600"
                                        }`}>{summary.activityLevel}</span> nível de atividade
                                    ({summary.activePercentage}% do tempo) e peso de {selectedPet.info.peso}, {selectedPet.name} {
                                        summary.activityLevel === "ALTO" ? "está com bom nível de atividade, continue assim!" :
                                            "poderia se beneficiar de mais atividades físicas diárias."
                                    }
                                </p>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    {summary.activityLevel === "ALTO" ? (
                                        <>
                                            <li>Continue com os passeios diários: 2-3 vezes por dia, mantendo o ritmo atual</li>
                                            <li>Tempo ideal ao ar livre: cerca de 2 horas por dia, como você já vem fazendo</li>
                                            <li>Atividades diversificadas: explore novos locais de passeio para manter o interesse</li>
                                        </>
                                    ) : summary.activityLevel === "MODERADO" ? (
                                        <>
                                            <li>Aumente gradualmente os passeios: tente 2-3 vezes por dia para cachorro de {selectedPet.info.peso}</li>
                                            <li>Tempo recomendado ao ar livre: pelo menos 1,5 horas por dia</li>
                                            <li>Introduza brincadeiras mais intensas durante os passeios para estimular mais atividade</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>Incremente urgentemente os passeios: comece com 2 vezes por dia, aumentando a duração</li>
                                            <li>Tempo mínimo ao ar livre: pelo menos 1 hora por dia para melhorar o condicionamento</li>
                                            <li>Consulte um veterinário: níveis baixos de atividade podem indicar problemas de saúde</li>
                                        </>
                                    )}
                                    <li>Brincadeiras adequadas: jogos de buscar, correr e outras atividades para {selectedPet.info.raca}</li>
                                </ul>
                            </div>
                        ) : selectedPet.id === 3 ? (
                            <div className="text-sm">
                                <h3 className="font-bold mb-2">Sobre a atividade de {selectedPet.name}:</h3>
                                <p className="mb-2">
                                    Como um {selectedPet.info.raca} de {selectedPet.info.idade} com <span className={`font-bold ${summary.activityLevel === "ALTO" ? "text-blue-600" :
                                        summary.activityLevel === "MODERADO" ? "text-green-600" : "text-amber-600"
                                        }`}>{summary.activityLevel}</span> nível de atividade
                                    ({summary.activePercentage}% do tempo) e peso de {selectedPet.info.peso}, {selectedPet.name} {
                                        summary.activityLevel === "ALTO" ? "está muito ativo, ótimo trabalho!" :
                                            summary.activityLevel === "MODERADO" ? "está com um bom equilíbrio de atividade." :
                                                "precisa de mais estímulo para atividades."
                                    }
                                </p>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    {summary.activityLevel === "ALTO" ? (
                                        <>
                                            <li>Mantenha os passeios: o nível atual está excelente para um {selectedPet.info.raca}</li>
                                            <li>Controle de energia: intercale com períodos de descanso apropriados</li>
                                            <li>Monitoramento de peso: mesmo com alta atividade, monitore o peso de {selectedPet.info.peso}</li>
                                        </>
                                    ) : summary.activityLevel === "MODERADO" ? (
                                        <>
                                            <li>Mantenha os passeios diários: 2 vezes por dia está adequado para seu nível atual</li>
                                            <li>Tempo ao ar livre: cerca de 1 hora por dia, ideal para {selectedPet.info.raca}</li>
                                            <li>Exercícios específicos: natação e buscar são ótimas opções para Golden Retrievers</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>Aumente os passeios diários: tente 2 vezes por dia, consistentemente</li>
                                            <li>Consulte um veterinário: o baixo nível de atividade pode ser incomum para um {selectedPet.info.raca}</li>
                                            <li>Introduza novos estímulos: brinquedos e exercícios que despertem seu interesse</li>
                                        </>
                                    )}
                                    <li>Monitoramento de peso: importante para um {selectedPet.info.raca} de {selectedPet.info.idade}, manter entre 25-34kg</li>
                                </ul>
                            </div>
                        ) : (
                            <div className="text-sm">
                                <h3 className="font-bold mb-2">Sobre a atividade de {selectedPet.name}:</h3>
                                <p className="mb-2">
                                    Como um gato {selectedPet.info.raca} de {selectedPet.info.idade} com <span className={`font-bold ${summary.activityLevel === "ALTO" ? "text-blue-600" :
                                        summary.activityLevel === "MODERADO" ? "text-green-600" : "text-purple-600"
                                        }`}>{summary.activityLevel}</span> nível de atividade
                                    ({summary.activePercentage}% do tempo) e peso de {selectedPet.info.peso}, {selectedPet.name} {
                                        summary.activityLevel === "ALTO" ? "está surpreendentemente ativo para um gato!" :
                                            summary.activityLevel === "MODERADO" ? "tem um bom nível de atividade para um gato." :
                                                "está com um nível típico de gatos, que tendem a ser menos ativos."
                                    }
                                </p>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Padrão de atividade: mais ativo durante o amanhecer, entardecer e noite</li>
                                    {summary.activityLevel === "ALTO" ? (
                                        <li>Excelente atividade: continue oferecendo estímulos e brincadeiras interativas</li>
                                    ) : summary.activityLevel === "MODERADO" ? (
                                        <li>Bom nível: mantenha as brincadeiras diárias para manter esse padrão</li>
                                    ) : (
                                        <li>Estimule mais atividade: introduza brinquedos interativos e sessões de brincadeira</li>
                                    )}                                    <li>Controle de peso: {selectedPet.info.peso} está acima do ideal para um gato (em média 4-5kg) - considere mais atividades</li>
                                    <li>Ambiente seguro: mantenha-o em casa para proteger contra perigos externos</li>
                                    <li>Enriquecimento ambiental: brinquedos, arranhadores e pontos de observação elevados</li>                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
                </div>
            </div>
            </main>
        </div>
    );
};

export default GPSPage;
