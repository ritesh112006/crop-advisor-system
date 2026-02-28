import { useState } from "react";
import {
    Bell, Droplets, FlaskConical, Bug, CloudLightning, Thermometer,
    AlertTriangle, CheckCircle2, Info, Filter, Clock, ChevronDown, ChevronUp
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

type Severity = "high" | "medium" | "low";
type AlertCategory = "water" | "fertilizer" | "pest" | "weather" | "all";

interface Alert {
    id: number;
    category: AlertCategory;
    severity: Severity;
    titleKey: string;
    descKey: string;
    actionKey: string;
    timestamp: string;
    icon: any;
}

const alerts: Alert[] = [
    {
        id: 1,
        category: "water",
        severity: "high",
        titleKey: "alertWater1Title",
        descKey: "alertWater1Desc",
        actionKey: "alertWater1Action",
        timestamp: "2 hours ago",
        icon: Droplets,
    },
    {
        id: 2,
        category: "fertilizer",
        severity: "medium",
        titleKey: "alertFertilizer1Title",
        descKey: "alertFertilizer1Desc",
        actionKey: "alertFertilizer1Action",
        timestamp: "5 hours ago",
        icon: FlaskConical,
    },
    {
        id: 3,
        category: "pest",
        severity: "high",
        titleKey: "alertPest1Title",
        descKey: "alertPest1Desc",
        actionKey: "alertPest1Action",
        timestamp: "Yesterday",
        icon: Bug,
    },
    {
        id: 4,
        category: "weather",
        severity: "medium",
        titleKey: "alertWeather1Title",
        descKey: "alertWeather1Desc",
        actionKey: "alertWeather1Action",
        timestamp: "1 day ago",
        icon: CloudLightning,
    },
    {
        id: 5,
        category: "water",
        severity: "low",
        titleKey: "alertWater2Title",
        descKey: "alertWater2Desc",
        actionKey: "alertWater2Action",
        timestamp: "2 days ago",
        icon: Droplets,
    },
    {
        id: 6,
        category: "fertilizer",
        severity: "low",
        titleKey: "alertFertilizer2Title",
        descKey: "alertFertilizer2Desc",
        actionKey: "alertFertilizer2Action",
        timestamp: "3 days ago",
        icon: FlaskConical,
    },
    {
        id: 7,
        category: "pest",
        severity: "medium",
        titleKey: "alertPest2Title",
        descKey: "alertPest2Desc",
        actionKey: "alertPest2Action",
        timestamp: "4 days ago",
        icon: Bug,
    },
    {
        id: 8,
        category: "weather",
        severity: "low",
        titleKey: "alertWeather2Title",
        descKey: "alertWeather2Desc",
        actionKey: "alertWeather2Action",
        timestamp: "5 days ago",
        icon: Thermometer,
    },
];

const alertDefaultText: Record<string, string> = {
    alertWater1Title: "⚠️ Critical: Irrigation Required",
    alertWater1Desc:
        "Soil moisture sensor reading is at 32% — well below the critical threshold of 45%. Your wheat crop is showing early signs of water stress. Immediate irrigation is strongly recommended to prevent yield loss.",
    alertWater1Action:
        "Start drip irrigation immediately for 2 hours. Apply 25–30 mm of water. Schedule next irrigation check in 24 hours.",
    alertFertilizer1Title: "📊 Phosphorus Level Low",
    alertFertilizer1Desc:
        "Soil sensor detected Phosphorus (P) at 28 mg/kg, below the optimal range of 30–55 mg/kg. This may affect root development and early crop growth if not corrected within the next week.",
    alertFertilizer1Action:
        "Apply Single Super Phosphate (SSP) @ 125 kg/acre. Incorporate at 5–6 cm soil depth. Best time: early morning or evening. Next check in 7 days.",
    alertPest1Title: "🐛 Pest Alert: Aphid Infestation Detected",
    alertPest1Desc:
        "Visual and sensor data indicates possible aphid activity in the north-east field section. Aphids can cause significant yield loss if not treated within 48–72 hours. Early infestation stage — best time for intervention.",
    alertPest1Action:
        "Spray 2 mL/L Imidacloprid solution or use Neem Oil (3%). Apply during early morning (6–8 AM). Repeat after 7 days if infestation persists.",
    alertWeather1Title: "🌧️ Heavy Rainfall Expected",
    alertWeather1Desc:
        "Weather forecast indicates heavy rainfall (40–60 mm) expected in the next 2–3 days. This may cause waterlogging in low-lying areas. Avoid pesticide or fertilizer application during this period.",
    alertWeather1Action:
        "Ensure proper field drainage. Delay any scheduled fertilizer application by 4 days. Monitor for disease outbreaks post-rain (fungal infections increase in humid conditions).",
    alertWater2Title: "💧 Scheduled Irrigation Reminder",
    alertWater2Desc:
        "Routine irrigation due based on your crop's growth stage (Tillering — Day 32). Moderate soil moisture at 50% — normal irrigation schedule to maintain.",
    alertWater2Action:
        "Apply 20 mm of water via canal/drip. Monitor moisture levels 12 hours after irrigation. Adjust schedule if rainfall occurs.",
    alertFertilizer2Title: "🌿 Urea Top-Dressing Due",
    alertFertilizer2Desc:
        "Based on crop growth stage (30 days after sowing), your wheat crop requires top-dressing with Nitrogen (Urea). This is the critical growth stage for tiller formation.",
    alertFertilizer2Action:
        "Apply Urea @ 65 kg/acre as top dressing. Apply on moist soil (after light rain/irrigation). Do not apply in standing water.",
    alertPest2Title: "🔍 Monitor for Brown Plant Hopper",
    alertPest2Desc:
        "Weather conditions (high humidity 72%, temperature 28°C) are conducive to Brown Plant Hopper (BPH) development. Prophylactic monitoring recommended.",
    alertPest2Action:
        "Inspect crop canopy twice weekly. Use yellow sticky traps for early detection. If >10 BPH/hill observed, apply recommended pesticide (Buprofezin 25 SC).",
    alertWeather2Title: "🌡️ Temperature Advisory",
    alertWeather2Desc:
        "Daytime temperatures expected to reach 34–36°C over the next 5 days. High temperatures may affect pollen viability in flowering crops. Irrigation during early morning can help manage heat stress.",
    alertWeather2Action:
        "Irrigate during 5–7 AM to reduce heat stress on crop. Apply foliar spray of 2% KNO3 if flowering stage. Avoid field operations during peak heat (12–3 PM).",
};

const severityConfig: Record<Severity, { label: string; color: string; bg: string; border: string; icon: any }> = {
    high: { label: "High", color: "text-red-700", bg: "bg-red-100", border: "border-red-300", icon: AlertTriangle },
    medium: { label: "Medium", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-300", icon: Info },
    low: { label: "Low", color: "text-blue-700", bg: "bg-blue-100", border: "border-blue-300", icon: CheckCircle2 },
};

const categoryIcons: Record<string, any> = {
    water: Droplets,
    fertilizer: FlaskConical,
    pest: Bug,
    weather: CloudLightning,
    all: Bell,
};

function AlertCard({ alert }: { alert: Alert }) {
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState(alert.severity === "high");
    const sev = severityConfig[alert.severity];
    const SevIcon = sev.icon;
    const AlertIcon = alert.icon;

    const translated_title = t(alert.titleKey as any);
    const title = (translated_title !== alert.titleKey) ? translated_title : (alertDefaultText[alert.titleKey] || alert.titleKey);
    const translated_desc = t(alert.descKey as any);
    const desc = (translated_desc !== alert.descKey) ? translated_desc : (alertDefaultText[alert.descKey] || alert.descKey);
    const translated_action = t(alert.actionKey as any);
    const action = (translated_action !== alert.actionKey) ? translated_action : (alertDefaultText[alert.actionKey] || alert.actionKey);

    return (
        <div className={`rounded-xl border ${sev.border} bg-card shadow-card overflow-hidden`}>
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full text-left p-4 flex items-start gap-3"
            >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${sev.bg}`}>
                    <AlertIcon className={`h-5 w-5 ${sev.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading text-sm font-bold">{title}</h3>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${sev.bg} ${sev.color}`}>
                            <SevIcon className="h-3 w-3" />
                            {sev.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                    </div>
                </div>
                {expanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                )}
            </button>

            {expanded && (
                <div className="px-4 pb-4 space-y-3 border-t">
                    <p className="text-sm text-muted-foreground pt-3">{desc}</p>
                    <div className={`rounded-lg ${sev.bg} border ${sev.border} p-3`}>
                        <p className="text-xs font-semibold mb-1 uppercase tracking-wide">{t("recommendedAction") || "Recommended Action"}</p>
                        <p className={`text-sm ${sev.color} font-medium`}>{action}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AlertsPage() {
    const { t } = useLanguage();
    const [activeCategory, setActiveCategory] = useState<AlertCategory>("all");

    const categories: { key: AlertCategory; label: string; icon: any }[] = [
        { key: "all", label: t("all") || "All", icon: Bell },
        { key: "water", label: t("water") || "Water", icon: Droplets },
        { key: "fertilizer", label: t("fertilizer") || "Fertilizer", icon: FlaskConical },
        { key: "pest", label: t("pestAlerts") || "Pest", icon: Bug },
        { key: "weather", label: t("weather") || "Weather", icon: CloudLightning },
    ];

    const filtered = activeCategory === "all"
        ? alerts
        : alerts.filter((a) => a.category === activeCategory);

    const highCount = alerts.filter((a) => a.severity === "high").length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
                    <Bell className="h-6 w-6 text-primary" />
                    {t("alerts")}
                </h2>
                {highCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        {highCount} {t("highPriority") || "High Priority"}
                    </span>
                )}
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                {categories.map((cat) => {
                    const CatIcon = cat.icon;
                    const isActive = activeCategory === cat.key;
                    return (
                        <button
                            key={cat.key}
                            onClick={() => setActiveCategory(cat.key)}
                            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${isActive
                                ? "bg-primary text-primary-foreground"
                                : "border bg-card text-muted-foreground hover:bg-muted"
                                }`}
                        >
                            <CatIcon className="h-3.5 w-3.5" />
                            {cat.label}
                            <span className={`rounded-full px-1.5 ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"} text-xs`}>
                                {cat.key === "all" ? alerts.length : alerts.filter((a) => a.category === cat.key).length}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Alert list */}
            <div className="space-y-3">
                {filtered.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-400 mb-3" />
                    <p className="font-heading text-lg font-semibold text-muted-foreground">
                        {t("noAlerts") || "No alerts in this category"}
                    </p>
                </div>
            )}
        </div>
    );
}
