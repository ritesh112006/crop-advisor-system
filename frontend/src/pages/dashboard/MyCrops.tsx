import { useEffect, useState } from "react";
import { Wheat, Calendar, Droplets, TrendingUp, AlertTriangle, ChevronRight, Leaf, Trash2, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const cropColors: Record<string, { bg: string; text: string; border: string }> = {
    default: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    wheat: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    rice: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
    maize: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
    soybean: { bg: "bg-lime-50", text: "text-lime-700", border: "border-lime-200" },
    cotton: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    sugarcane: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
};

function getColorTheme(cropName: string) {
    const name = cropName.toLowerCase();
    for (const key of Object.keys(cropColors)) {
        if (name.includes(key)) return cropColors[key];
    }
    return cropColors.default;
}

function CropCard({ crop, onRemove }: { crop: any; onRemove: () => void }) {
    const { t } = useLanguage();
    const [confirmRemove, setConfirmRemove] = useState(false);
    const theme = getColorTheme(crop.crop || "");
    const riskColor =
        crop.riskLevel === "Low" || crop.risk === "Low"
            ? "text-green-600 bg-green-100"
            : crop.riskLevel === "Medium" || crop.risk === "Medium"
                ? "text-amber-600 bg-amber-100"
                : "text-red-600 bg-red-100";
    const riskVal = crop.riskLevel || crop.risk || "Medium";

    return (
        <div className={`rounded-xl border ${theme.border} bg-card p-5 shadow-card hover:shadow-md transition-all relative`}>
            {/* Remove button */}
            {!confirmRemove ? (
                <button
                    onClick={() => setConfirmRemove(true)}
                    className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Remove crop"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            ) : (
                <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button
                        onClick={onRemove}
                        className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-red-600 transition-colors"
                    >
                        Remove
                    </button>
                    <button
                        onClick={() => setConfirmRemove(false)}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-muted hover:bg-muted/80"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            )}

            <div className="flex items-start justify-between mb-4 pr-8">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${theme.bg}`}>
                    <Wheat className={`h-6 w-6 ${theme.text}`} />
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${riskColor}`}>
                    {riskVal} {t("riskLevel") || "Risk"}
                </span>
            </div>

            <h3 className={`font-heading text-xl font-bold ${theme.text} mb-1`}>{crop.crop}</h3>
            <p className="text-xs text-muted-foreground mb-4">{t("confidence") || "Confidence"}: {crop.confidence}%</p>

            <div className="space-y-2">
                <InfoRow icon={<TrendingUp className="h-3.5 w-3.5" />} label={t("expectedYield") || "Expected Yield"} value={crop.expectedYield || crop.yield || "N/A"} />
                <InfoRow icon={<TrendingUp className="h-3.5 w-3.5 text-green-600" />} label={t("marketPrice") || "Market Price"} value={crop.marketPrice ? `₹${crop.marketPrice}/q` : crop.price || "N/A"} colored />
                <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label={t("sowingPeriod") || "Sowing Period"} value={crop.sowingPeriod || crop.sowing || "N/A"} />
                <InfoRow icon={<Calendar className="h-3.5 w-3.5 text-amber-500" />} label={t("harvestTime") || "Harvest Time"} value={crop.harvestTime || crop.harvest || "N/A"} />
                <InfoRow icon={<Droplets className="h-3.5 w-3.5 text-blue-500" />} label={t("fertilizer") || "Fertilizer"} value={crop.fertilizer || "N/A"} />
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value, colored = false }: { icon: React.ReactNode; label: string; value: string; colored?: boolean }) {
    return (
        <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {icon}
                <span>{label}</span>
            </div>
            <span className={`text-xs font-semibold ${colored ? "text-primary" : ""}`}>{value}</span>
        </div>
    );
}

export default function MyCrops() {
    const { t } = useLanguage();
    const [crops, setCrops] = useState<any[]>([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("selectedCrops");
            if (stored) {
                const parsed = JSON.parse(stored);
                setCrops(Array.isArray(parsed) ? parsed : [parsed]);
            }
        } catch {
            setCrops([]);
        }
    }, []);

    const handleRemove = (idx: number) => {
        const updated = crops.filter((_, i) => i !== idx);
        setCrops(updated);
        localStorage.setItem("selectedCrops", JSON.stringify(updated));
    };

    if (crops.length === 0) {
        return (
            <div className="space-y-6">
                <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
                    <Leaf className="h-6 w-6 text-primary" />
                    {t("myCrops")}
                </h2>
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-16 text-center gap-4">
                    <Wheat className="h-16 w-16 text-muted-foreground/40" />
                    <div>
                        <p className="font-heading text-lg font-semibold text-muted-foreground">
                            {t("noCropsSelected") || "No crops selected yet"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t("noCropsDesc") || "Go to AI Crop Recommendation to get crop suggestions based on your soil and weather data."}
                        </p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link to="/dashboard/recommendation">
                            {t("aiCropRecommendationTab") || "AI Crop Recommendation"}
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
                    <Leaf className="h-6 w-6 text-primary" />
                    {t("myCrops")}
                    <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-normal text-primary">{crops.length}</span>
                </h2>
                <Button asChild variant="outline" size="sm">
                    <Link to="/dashboard/recommendation">{t("updateCrops") || "Update Crops"}</Link>
                </Button>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <p className="text-xs text-green-700">
                    {crops.length} {t("cropsFromAI") || "crop(s) selected from AI Recommendation. These are the best matches for your soil and climate conditions."}
                    &nbsp;Click <strong>🗑 Trash</strong> icon on a crop card to remove it.
                </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-2">
                {crops.map((crop, idx) => (
                    <CropCard key={idx} crop={crop} onRemove={() => handleRemove(idx)} />
                ))}
            </div>
        </div>
    );
}
