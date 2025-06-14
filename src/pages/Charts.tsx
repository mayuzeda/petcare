import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PetLayout from "@/components/PetLayout";
import { usePet } from "@/contexts/PetContext";
import BackButton from "@/components/BackButton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { getPetHealthData, TimeRange, checkForAbnormalities } from "@/data/petCharts";

const Charts = () => {
    const { selectedPet } = usePet();
    const [timeRange, setTimeRange] = useState<TimeRange>("day");

    const healthData = getPetHealthData(selectedPet.id, timeRange);
    const abnormalityCheck = checkForAbnormalities(selectedPet.id, timeRange);

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

    // Cores para os gráficos
    const temperatureColor = "#ff6b6b";
    const heartRateColor = "#5c7cfa";
    const activityColor = "#7e22ce"; return (
        <PetLayout title={`Gráficos de ${selectedPet.name}`}>
            <div>
                <div className="mb-4 flex items-center justify-center">
                    <ToggleGroup type="single" value={timeRange} onValueChange={handleTimeRangeChange}>
                        <ToggleGroupItem value="day" aria-label="Toggle day">Dia</ToggleGroupItem>
                        <ToggleGroupItem value="week" aria-label="Toggle week">Semana</ToggleGroupItem>
                        <ToggleGroupItem value="month" aria-label="Toggle month">Mês</ToggleGroupItem>
                    </ToggleGroup>
                </div>

                {abnormalityCheck.hasAbnormality && (
                    <Alert variant="destructive" className="mb-6">
                        <TriangleAlert className="h-4 w-4" />
                        <AlertTitle>Alerta de Saúde</AlertTitle>
                        <AlertDescription>
                            {abnormalityCheck.message}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 gap-6">
                    {/* Gráfico de Temperatura */}
                    <Card >
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: temperatureColor }}></span>
                                Temperatura (°C)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px]">
                                <ResponsiveContainer className="-ml-6" width="100%" height="100%">
                                    <LineChart
                                        data={healthData}
                                        margin={{ top: 20, right: 0, left: 0, bottom: 10 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis
                                            dataKey={getXAxisLabel()}
                                            tick={{ fontSize: 10 }}
                                            tickMargin={10}
                                        />
                                        <YAxis
                                            domain={['dataMin - 1', 'dataMax + 1']}
                                            tick={{ fontSize: 10 }}
                                            tickMargin={10}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`${value}°C`, 'Temperatura']}
                                            labelFormatter={(label) => `${timeRange === 'day' ? 'Hora: ' : timeRange === 'week' ? 'Dia: ' : 'Data: '}${label}`}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="temperature"
                                            stroke={temperatureColor}
                                            strokeWidth={2}
                                            dot={{ r: 0 }}
                                            activeDot={{ r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gráfico de Batimentos Cardíacos */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: heartRateColor }}></span>
                                Batimentos Cardíacos (BPM)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px]">
                                <ResponsiveContainer className="-ml-6" width="100%" height="100%">
                                    <LineChart
                                        data={healthData}
                                        margin={{ top: 20, right: 0, left: 0, bottom: 10 }}

                                    >
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis
                                            dataKey={getXAxisLabel()}
                                            tick={{ fontSize: 10 }}
                                            tickMargin={10}
                                        />
                                        <YAxis
                                            domain={['dataMin - 10', 'dataMax + 10']}
                                            tick={{ fontSize: 10 }}
                                            tickMargin={10}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`${value} BPM`, 'Batimentos']}
                                            labelFormatter={(label) => `${timeRange === 'day' ? 'Hora: ' : timeRange === 'week' ? 'Dia: ' : 'Data: '}${label}`}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="heartRate"
                                            stroke={heartRateColor}
                                            strokeWidth={2}
                                            dot={{ r: 0 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gráfico de Atividade */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: activityColor }}></span>
                                Nível de Atividade (%)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px]">
                                <ResponsiveContainer className="-ml-6" width="100%" height="100%">
                                    <LineChart
                                        data={healthData}
                                        margin={{ top: 20, right: 0, left: 0, bottom: 10 }}

                                    >
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis
                                            dataKey={getXAxisLabel()}
                                            tick={{ fontSize: 10 }}
                                            tickMargin={10}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tick={{ fontSize: 10 }}
                                            tickMargin={10}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`${value}%`, 'Atividade']}
                                            labelFormatter={(label) => `${timeRange === 'day' ? 'Hora: ' : timeRange === 'week' ? 'Dia: ' : 'Data: '}${label}`}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="activity"
                                            stroke={activityColor}
                                            strokeWidth={2}
                                            dot={{ r: 0 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6 text-xs text-gray-500">
                    <p>Os dados são atualizados automaticamente a cada hora via coleira inteligente.</p>
                    <p className="mt-1">
                        Temperatura normal: {selectedPet.info.tipo === "Cachorro" ? "37.5-39.0°C" : "38.0-39.0°C"} |
                        Batimentos normais: {selectedPet.info.tipo === "Cachorro" ? "70-120 BPM" : "120-160 BPM"}
                    </p>
                </div>
            </div>
        </PetLayout>
    );
};

export default Charts;
