import { useState } from "react";
import {
    FileText, TrendingUp, TrendingDown, Droplets, FlaskConical,
    Leaf, Activity, Download, Calendar, BarChart3
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";

// Simulated last-month report data
const reportData = {
    period: "February 2026",
    soilHealthStatus: "Good",
    soilHealthScore: 78,

    npkAvg: { n: 68, p: 35, k: 47 },
    moistureAvg: 52,
    phAvg: 6.7,
    tempAvg: 26.4,
    humidityAvg: 65,

    // Weekly averages for sparklines (4 weeks)
    weeklyNitrogen: [72, 69, 65, 68],
    weeklyPhosphorus: [38, 36, 33, 35],
    weeklyPotassium: [50, 48, 45, 47],
    weeklyMoisture: [58, 55, 48, 52],
    weeklyPh: [6.8, 6.7, 6.7, 6.6],

    recommendations: [
        "Apply Urea (50 kg/acre) in the first week of March to replenish Nitrogen levels.",
        "Phosphorus within acceptable range — no immediate action needed.",
        "Consider soil aeration to improve moisture retention in the lower field sections.",
        "pH is slightly declining — consider lime application (150 kg/acre) if it drops below 6.5.",
        "Overall crop health is Good — continue current irrigation schedule.",
    ],
};

function SoilStatusBadge({ status, score }: { status: string; score: number }) {
    const color =
        score >= 75 ? "bg-green-100 text-green-700 border-green-300"
            : score >= 50 ? "bg-amber-100 text-amber-700 border-amber-300"
                : "bg-red-100 text-red-700 border-red-300";
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-bold ${color}`}>
            {status} ({score}/100)
        </span>
    );
}

// Simple SVG bar chart
function BarChart({ data, color, label }: { data: number[]; color: string; label: string }) {
    const max = Math.max(...data, 1);
    const width = 200;
    const height = 60;
    const barWidth = width / data.length - 6;

    return (
        <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <svg width={width} height={height} className="overflow-visible">
                {data.map((val, i) => {
                    const barHeight = (val / max) * (height - 10);
                    const x = i * (barWidth + 6);
                    const y = height - barHeight;
                    return (
                        <g key={i}>
                            <rect x={x} y={y} width={barWidth} height={barHeight} rx={3} fill={color} opacity={0.85} />
                            <text x={x + barWidth / 2} y={height + 12} textAnchor="middle" fontSize={9} fill="#6b7280">
                                W{i + 1}
                            </text>
                            <text x={x + barWidth / 2} y={y - 2} textAnchor="middle" fontSize={9} fill={color}>
                                {val}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

function MetricRow({
    label, value, unit, trend, icon: Icon, iconColor
}: {
    label: string; value: string | number; unit?: string; trend?: "up" | "down" | "stable";
    icon: any; iconColor: string;
}) {
    return (
        <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2.5">
            <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${iconColor}`} />
                <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold">
                    {value}{unit && <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
                </span>
                {trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-green-600" />}
                {trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
            </div>
        </div>
    );
}

export default function ReportsPage() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<"monthly" | "trends">("monthly");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    {t("reports")}
                </h2>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
                    <Download className="h-4 w-4" />
                    {t("downloadReport") || "Download PDF"}
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {[
                    { key: "monthly", label: t("monthlyReport") || "Monthly Report", icon: Calendar },
                    { key: "trends", label: t("trendAnalysis") || "Trend Analysis", icon: BarChart3 },
                ].map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key as any)}
                        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${activeTab === key
                                ? "bg-primary text-primary-foreground"
                                : "border bg-card text-muted-foreground hover:bg-muted"
                            }`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === "monthly" && (
                <>
                    {/* Report Header */}
                    <div className="rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <h3 className="font-heading text-xl font-bold">
                                    {t("soilHealthReport") || "Soil Health Report"}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">{reportData.period}</span>
                                </div>
                            </div>
                            <SoilStatusBadge status={reportData.soilHealthStatus} score={reportData.soilHealthScore} />
                        </div>
                    </div>

                    {/* Soil Averages */}
                    <div className="rounded-xl border bg-card p-5 shadow-card space-y-3">
                        <h3 className="font-heading text-base font-semibold flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            {t("monthlyAverages") || "Monthly Averages"}
                        </h3>
                        <MetricRow icon={FlaskConical} iconColor="text-amber-500" label={t("nitrogen") || "Nitrogen (N)"} value={reportData.npkAvg.n} unit="mg/kg" trend="stable" />
                        <MetricRow icon={FlaskConical} iconColor="text-orange-500" label={t("phosphorus") || "Phosphorus (P)"} value={reportData.npkAvg.p} unit="mg/kg" trend="down" />
                        <MetricRow icon={Leaf} iconColor="text-green-600" label={t("potassium") || "Potassium (K)"} value={reportData.npkAvg.k} unit="mg/kg" trend="stable" />
                        <MetricRow icon={Droplets} iconColor="text-blue-500" label={t("soilMoisture") || "Soil Moisture"} value={`${reportData.moistureAvg}%`} trend="down" />
                        <MetricRow icon={FlaskConical} iconColor="text-purple-500" label={t("phLevel") || "Soil pH"} value={reportData.phAvg} trend="down" />
                        <MetricRow icon={Activity} iconColor="text-red-500" label={t("avgTemperature") || "Avg Temperature"} value={`${reportData.tempAvg}°C`} trend="up" />
                        <MetricRow icon={Droplets} iconColor="text-sky-500" label={t("avgHumidity") || "Avg Humidity"} value={`${reportData.humidityAvg}%`} trend="stable" />
                    </div>

                    {/* Recommendations */}
                    <div className="rounded-xl border bg-card p-5 shadow-card">
                        <h3 className="font-heading text-base font-semibold flex items-center gap-2 mb-4">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            {t("recommendations") || "Recommendations"}
                        </h3>
                        <ul className="space-y-2">
                            {reportData.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                        {i + 1}
                                    </span>
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}

            {activeTab === "trends" && (
                <div className="space-y-5">
                    <div className="rounded-xl border bg-card p-5 shadow-card">
                        <h3 className="font-heading text-base font-semibold mb-4 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary" />
                            {t("weeklyTrends") || "Weekly Trends (February 2026)"}
                        </h3>
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            <BarChart data={reportData.weeklyNitrogen} color="#f59e0b" label="Nitrogen (mg/kg)" />
                            <BarChart data={reportData.weeklyPhosphorus} color="#f97316" label="Phosphorus (mg/kg)" />
                            <BarChart data={reportData.weeklyPotassium} color="#22c55e" label="Potassium (mg/kg)" />
                            <BarChart data={reportData.weeklyMoisture} color="#3b82f6" label="Moisture (%)" />
                            <BarChart data={reportData.weeklyPh.map(v => v * 10)} color="#a855f7" label="pH (×10)" />
                        </div>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm font-semibold text-amber-800 mb-1">
                            {t("trendInsight") || "Key Trend Insights"}
                        </p>
                        <ul className="space-y-1 text-xs text-amber-700">
                            <li>• Phosphorus declining steadily — fertilization recommended before Week 1 of March.</li>
                            <li>• Soil moisture dropped in Week 3 due to dry spell — irrigation helped recovery in Week 4.</li>
                            <li>• pH trending slightly downward — monitor closely over next month.</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
