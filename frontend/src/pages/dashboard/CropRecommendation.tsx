import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Brain, ChevronRight, Zap, FlaskConical, Leaf, Thermometer, CloudRain } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const soilTypes = ["Alluvial", "Black", "Red", "Laterite", "Sandy", "Clay"];
const seasons = ["Kharif", "Rabi", "Zaid"];
const irrigationTypes = ["Rainfed", "Canal", "Drip", "Sprinkler", "Tube Well"];

// Sensor readings — in production fetched from IoT API
const sensorDefaults = {
  nitrogen: "72",
  phosphorus: "38",
  potassium: "46",
  temperature: "28",
  rainfall: "85",
};

function SelectField({ label, options, value, onChange, required = false, t }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void; required?: boolean; t: (k: string) => string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">{t("select")}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function SensorField({ label, value, onChange, icon: Icon, iconColor, unit, readOnly = false }: {
  label: string; value: string; onChange: (v: string) => void; icon: any; iconColor: string; unit?: string; readOnly?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
        {label}
        {readOnly && (
          <span className="ml-1 rounded bg-blue-100 px-1 text-[10px] font-bold text-blue-600">AUTO</span>
        )}
        {unit && <span className="text-muted-foreground">({unit})</span>}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${readOnly ? "bg-muted/40 border-blue-200" : "bg-background"}`}
      />
    </div>
  );
}

function CropTile({ crop, onSelect }: { crop: any; onSelect: (crop: any) => void }) {
  const { t } = useLanguage();
  const riskColor =
    crop.risk === "Low" ? "text-green-600 bg-green-100"
      : crop.risk === "Medium" ? "text-amber-600 bg-amber-100"
        : "text-red-600 bg-red-100";

  return (
    <div
      onClick={() => onSelect(crop)}
      className="cursor-pointer rounded-xl border bg-card p-5 shadow-card transition-all hover:shadow-lg hover:border-primary hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-heading text-lg font-bold text-primary">{crop.crop}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{t("confidence")}: {crop.confidence}%</p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${riskColor}`}>
          {crop.risk}
        </span>
      </div>

      {/* Confidence bar */}
      <div className="mb-3 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${crop.confidence}%` }}
        />
      </div>

      <div className="space-y-1.5">
        {[
          [t("expectedYield"), crop.yield],
          [t("marketPrice"), crop.price, "text-primary font-bold"],
          [t("sowingPeriod"), crop.sowing],
        ].map(([label, val, extra]) => (
          <div key={String(label)} className="flex justify-between text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className={`font-semibold ${extra || ""}`}>{val}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
        {t("viewDetails") || "View Details"} <ChevronRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

const mockRecs = [
  {
    crop: "Wheat (गेहूं)",
    confidence: 92, yield: "45 quintals/ha", price: "₹2,450/q",
    risk: "Low", fertilizer: "DAP + Urea (120kg/ha)", sowing: "Oct – Nov", harvest: "Mar – Apr",
  },
  {
    crop: "Rice (चावल)",
    confidence: 88, yield: "55 quintals/ha", price: "₹2,400/q",
    risk: "Low", fertilizer: "NPK 15:15:15", sowing: "Jun – Jul", harvest: "Oct – Nov",
  },
  {
    crop: "Maize (मक्का)",
    confidence: 85, yield: "40 quintals/ha", price: "₹1,900/q",
    risk: "Medium", fertilizer: "Urea 200kg/ha", sowing: "Apr – May", harvest: "Aug – Sep",
  },
  {
    crop: "Soybean (सोयाबीन)",
    confidence: 78, yield: "20 quintals/ha", price: "₹4,500/q",
    risk: "Medium", fertilizer: "SSP + Potash", sowing: "Jun – Jul", harvest: "Sep – Oct",
  },
];

export default function CropRecommendation() {
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Compulsory
  const [soilType, setSoilType] = useState("");
  const [season, setSeason] = useState("");

  // Optional
  const [landSize, setLandSize] = useState("");
  const [irrigationType, setIrrigationType] = useState("");

  // Auto from sensors / weather
  const [nitrogen, setNitrogen] = useState(sensorDefaults.nitrogen);
  const [phosphorus, setPhosphorus] = useState(sensorDefaults.phosphorus);
  const [potassium, setPotassium] = useState(sensorDefaults.potassium);
  const [temperature, setTemperature] = useState(sensorDefaults.temperature);
  const [rainfall, setRainfall] = useState(sensorDefaults.rainfall);

  // Load from weather API if key is present
  useEffect(() => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    if (!apiKey) return;
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${apiKey}&units=metric`
        );
        const data = await res.json();
        if (data.main?.temp) setTemperature(Math.round(data.main.temp).toString());
        if (data.rain?.["1h"]) setRainfall((data.rain["1h"] * 30).toFixed(0));
      } catch { }
    });
  }, []);

  const handleRecommend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soilType || !season) return;
    setRecommendations(mockRecs);
  };

  const handleSelectCrop = (crop: any) => {
    setSelectedCrop(crop);
    setShowDetails(true);
    // Save to localStorage for My Crops and Market Analysis
    const existing: any[] = (() => {
      try { return JSON.parse(localStorage.getItem("selectedCrops") || "[]"); } catch { return []; }
    })();
    const exists = existing.find((c: any) => c.crop === crop.crop);
    if (!exists) {
      const updated = [...existing, crop].slice(0, 4);
      localStorage.setItem("selectedCrops", JSON.stringify(updated));
    } else {
      setShowDetails(true);
    }
  };

  if (showDetails && selectedCrop) {
    return (
      <div className="space-y-6">
        <Button onClick={() => setShowDetails(false)} variant="outline" className="gap-2">
          ← {t("back") || "Back"}
        </Button>
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-3xl font-bold text-primary">{selectedCrop.crop}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t("confidence")}: {selectedCrop.confidence}%</p>
              <p className="text-xs text-green-600 font-medium mt-0.5">✓ {t("addedToMyCrops") || "Added to My Crops"}</p>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="font-heading text-base font-semibold mb-3">{t("basicInformation") || "Basic Information"}</h3>
              <div className="space-y-2">
                {[
                  [t("expectedYield"), selectedCrop.yield],
                  [t("marketPrice"), selectedCrop.price],
                  [t("riskLevel"), selectedCrop.risk],
                  [t("sowingPeriod"), selectedCrop.sowing],
                  [t("harvestTime"), selectedCrop.harvest],
                  [t("fertilizer"), selectedCrop.fertilizer],
                ].map(([label, val]) => (
                  <div key={String(label)} className="flex justify-between rounded-lg bg-muted px-3 py-2">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <h3 className="font-heading font-semibold mb-2">{t("fertilizer") || "Fertilizer Plan"}</h3>
                <p className="text-sm">{selectedCrop.fertilizer}</p>
              </div>
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <h3 className="font-heading font-semibold mb-2">{t("sensorReadings") || "Your Soil Profile Used"}</h3>
                <div className="space-y-1 text-sm">
                  <p>Nitrogen: {nitrogen} mg/kg | Phosphorus: {phosphorus} mg/kg | Potassium: {potassium} mg/kg</p>
                  <p>Temperature: {temperature}°C | Rainfall: {rainfall} mm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold flex items-center gap-2">
        <Brain className="h-6 w-6 text-primary" />
        {t("aiCropRecommendationTab")}
      </h2>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input form */}
        <form onSubmit={handleRecommend} className="space-y-5 rounded-xl border bg-card p-6 shadow-card">
          {/* Compulsory section */}
          <div>
            <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-3">
              ★ {t("compulsoryFields") || "Required Fields"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label={t("soilType")} options={soilTypes} value={soilType} onChange={setSoilType} required t={t} />
              <SelectField label={t("season")} options={seasons} value={season} onChange={setSeason} required t={t} />
            </div>
          </div>

          {/* Auto-filled sensor data */}
          <div>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-3">
              🔬 {t("sensorAutoFilled") || "Auto-Filled from Sensors & Weather"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <SensorField label={t("nitrogen")} value={nitrogen} onChange={setNitrogen} icon={Zap} iconColor="text-amber-500" unit="mg/kg" readOnly />
              <SensorField label={t("phosphorus")} value={phosphorus} onChange={setPhosphorus} icon={FlaskConical} iconColor="text-orange-500" unit="mg/kg" readOnly />
              <SensorField label={t("potassium")} value={potassium} onChange={setPotassium} icon={Leaf} iconColor="text-green-600" unit="mg/kg" readOnly />
              <SensorField label={t("temp")} value={temperature} onChange={setTemperature} icon={Thermometer} iconColor="text-red-500" unit="°C" readOnly />
              <SensorField label={t("rainfallMm")} value={rainfall} onChange={setRainfall} icon={CloudRain} iconColor="text-blue-500" unit="mm" readOnly />
            </div>
          </div>

          {/* Optional fields */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              {t("optionalFields") || "Optional"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("landSize")}</label>
                <input
                  type="number"
                  value={landSize}
                  onChange={(e) => setLandSize(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <SelectField label={t("irrigationType")} options={irrigationTypes} value={irrigationType} onChange={setIrrigationType} t={t} />
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={!soilType || !season}>
            <Brain className="h-4 w-4" />
            {t("recommendBestCrop")}
          </Button>
          {(!soilType || !season) && (
            <p className="text-xs text-center text-red-400">{t("fillRequiredFields") || "Please select Soil Type and Season to continue"}</p>
          )}
        </form>

        {/* 2x2 crop tiles */}
        {recommendations.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {recommendations.map((rec, idx) => (
              <CropTile key={idx} crop={rec} onSelect={handleSelectCrop} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-12 gap-3 text-center">
            <Brain className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">{t("fillFormGetSuggestions")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
