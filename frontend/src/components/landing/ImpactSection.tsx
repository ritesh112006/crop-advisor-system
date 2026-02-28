import { useLanguage } from "@/i18n/LanguageContext";

export function ImpactSection() {
  const { t } = useLanguage();

  const stats = [
    { value: "140+", label: t("farmersHelped") },
    { value: "32%", label: t("avgIncomeIncrease") },
    { value: "94%", label: t("predictionAccuracy") },
    { value: "99+", label: t("supportedCrops") },
  ];

  return (
    <section className="bg-primary py-16">
      <div className="container">
        <h2 className="text-center font-heading text-3xl font-bold text-primary-foreground md:text-4xl">
          {t("ourImpact")}
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-heading text-3xl font-extrabold text-warning md:text-4xl">
                {s.value}
              </div>
              <div className="mt-2 text-sm text-primary-foreground/80">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
