import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePet } from "@/contexts/PetContext";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Footprints, Timer, AlertTriangle, Activity, TrendingUp, Target } from "lucide-react";
import { PetLayout } from "./PetLayout";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { getPetGPSData, calculateGPSSummary, checkGPSAlerts, TimeRange } from "@/data/petGPS";

// Cores para os gráficos
const stepsColor = "#10b981";    // verde
const activeColor = "#8b5cf6";   // roxo
const inactiveColor = "#d1d5db"; // cinza
const caloriesColor = "#f59e0b"; // laranja

const ActivityPage = () => {
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

    // Formatar valores de tempo
    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins} min`;
    };

    // Calcular calorias estimadas (baseado em peso e atividade)
    const calculateCalories = (steps: number, weight: number) => {
        // Fórmula aproximada: 0.04 calorias por passo por kg
        return Math.round(steps * 0.04 * weight);
    };    // Customizar o conteúdo do tooltip
    const CustomTooltip = ({ active, payload, label }: {
        active?: boolean;
        payload?: Array<{
            name: string;
            value: number;
            color: string;
        }>;
        label?: string;
    }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border rounded-md shadow-lg">
                    <p className="font-bold text-gray-800 mb-2 border-b pb-1">
                        {timeRange === 'day' ? `Hora: ${label}` :
                            timeRange === 'week' ? `Dia: ${label}` :
                                `Data: ${label}`}
                    </p>
                    <div className="space-y-2">
                        {payload.map((entry, index: number) => (
                            <div
                                key={`item-${index}`}
                                className="flex items-center gap-2"
                            >
                                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                <span className="font-semibold">
                                    {entry.name === "steps"
                                        ? "Passos: "
                                        : entry.name === "active"
                                            ? "Tempo Ativo: "
                                            : entry.name === "inactive"
                                                ? "Tempo Inativo: "
                                                : `${entry.name}: `}
                                </span>
                                <span className="text-gray-700">
                                    {entry.name === "steps"
                                        ? entry.value.toLocaleString()
                                        : entry.name === "active" || entry.name === "inactive"
                                            ? formatTime(entry.value)
                                            : entry.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <PetLayout
            title={`Atividades - ${selectedPet.name}`}
            showBackButton={true}
        >
            <div className="w-full max-w-4xl space-y-6">
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

                {/* Alertas de atividade */}
                {alerts.hasAlerts && (
                    <Alert variant="destructive" className="border-l-4 border-l-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Alerta de Atividade</AlertTitle>
                        <AlertDescription>
                            {selectedPet.name} está com nível de atividade abaixo do esperado.
                            Considere aumentar os passeios ou brincadeiras.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Resumo de atividades */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    <Card className="shadow-md border-b-4 border-b-green-400">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total de Passos</p>
                                    <p className="text-2xl font-bold text-green-600">{summary.totalSteps.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Meta: 8.000 passos/dia
                                    </p>
                                </div>
                                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                                    <Footprints className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-b-4 border-b-purple-400">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tempo Ativo</p>
                                    <p className="text-2xl font-bold text-purple-600">{formatTime(summary.totalActiveTime)}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        vs. {formatTime(summary.totalInactiveTime)} inativo
                                    </p>
                                </div>
                                <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Timer className="h-8 w-8 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={`shadow-md border-b-4 ${summary.activityLevel === "ALTO" ? "border-b-blue-400" :
                        summary.activityLevel === "MODERADO" ? "border-b-green-400" :
                            "border-b-amber-400"
                        }`}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Nível de Atividade</p>
                                    <p className={`text-2xl font-bold ${summary.activityLevel === "ALTO" ? "text-blue-600" :
                                        summary.activityLevel === "MODERADO" ? "text-green-600" :
                                            "text-amber-600"
                                        }`}>
                                        {summary.activityLevel}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Baseado na média diária
                                    </p>
                                </div>
                                <div className={`h-14 w-14 rounded-full flex items-center justify-center ${summary.activityLevel === "ALTO" ? "bg-blue-100" :
                                    summary.activityLevel === "MODERADO" ? "bg-green-100" :
                                        "bg-amber-100"
                                    }`}>
                                    <Activity className={`h-8 w-8 ${summary.activityLevel === "ALTO" ? "text-blue-600" :
                                        summary.activityLevel === "MODERADO" ? "text-green-600" :
                                            "text-amber-600"
                                        }`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Gráfico de Passos */}
                <Card className="shadow-md border-2 border-green-100">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                            <span className="h-4 w-4 rounded-full bg-green-500"></span>
                            Passos ao Longo do Tempo
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {timeRange === 'day'
                                ? `Contagem de passos de ${selectedPet.name} durante o dia`
                                : timeRange === 'week'
                                    ? `Passos diários de ${selectedPet.name} na semana`
                                    : `Atividade mensal registrada para ${selectedPet.name}`}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={gpsData}>
                                    <defs>
                                        <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={stepsColor} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={stepsColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis
                                        dataKey={getXAxisLabel()}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="steps"
                                        stroke={stepsColor}
                                        strokeWidth={2}
                                        fill="url(#stepsGradient)"
                                        name="Passos"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-center text-sm text-muted-foreground">
                            <p>Total: <span className="font-semibold text-green-600">{summary.totalSteps.toLocaleString()} passos</span></p>
                        </div>
                    </CardContent>
                </Card>

                {/* Gráfico de Tempo Ativo/Inativo */}
                <Card className="shadow-md border-2 border-purple-100">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                            <div className="flex items-center gap-3">
                                <span className="h-4 w-4 rounded-full bg-purple-500"></span>
                                <span>Tempo Ativo</span>
                                <span className="h-4 w-4 rounded-full bg-gray-300"></span>
                                <span>Inativo</span>
                            </div>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Proporção entre tempo ativo e inativo de {selectedPet.name}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={gpsData}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis
                                        dataKey={getXAxisLabel()}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        tickFormatter={(value) => `${value}min`}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="active" stackId="time" fill={activeColor} name="Ativo" />
                                    <Bar dataKey="inactive" stackId="time" fill={inactiveColor} name="Inativo" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-center text-sm text-muted-foreground">
                            <div className="flex justify-center items-center gap-4">
                                <p>Ativo: <span className="font-semibold text-purple-600">{formatTime(summary.totalActiveTime)}</span></p>
                                <p>Inativo: <span className="font-semibold text-gray-600">{formatTime(summary.totalInactiveTime)}</span></p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Informações específicas baseado no tipo de pet */}
                <Card className="shadow-md border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-sm text-gray-700">
                                <p className="font-medium mb-1">
                                    Análise de Atividade - {selectedPet.name}
                                </p>
                                {selectedPet.id === 1 ? (
                                    <div>
                                        <p className="mb-2">
                                            Bella é uma cadela ativa que precisa de exercícios regulares.
                                            Seu nível atual de atividade está {summary.activityLevel.toLowerCase()}.
                                        </p>
                                        <p className="text-xs text-blue-600">
                                            💡 Dica: Passeios de manhã e tarde ajudam a manter Bella saudável e feliz.
                                        </p>
                                    </div>
                                ) : selectedPet.id === 3 ? (
                                    <div>
                                        <p className="mb-2">
                                            Thor é um cachorro energético que adora correr e brincar.
                                            Mantenha-o ativo com {summary.activityLevel === "BAIXO" ? "mais" : "os"} exercícios diários.
                                        </p>
                                        <p className="text-xs text-blue-600">
                                            💡 Dica: Brincadeiras no parque são ideais para Thor gastar energia.
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="mb-2">
                                            Dom é um gato que precisa de estímulos para se exercitar.
                                            Brinquedos interativos podem aumentar sua atividade.
                                        </p>
                                        <p className="text-xs text-blue-600">
                                            💡 Dica: Sessões de brincadeira de 10-15 minutos, 2-3 vezes ao dia são ideais.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PetLayout>
    );
};

export default ActivityPage;
