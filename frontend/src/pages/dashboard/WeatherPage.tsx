import { CloudSun, Droplets, Thermometer, Wind, AlertTriangle, Umbrella } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const forecastDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const forecastData = [
  { temp: "29°C", rain: "10%", icon: CloudSun },
  { temp: "31°C", rain: "5%", icon: CloudSun },
  { temp: "27°C", rain: "45%", icon: Umbrella },
  { temp: "26°C", rain: "60%", icon: Umbrella },
  { temp: "28°C", rain: "30%", icon: CloudSun },
  { temp: "30°C", rain: "15%", icon: CloudSun },
  { temp: "32°C", rain: "5%", icon: CloudSun },
];

export default function WeatherPage() {
  const { t } = useLanguage();

  // Translate day names based on language
  const translateDayName = (dayShort: string) => {
    const dayMap: { [key: string]: string } = {
      'Mon': t('monday') || 'Mon',
      'Tue': t('tuesday') || 'Tue',
      'Wed': t('wednesday') || 'Wed',
      'Thu': t('thursday') || 'Thu',
      'Fri': t('friday') || 'Fri',
      'Sat': t('saturday') || 'Sat',
      'Sun': t('sunday') || 'Sun',
    };
    return dayMap[dayShort] || dayShort;
  };

  const forecast = forecastDays.map((day, idx) => ({
    day: translateDayName(day),
    ...forecastData[idx],
  }));

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold">{t("weatherIntelligence")}</h2>

      {/* Current weather */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <WeatherCard icon={Thermometer} label={t("temperature")} value="28°C" sub={`${t("feelsLike")} 31°C`} color="text-destructive" />
        <WeatherCard icon={Droplets} label={t("humidity")} value="72%" sub={t("highMoisture")} color="text-secondary" />
        <WeatherCard icon={Umbrella} label={t("rainChance")} value="15%" sub={t("lowChance")} color="text-primary" />
        <WeatherCard icon={Wind} label={t("windSpeed")} value="12 km/h" sub={t("nwDirection")} color="text-accent" />
      </div>

      {/* 7 day forecast */}
      <div className="rounded-lg border bg-card p-5 shadow-card">
        <h3 className="font-heading text-sm font-semibold mb-4">{t("sevenDayForecast")}</h3>
        <div className="grid grid-cols-7 gap-2">
          {forecast.map((d, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1 rounded-lg bg-muted p-3 text-center">
              <span className="text-xs font-medium text-muted-foreground">{d.day}</span>
              <d.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold">{d.temp}</span>
              <span className="text-xs text-muted-foreground">{d.rain}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="rounded-lg border border-warning/30 bg-warning/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h3 className="font-heading text-sm font-semibold">{t("weatherAdvisories")}</h3>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• {t("heavyRainfallWarning")}</li>
          <li>• {t("goodSowingConditions")}</li>
          <li>• {t("noHeatwaveRisk")}</li>
        </ul>
      </div>
    </div>
  );
}

function WeatherCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-card">
      <div className="flex items-center gap-3">
        <Icon className={`h-8 w-8 ${color}`} />
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-heading text-xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{sub}</div>
        </div>
      </div>
    </div>
  );
}
