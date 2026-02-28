import { Brain, TrendingUp, CloudSun, Bug, Calculator, Landmark } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

export function FeatureCards() {
  const { t } = useLanguage();

  const features = [
    { icon: Brain, title: t("aiCropRec"), description: t("aiCropRecDesc"), href: "/dashboard/recommendation" },
    { icon: TrendingUp, title: t("marketIntel"), description: t("marketIntelDesc"), href: "/market" },
    { icon: CloudSun, title: t("weatherAlerts"), description: t("weatherAlertsDesc"), href: "/dashboard/weather" },
    { icon: Bug, title: t("diseaseDetection"), description: t("diseaseDetectionDesc"), href: "/dashboard/disease" },
    { icon: Calculator, title: t("profitCalc"), description: t("profitCalcDesc"), href: "/market" },
    { icon: Landmark, title: t("govtSchemesFeature"), description: t("govtSchemesFeatureDesc"), href: "/schemes" },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <h2 className="text-center font-heading text-3xl font-bold text-foreground md:text-4xl">
          {t("featuresTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          {t("featuresSubtitle")}
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Link
              to={f.href}
              key={f.title}
              className="group rounded-lg border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              <span className="mt-4 inline-block text-sm font-medium text-primary group-hover:underline">
                {t("learnMore")}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
