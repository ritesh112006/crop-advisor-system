import { useEffect, useState } from "react";
import {
  CloudSun, TrendingUp, Bug, Calculator, Droplets, Thermometer, Wind,
  Zap, FlaskConical, Leaf, Activity, Heart, AlertTriangle, Umbrella
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

// Simulated sensor data (in production, fetched from IoT backend)
const sensorData = {
  nitrogen: 72,
  phosphorus: 38,
  potassium: 46,
  temperature: 28.4,
  humidity: 68,
  moisture: 55,
  ph: 6.8,
};

const healthScore = 82; // 0-100 overall crop health

const marketData = [
  { crop: "wheat", price: "₹2,450/q", change: "+3.2%" },
  { crop: "rice", price: "₹3,120/q", change: "-1.4%" },
  { crop: "cotton", price: "₹7,800/q", change: "+5.1%" },
];

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
  bg,
  status,
}: {
  icon: any;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  bg: string;
  status?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-card hover:shadow-md transition-shadow">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground truncate">{label}</div>
        <div className="font-heading text-lg font-bold">
          {value}
          {unit && <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
        </div>
        {status && <div className="text-xs text-muted-foreground">{status}</div>}
      </div>
    </div>
  );
}

function HealthScoreRing({ score }: { score: number }) {
  const { t } = useLanguage();
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color =
    score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <circle
          cx="65"
          cy="65"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="65" y="60" textAnchor="middle" className="fill-foreground" fontSize="24" fontWeight="bold" fill="currentColor">
          {score}
        </text>
        <text x="65" y="78" textAnchor="middle" fontSize="11" fill="#6b7280">
          / 100
        </text>
      </svg>
      <span className="text-sm font-semibold" style={{ color }}>
        {score >= 75 ? t("healthGood") || "Good" : score >= 50 ? t("healthFair") || "Fair" : t("healthPoor") || "Poor"}
      </span>
    </div>
  );
}

function WeatherWidget() {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    if (!apiKey) {
      // Mock data if no API key
      setWeather({
        temp: 28,
        humidity: 68,
        rainChance: 15,
        windSpeed: 12,
        description: "Partly Cloudy",
        city: "Your Location",
      });
      setLoading(false);
      return;
    }

    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${apiKey}&units=metric`
          );
          const data = await res.json();
          const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${apiKey}&units=metric&cnt=8`
          );
          const forecastData = await forecastRes.json();
          const rainChance =
            forecastData.list?.reduce((max: number, item: any) => {
              const pop = (item.pop || 0) * 100;
              return Math.max(max, pop);
            }, 0) || 0;

          setWeather({
            temp: Math.round(data.main.temp),
            humidity: data.main.humidity,
            rainChance: Math.round(rainChance),
            windSpeed: Math.round(data.wind.speed * 3.6),
            description: data.weather[0]?.description || "Cloudy",
            city: data.name,
          });
        } catch {
          setWeather({ temp: 28, humidity: 68, rainChance: 15, windSpeed: 12, description: "Partly Cloudy", city: "Unknown" });
        }
        setLoading(false);
      },
      () => {
        setWeather({ temp: 28, humidity: 68, rainChance: 15, windSpeed: 12, description: "Partly Cloudy", city: "Unknown" });
        setLoading(false);
      }
    );
  }, []);

  if (loading)
    return (
      <div className="rounded-xl border bg-card p-5 shadow-card animate-pulse h-36" />
    );

  return (
    <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-950 dark:to-sky-900 p-5 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <CloudSun className="h-5 w-5 text-sky-500" />
        <h3 className="font-heading text-sm font-semibold">{t("weather")} — {weather?.city}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Thermometer, label: t("temperature"), val: `${weather?.temp}°C`, color: "text-red-500" },
          { icon: Droplets, label: t("humidity"), val: `${weather?.humidity}%`, color: "text-blue-500" },
          { icon: Umbrella, label: t("rainChance"), val: `${weather?.rainChance}%`, color: "text-sky-500" },
          { icon: Wind, label: t("windSpeed"), val: `${weather?.windSpeed} km/h`, color: "text-purple-500" },
        ].map(({ icon: Icon, label, val, color }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${color}`} />
            <div>
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="font-bold text-sm">{val}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground capitalize">{weather?.description}</p>
    </div>
  );
}

export default function DashboardOverview() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold">{t("welcomeBack")}</h2>

      {/* Weather Widget */}
      <WeatherWidget />

      {/* Sensor Data Section */}
      <div>
        <h3 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          {t("sensorReadings") || "Sensor Readings"}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Zap} label={`${t("nitrogen") || "Nitrogen"} (N)`} value={sensorData.nitrogen} unit="mg/kg" color="text-amber-600" bg="bg-amber-50" status="Optimal: 60–90" />
          <StatCard icon={FlaskConical} label={`${t("phosphorus") || "Phosphorus"} (P)`} value={sensorData.phosphorus} unit="mg/kg" color="text-orange-500" bg="bg-orange-50" status="Optimal: 30–55" />
          <StatCard icon={Leaf} label={`${t("potassium") || "Potassium"} (K)`} value={sensorData.potassium} unit="mg/kg" color="text-green-600" bg="bg-green-50" status="Optimal: 40–60" />
          <StatCard icon={FlaskConical} label={t("phLevel") || "Soil pH"} value={sensorData.ph} color="text-purple-600" bg="bg-purple-50" status="Optimal: 6.0–7.5" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-3">
          <StatCard icon={Droplets} label={t("soilMoisture") || "Soil Moisture"} value={`${sensorData.moisture}%`} color="text-blue-600" bg="bg-blue-50" status="Good level" />
          <StatCard icon={Thermometer} label={`${t("temperature")} (DHT22)`} value={`${sensorData.temperature}°C`} color="text-red-500" bg="bg-red-50" status="Ambient" />
          <StatCard icon={Droplets} label={`${t("humidity")} (DHT22)`} value={`${sensorData.humidity}%`} color="text-sky-600" bg="bg-sky-50" status="Good" />
        </div>
      </div>

      {/* Crop Health + Market + Profit */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Crop Health Score */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            <h3 className="font-heading text-sm font-semibold">{t("overallCropHealth") || "Overall Crop Health"}</h3>
          </div>
          <div className="flex items-center justify-center">
            <HealthScoreRing score={healthScore} />
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("diseaseRisk")}</span>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">{t("low")} — 12%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("nextFertilizer")}</span>
              <span className="font-medium text-sm">{t("inDays")}</span>
            </div>
          </div>
        </div>

        {/* Market prices */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-heading text-sm font-semibold">{t("marketPricesTab")}</h3>
          </div>
          <div className="space-y-3">
            {marketData.map((m) => (
              <div key={m.crop} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                <span className="text-sm font-medium">{t(m.crop as any)}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold">{m.price}</div>
                  <div className={`text-xs ${m.change.startsWith("+") ? "text-green-600" : "text-red-500"}`}>
                    {m.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profit summary */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-accent" />
            <h3 className="font-heading text-sm font-semibold">{t("profitSummaryTab")}</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: t("investment"), val: "₹45,000" },
              { label: t("estRevenue"), val: "₹78,000" },
              { label: t("netProfit"), val: "₹33,000", highlight: true, positive: true },
              { label: t("roi"), val: "73.3%", highlight: true, positive: true },
            ].map(({ label, val, highlight, positive }) => (
              <div key={label} className="flex justify-between rounded-lg bg-muted px-3 py-2">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className={`text-sm font-bold ${highlight ? (positive ? "text-primary" : "text-destructive") : ""}`}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">{t("alertBannerTitle") || "Action Required"}</p>
          <p className="text-xs text-amber-700 mt-1">{t("alertBannerDesc") || "Soil moisture is dropping — consider irrigation in the next 2 days. Phosphorus levels slightly below optimal — schedule fertilizer application."}</p>
        </div>
      </div>
    </div>
  );
}
